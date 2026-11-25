/* =====================================================================
   Carrinho: estado, persistência, gaveta, finalização pelo WhatsApp
   ===================================================================== */
(function () {
  'use strict';

  var A = window.Acai;
  var D = A.dados;
  var CHAVE = 'acai-batido-na-hora:pedido:v1';

  var estado = { itens: [], pedidoId: '', cliente: { nome: '', recebimento: D.loja.entrega ? 'entrega' : 'retirada', endereco: '', pagamento: D.loja.formasPagamento[0] || '', troco: '', obs: '' } };

  /* ---------- Modelo de item ---------- */
  // cfg: { produtoId, tamanhoId, adicionais: [ids], removidos: [nomes], obs, qtd }
  function montarItem(cfg, linha) {
    var p = A.produto(cfg.produtoId);
    if (!p || p.disponivel === false) return null;
    var t = A.tamanho(p, cfg.tamanhoId);
    var extras = (cfg.adicionais || []).map(function (id) {
      var a = A.adicional(id);
      return a && a.disponivel !== false ? { id: a.id, nome: a.nome, preco: a.preco } : null;
    }).filter(Boolean);
    var inclusos = p.personalizavel ? A.qtdInclusos(p, t) : 0;
    if (!p.personalizavel) extras = [];
    extras = A.marcarInclusos(extras, inclusos);
    return {
      linha: linha || A.uid(),
      produtoId: p.id,
      nome: p.nome,
      imagem: p.imagem,
      tamanhoId: t.id,
      tamanhoRotulo: A.rotuloTamanho(t),
      precoBase: t.preco,
      ingredientes: p.ingredientes || [],
      removidos: (cfg.removidos || []).filter(function (r) { return (p.ingredientes || []).indexOf(r) >= 0; }),
      adicionais: extras,
      inclusos: inclusos,
      obs: String(cfg.obs || '').trim().slice(0, 200),
      qtd: Math.min(99, Math.max(1, parseInt(cfg.qtd, 10) || 1)),
      personalizavel: !!p.personalizavel,
    };
  }
  // valores calculados em centavos e convertidos só no fim
  function centUnit(it) {
    return A.centavos(it.precoBase) + it.adicionais.reduce(function (s, a) { return s + (a.incluso ? 0 : A.centavos(a.preco)); }, 0);
  }
  function precoUnit(it) { return centUnit(it) / 100; }
  function assinatura(it) {
    return [it.produtoId, it.tamanhoId, it.adicionais.map(function (a) { return a.id; }).sort().join(','),
      it.removidos.slice().sort().join(','), it.obs].join('|');
  }
  function cfgDe(it) {
    return { produtoId: it.produtoId, tamanhoId: it.tamanhoId, adicionais: it.adicionais.map(function (a) { return a.id; }), removidos: it.removidos, obs: it.obs, qtd: it.qtd };
  }

  function novoPedidoId() { return Math.random().toString(36).slice(2, 6).toUpperCase(); }

  /* ---------- Persistência ---------- */
  function carregar() {
    var salvo = A.storage.get(CHAVE, null);
    if (!salvo) return;
    // refaz cada item com os preços atuais de dados.js
    estado.itens = (salvo.itens || []).map(function (it) { return montarItem(it, it.linha); }).filter(Boolean);
    if (salvo.cliente) Object.assign(estado.cliente, salvo.cliente);
    estado.pedidoId = estado.itens.length ? (salvo.pedidoId || novoPedidoId()) : '';
  }
  function salvar() {
    A.storage.set(CHAVE, { itens: estado.itens.map(function (it) { var c = cfgDe(it); c.linha = it.linha; return c; }), cliente: estado.cliente, pedidoId: estado.pedidoId });
  }

  /* ---------- Cálculos ---------- */
  function quantidade() { return estado.itens.reduce(function (s, it) { return s + it.qtd; }, 0); }
  function centSubtotal() { return estado.itens.reduce(function (s, it) { return s + centUnit(it) * it.qtd; }, 0); }
  function centEntrega() {
    if (estado.cliente.recebimento !== 'entrega') return 0;
    return typeof D.loja.taxaEntrega === 'number' ? A.centavos(D.loja.taxaEntrega) : 0;
  }
  function subtotal() { return centSubtotal() / 100; }
  function total() { return (centSubtotal() + centEntrega()) / 100; }

  /* ---------- API pública ---------- */
  var api = {
    adicionar: function (cfg) {
      var novo = montarItem(cfg);
      if (!novo) return null;
      if (!estado.pedidoId || !estado.itens.length) estado.pedidoId = novoPedidoId();
      var igual = estado.itens.find(function (it) { return assinatura(it) === assinatura(novo); });
      if (igual) igual.qtd = Math.min(99, igual.qtd + novo.qtd);
      else estado.itens.push(novo);
      mudou('adicionar');
      return igual || novo;
    },
    substituir: function (linha, cfg) {
      var i = estado.itens.findIndex(function (it) { return it.linha === linha; });
      var novo = montarItem(cfg, linha);
      if (i < 0 || !novo) return;
      estado.itens[i] = novo;
      mudou('editar');
    },
    alterarQtd: function (linha, delta) {
      var it = estado.itens.find(function (x) { return x.linha === linha; });
      if (!it) return;
      it.qtd += delta;
      if (it.qtd <= 0) return api.remover(linha);
      it.qtd = Math.min(99, it.qtd);
      mudou('qtd');
    },
    remover: function (linha) {
      estado.itens = estado.itens.filter(function (it) { return it.linha !== linha; });
      mudou('remover');
    },
    limpar: function () { estado.itens = []; estado.pedidoId = ''; mudou('limpar'); },
    item: function (linha) { return estado.itens.find(function (it) { return it.linha === linha; }); },
    cfgDe: cfgDe,
    precoUnit: precoUnit,
    itens: function () { return estado.itens.slice(); },
    quantidade: quantidade,
    total: total,
    abrir: function () { renderCorpo(); A.abrirDialog(dlg); },
    fechar: function () { A.fecharDialog(dlg); },
    mensagem: mensagemWhats,
  };
  A.carrinho = api;

  function mudou(acao) {
    salvar();
    if (dlg && dlg.open) renderCorpo();
    atualizarIndicadores(acao === 'adicionar');
    A.emit('carrinho', acao);
  }

  /* ---------- Indicadores (navbar e botão flutuante) ---------- */
  function atualizarIndicadores(animar) {
    var qtd = quantidade();
    document.body.classList.toggle('tem-itens', qtd > 0);
    document.querySelectorAll('[data-carrinho-qtd]').forEach(function (el) {
      el.textContent = qtd;
      if (el.closest('.nav__carrinho')) el.hidden = qtd === 0;
      if (animar) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
    document.querySelectorAll('[data-carrinho-total]').forEach(function (el) { el.textContent = A.preco(total()); });
    var flutuante = document.querySelector('.carrinho-flutuante');
    if (flutuante) flutuante.hidden = qtd === 0;
    document.querySelectorAll('.nav__carrinho').forEach(function (b) {
      b.setAttribute('aria-label', 'Abrir pedido, ' + qtd + (qtd === 1 ? ' item' : ' itens'));
    });
  }

  /* ---------- Gaveta ---------- */
  var dlg, corpo, rodape, lista, form;

  function detalhesItem(it) {
    var linhas = [];
    var ingr = it.ingredientes.filter(function (n) { return it.removidos.indexOf(n) < 0; });
    if (ingr.length) linhas.push('<span>Ingredientes: ' + A.esc(ingr.join(', ')) + '</span>');
    if (it.removidos.length) linhas.push('<span>Sem: ' + A.esc(it.removidos.join(', ')) + '</span>');
    if (it.adicionais.length) {
      linhas.push('<span>Adicionais: <b>' + it.adicionais.map(function (a) { return A.esc(a.nome) + (a.incluso ? ' (incluso)' : ' (+' + A.preco(a.preco) + ')'); }).join(', ') + '</b></span>');
    }
    if (it.obs) linhas.push('<span>Obs.: ' + A.esc(it.obs) + '</span>');
    return linhas.join('');
  }

  function htmlItem(it) {
    var unit = precoUnit(it);
    return '<li class="item" data-linha="' + it.linha + '">' +
      A.img(it.imagem, 'produto', '72px', 'class="item__foto" alt="" width="72" height="72" loading="lazy"') +
      '<div class="item__info">' +
        '<div class="item__topo"><p class="item__nome">' + A.esc(it.nome) + ' <span class="tag-tamanho">' + A.esc(it.tamanhoRotulo) + '</span></p>' +
        '<p class="item__preco">' + A.preco(unit * it.qtd) + '</p></div>' +
        '<div class="item__detalhes">' + detalhesItem(it) + '</div>' +
        '<div class="item__acoes">' +
          '<div class="stepper">' +
            '<button type="button" data-acao="menos" aria-label="Diminuir quantidade de ' + A.esc(it.nome) + '">' + A.icone('menos') + '</button>' +
            '<output aria-live="polite">' + it.qtd + '</output>' +
            '<button type="button" data-acao="mais" aria-label="Aumentar quantidade de ' + A.esc(it.nome) + '">' + A.icone('mais') + '</button>' +
          '</div>' +
          '<span class="item__unit">' + A.preco(unit) + ' cada</span>' +
          '<div class="item__links">' +
            (it.personalizavel ? '<button type="button" data-acao="editar">' + A.icone('editar') + 'Editar</button>' : '') +
            '<button type="button" class="remover" data-acao="remover">' + A.icone('lixo') + 'Remover</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</li>';
  }

  function htmlTotais() {
    var entregaTxt = '';
    if (estado.cliente.recebimento === 'entrega') {
      entregaTxt = '<div><dt>Entrega</dt><dd>' + (typeof D.loja.taxaEntrega === 'number' ? A.preco(D.loja.taxaEntrega) : 'A combinar') + '</dd></div>';
    } else {
      entregaTxt = '<div><dt>Retirada no balcão</dt><dd>' + A.preco(0) + '</dd></div>';
    }
    return '<dl class="totais">' +
      '<div><dt>Subtotal (' + quantidade() + (quantidade() === 1 ? ' item' : ' itens') + ')</dt><dd>' + A.preco(subtotal()) + '</dd></div>' +
      entregaTxt +
      '<div class="totais__final"><dt>Total</dt><dd>' + A.preco(total()) + '</dd></div>' +
    '</dl>';
  }

  function renderCorpo() {
    var vazio = estado.itens.length === 0;
    if (vazio) {
      lista.innerHTML = '<div class="vazio"><span class="vazio__ico">' + A.icone('carrinho') + '</span>' +
        '<p>Seu pedido está vazio.<br>Escolha um açaí no cardápio ou monte o seu.</p>' +
        '<button class="btn btn--primario" type="button" data-ir="#cardapio">Ver cardápio</button></div>';
    } else {
      lista.innerHTML = '<ul class="itens">' + estado.itens.map(htmlItem).join('') + '</ul>' + htmlTotais();
    }
    form.hidden = vazio;
    renderRodape();
  }

  // O rodapé é criado uma vez e só tem atributos atualizados depois.
  // Recriar o botão durante um clique (ex.: ao sair de um campo) faria o toque se perder.
  function montarRodape() {
    rodape.innerHTML =
      '<a class="btn btn--whats btn--lg btn--bloco" id="finalizar" target="_blank" rel="noopener">' +
        A.icone('whats') + ' Finalizar pedido pelo WhatsApp</a>' +
      '<p class="nota-whats" id="nota-whats"></p>' +
      '<button class="btn btn--contorno btn--bloco" type="button" data-fechar>Continuar comprando</button>';
  }

  function renderRodape() {
    var vazio = estado.itens.length === 0;
    var fin = rodape.querySelector('#finalizar');
    if (vazio) {
      fin.removeAttribute('href');
      fin.setAttribute('aria-disabled', 'true');
    } else {
      fin.href = A.linkWhats(mensagemWhats());
      fin.removeAttribute('aria-disabled');
    }
    rodape.querySelector('#nota-whats').textContent = vazio
      ? 'Adicione itens para finalizar.'
      : 'Total ' + A.preco(total()) + '. O WhatsApp abre com a mensagem pronta e você confirma o envio.';
  }

  /* ---------- Dados do cliente ---------- */
  function htmlCheckout() {
    var c = estado.cliente;
    var receb = '';
    if (D.loja.entrega && D.loja.retirada) {
      receb = '<fieldset class="campo"><legend>Como você quer receber?</legend><div class="opcoes-linha">' +
        '<label class="opcao-radio"><input type="radio" name="recebimento" value="entrega"' + (c.recebimento === 'entrega' ? ' checked' : '') + '><span>Entrega</span></label>' +
        '<label class="opcao-radio"><input type="radio" name="recebimento" value="retirada"' + (c.recebimento === 'retirada' ? ' checked' : '') + '><span>Retirar no balcão</span></label>' +
      '</div></fieldset>';
    }
    var pag = D.loja.formasPagamento.map(function (f) {
      return '<option' + (c.pagamento === f ? ' selected' : '') + '>' + A.esc(f) + '</option>';
    }).join('');
    return '<p class="checkout__titulo">Seus dados para o pedido</p>' +
      '<div class="campo" data-campo="nome"><label for="c-nome">Seu nome</label><input id="c-nome" name="nome" autocomplete="name" value="' + A.esc(c.nome) + '"><p class="campo__erro" hidden>Escreva seu nome.</p></div>' +
      receb +
      '<div class="campo" data-campo="endereco"' + (c.recebimento === 'entrega' ? '' : ' hidden') + '><label for="c-endereco">Endereço de entrega</label><textarea id="c-endereco" name="endereco" autocomplete="street-address" placeholder="Rua, número, bairro e ponto de referência">' + A.esc(c.endereco) + '</textarea><p class="campo__erro" hidden>Escreva o endereço de entrega.</p></div>' +
      '<div class="campo"><label for="c-pagamento">Forma de pagamento</label><select id="c-pagamento" name="pagamento">' + pag + '</select></div>' +
      '<div class="campo" data-campo="troco"' + (/dinheiro/i.test(c.pagamento) ? '' : ' hidden') + '><label for="c-troco">Troco para quanto? (opcional)</label><input id="c-troco" name="troco" inputmode="decimal" placeholder="Ex.: 50" value="' + A.esc(c.troco) + '"></div>' +
      '<div class="campo"><label for="c-obs">Observações do pedido (opcional)</label><textarea id="c-obs" name="obs" placeholder="Ex.: interfone com defeito, sem colher">' + A.esc(c.obs) + '</textarea></div>';
  }

  function lerCheckout() {
    var fd = new FormData(form);
    ['nome', 'endereco', 'pagamento', 'troco', 'obs', 'recebimento'].forEach(function (k) {
      if (fd.has(k)) estado.cliente[k] = String(fd.get(k)).trim();
    });
  }

  function validar() {
    var ok = true, primeiro = null;
    function marcar(nome, erro) {
      var campo = form.querySelector('[data-campo="' + nome + '"]');
      if (!campo) return;
      campo.classList.toggle('tem-erro', erro);
      campo.querySelector('.campo__erro').hidden = !erro;
      var input = campo.querySelector('input, textarea');
      input.setAttribute('aria-invalid', String(erro));
      if (erro && !primeiro) primeiro = input;
      if (erro) ok = false;
    }
    marcar('nome', !estado.cliente.nome);
    marcar('endereco', estado.cliente.recebimento === 'entrega' && !estado.cliente.endereco);
    if (primeiro) { primeiro.scrollIntoView({ block: 'center', behavior: 'smooth' }); primeiro.focus({ preventScroll: true }); }
    return ok;
  }

  /* ---------- Mensagem do WhatsApp ---------- */
  function formatarTroco(v) {
    var n = parseFloat(String(v || '').replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
    return isFinite(n) && n > 0 ? A.preco(n) : '';
  }

  function mensagemWhats() {
    var c = estado.cliente;
    var agora = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    var qtd = quantidade();
    var L = ['Olá! Gostaria de fazer meu pedido.', '',
      '*Pedido nº ' + (estado.pedidoId || '----') + '* · ' + agora,
      qtd + (qtd === 1 ? ' item' : ' itens'), ''];
    estado.itens.forEach(function (it) {
      var unit = centUnit(it);
      var linha = '*' + it.qtd + 'x ' + it.nome + ' (' + it.tamanhoRotulo + ')*: ' + A.preco(unit * it.qtd / 100);
      if (it.qtd > 1) linha += ' (' + A.preco(unit / 100) + ' cada)';
      L.push(linha);
      it.ingredientes.forEach(function (n) { if (it.removidos.indexOf(n) < 0) L.push('- ' + n); });
      it.adicionais.forEach(function (a) {
        L.push('- ' + a.nome + (a.incluso ? ' (adicional incluso)' : ' (adicional, +' + A.preco(a.preco) + ')'));
      });
      if (it.inclusos && !it.adicionais.length) L.push('- ' + it.inclusos + ' adicionais inclusos: escolher no atendimento');
      it.removidos.forEach(function (n) { L.push('- Sem ' + n.toLowerCase()); });
      if (it.obs) L.push('- Obs.: ' + it.obs);
      L.push('');
    });
    L.push('Subtotal: ' + A.preco(subtotal()));
    if (c.recebimento === 'entrega') L.push('Entrega: ' + (typeof D.loja.taxaEntrega === 'number' ? A.preco(D.loja.taxaEntrega) : 'taxa a combinar'));
    L.push('*Total: ' + A.preco(total()) + '*', '');
    if (c.nome) L.push('Nome: ' + c.nome);
    L.push('Receber: ' + (c.recebimento === 'entrega' ? 'Entrega' : 'Retirada no balcão'));
    if (c.recebimento === 'entrega' && c.endereco) L.push('Endereço: ' + c.endereco.replace(/\s*\n\s*/g, ', '));
    if (c.pagamento) {
      var troco = /dinheiro/i.test(c.pagamento) ? formatarTroco(c.troco) : '';
      L.push('Pagamento: ' + c.pagamento + (troco ? ' (troco para ' + troco + ')' : ''));
    }
    if (c.obs) L.push('Observações: ' + c.obs);
    L.push('', 'Gostaria de confirmar meu pedido.');
    return L.join('\n');
  }

  /* ---------- Eventos ---------- */
  function init() {
    dlg = document.getElementById('carrinho');
    corpo = document.getElementById('carrinho-corpo');
    rodape = document.getElementById('carrinho-rodape');
    if (!dlg) return;
    A.prepararDialog(dlg);

    corpo.innerHTML = (D.loja.modoDemonstracao ? '<p class="aviso-demo aviso-demo--carrinho">Modo demonstração: preços de exemplo.</p>' : '') +
      '<div id="carrinho-lista"></div><form class="checkout" id="checkout" novalidate></form>';
    lista = document.getElementById('carrinho-lista');
    form = document.getElementById('checkout');
    form.innerHTML = htmlCheckout();
    montarRodape();

    carregar();
    atualizarIndicadores(false);

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-abrir-carrinho]')) api.abrir();
    });

    lista.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.ir) { api.fechar(); setTimeout(function () { A.irPara(btn.dataset.ir); }, 300); return; }
      var li = btn.closest('[data-linha]');
      if (!li) return;
      var linha = li.dataset.linha;
      var acao = btn.dataset.acao;
      if (acao === 'mais') api.alterarQtd(linha, 1);
      if (acao === 'menos') {
        var it = api.item(linha);
        if (it && it.qtd === 1) { removerAnimado(li, linha); return; }
        api.alterarQtd(linha, -1);
      }
      if (acao === 'remover') removerAnimado(li, linha);
      if (acao === 'editar') A.emit('editar-item', api.item(linha));
    });

    form.addEventListener('input', function (e) {
      lerCheckout();
      if (e.target.name === 'recebimento') {
        form.querySelector('[data-campo="endereco"]').hidden = estado.cliente.recebimento !== 'entrega';
        var tot = lista.querySelector('.totais');
        if (tot) tot.outerHTML = htmlTotais();
      }
      if (e.target.name === 'pagamento') form.querySelector('[data-campo="troco"]').hidden = !/dinheiro/i.test(estado.cliente.pagamento);
      var campo = e.target.closest('.campo.tem-erro');
      if (campo && e.target.value.trim()) { campo.classList.remove('tem-erro'); campo.querySelector('.campo__erro').hidden = true; }
      salvar();
      renderRodape();
      atualizarIndicadores(false);
    });

    rodape.addEventListener('click', function (e) {
      var fin = e.target.closest('#finalizar');
      if (!fin) return;
      if (estado.itens.length === 0) { e.preventDefault(); return; }
      lerCheckout();
      if (!validar()) { e.preventDefault(); A.toast('Falta pouco: confira os campos marcados.'); return; }
      fin.href = A.linkWhats(mensagemWhats());
      A.toast('Abrimos o WhatsApp com seu pedido. É só enviar a mensagem.');
    });
  }

  function removerAnimado(li, linha) {
    if (A.reduzMovimento()) return api.remover(linha);
    li.classList.add('saindo');
    setTimeout(function () { api.remover(linha); }, 260);
  }

  A.on('init', init);
})();

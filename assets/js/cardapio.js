/* =====================================================================
   Cardápio: combos, abas por categoria, promoções e personalização
   Todos os cartões são gerados a partir de dados.js.
   ===================================================================== */
(function () {
  'use strict';

  var A = window.Acai;
  var D = A.dados;
  var abaAtual = D.categorias[0].id;

  /* ---------- Componentes ---------- */
  function htmlPreco(t) {
    return '<span class="preco" data-preco>' + (t.precoDe ? '<s>' + A.preco(t.precoDe) + '</s>' : '') + A.preco(t.preco) + '</span>';
  }
  function precoMinimo(p) {
    return Math.min.apply(null, p.tamanhos.map(function (t) { return t.preco; }));
  }
  function descontoPct(t) {
    return t.precoDe ? Math.round((1 - t.preco / t.precoDe) * 100) : 0;
  }

  function htmlChipsTamanho(p, ativo) {
    if (p.tamanhos.length < 2) return '<span class="tag">' + A.esc(A.rotuloTamanho(p.tamanhos[0])) + '</span>';
    return '<div class="tamanhos-chips" role="radiogroup" aria-label="Tamanho de ' + A.esc(p.nome) + '">' +
      p.tamanhos.map(function (t) {
        return '<button type="button" class="chip" role="radio" data-tamanho="' + t.id + '" aria-checked="' + (t.id === ativo) + '">' + A.esc(A.rotuloTamanho(t)) + '</button>';
      }).join('') + '</div>';
  }

  function htmlBotoes(p) {
    if (p.disponivel === false) return '<button class="btn btn--sm" type="button" disabled>Indisponível</button>';
    return '<button class="btn btn--primario btn--sm" type="button" data-adicionar>' + A.icone('mais') + ' Adicionar</button>';
  }
  function htmlPersonalizar(p) {
    if (!p.personalizavel || p.abrirPersonalizacao || p.disponivel === false) return '';
    return '<button class="link-btn produto__personalizar" type="button" data-personalizar>' + A.icone('editar') + 'Personalizar<span class="so-desk"> ingredientes e adicionais</span></button>';
  }

  // cartão do cardápio (copos, tigelas, combos, barcas, promoções)
  function cartaoProduto(p) {
    var t = p.tamanhos.find(function (x) { return x.id === '500'; }) || p.tamanhos[0];
    var inclui = (p.ingredientes || []).length
      ? '<p class="produto__inclui" aria-label="Vem com">' + p.ingredientes.map(function (n) { return '<span>' + A.esc(n) + '</span>'; }).join('') + '</p>' : '';
    var off = descontoPct(t);
    return '<li data-reveal><article class="produto' + (p.disponivel === false ? ' produto--off' : '') + '" data-produto="' + p.id + '" data-tamanho-ativo="' + t.id + '">' +
      '<div class="produto__foto">' + A.img(p.imagem, 'produto', '(max-width: 640px) 104px, (max-width: 1100px) 46vw, 380px', 'alt="' + A.esc(p.nome) + '" width="800" height="600" loading="lazy" decoding="async"') +
        '<div class="produto__selos">' + (p.selo ? '<span class="selo">' + A.esc(p.selo) + '</span>' : '<span></span>') +
        (off ? '<span class="selo selo--off">' + off + '% off</span>' : '') + '</div>' +
      '</div>' +
      '<div class="produto__cab">' +
        '<h3 class="produto__nome">' + A.esc(p.nome) + '</h3>' +
        '<p class="produto__desc">' + A.esc(p.descricao) + '</p>' + inclui +
      '</div>' +
      '<div class="produto__opcoes">' + htmlChipsTamanho(p, t.id) + htmlPersonalizar(p) + '</div>' +
      '<div class="produto__pe">' + htmlPreco(t) + '<div class="produto__botoes">' + htmlBotoes(p) + '</div></div>' +
    '</article></li>';
  }

  // cartão da seção "Nossos combos" (foto inteira com informações por cima)
  function cartaoCombo(p) {
    var t = p.tamanhos[0];
    return '<li data-reveal><article class="combo-card" data-produto="' + p.id + '" data-tamanho-ativo="' + t.id + '">' +
      '<div class="combo-card__foto">' + A.img(p.imagem, 'produto', '(max-width: 640px) 92vw, (max-width: 1100px) 46vw, 290px', 'alt="' + A.esc(p.nome) + '" width="800" height="600" loading="lazy" decoding="async"') + '</div>' +
      (p.selo ? '<span class="selo">' + A.esc(p.selo) + '</span>' : '') +
      '<div class="combo-card__corpo">' +
        '<h3 class="combo-card__nome">' + A.esc(p.nome) + '</h3>' +
        '<p class="combo-card__desc">' + A.esc(p.descricao) + '</p>' +
        '<div class="combo-card__pe">' +
          '<div class="combo-card__preco"><span class="tag">' + A.esc(A.rotuloTamanho(t)) + '</span>' + htmlPreco(t) + '</div>' +
          (p.disponivel === false
            ? '<button class="btn btn--sm" type="button" disabled>Indisponível</button>'
            : '<button class="btn btn--icone" type="button" data-adicionar aria-label="Adicionar ' + A.esc(p.nome) + ' ao pedido">' + A.icone('mais') + '</button>') +
        '</div>' +
      '</div>' +
    '</article></li>';
  }

  function cartaoAdicional(a) {
    var grupo = (D.gruposAdicionais.find(function (g) { return g.id === a.grupo; }) || {}).nome || '';
    return '<li data-reveal><article class="adicional-card">' +
      A.img(a.imagem, 'adicional', '72px', 'alt="' + A.esc(a.nome) + '" width="72" height="72" loading="lazy"') +
      '<div class="adicional-card__info"><h3 class="adicional-card__nome">' + A.esc(a.nome) + '</h3>' +
        '<span class="adicional-card__grupo">' + A.esc(grupo) + '</span>' +
        '<span class="preco preco--sm">+ ' + A.preco(a.preco) + '</span></div>' +
      (a.disponivel === false
        ? '<button class="btn btn--sm" type="button" disabled>Indisponível</button>'
        : '<button class="btn btn--contorno btn--sm" type="button" data-usar-adicional="' + a.id + '">' + A.icone('mais') + ' No meu açaí</button>') +
    '</article></li>';
  }

  function bannerPromo(b) {
    var p = A.produto(b.produtoId);
    if (!p) return '';
    var t = p.tamanhos[0];
    var off = descontoPct(t);
    return '<li data-reveal><article class="banner" data-produto="' + p.id + '" data-tamanho-ativo="' + t.id + '">' +
      '<div class="banner__foto">' + A.img(b.imagem || p.imagem, 'banner', '(max-width: 640px) 92vw, (max-width: 1100px) 46vw, 380px', 'alt="" width="900" height="1100" loading="lazy" decoding="async"') + '</div>' +
      (off ? '<span class="selo">' + off + '% off</span>' : '') +
      '<div class="banner__conteudo">' +
        '<p class="banner__chamada">' + A.esc(b.chamada) + '</p>' +
        '<h3 class="banner__titulo">' + A.esc(b.titulo) + '</h3>' +
        '<p class="banner__texto">' + A.esc(b.texto) + '</p>' +
        '<p class="banner__preco">' + (t.precoDe ? '<s>de ' + A.preco(t.precoDe) + '</s>' : '') + '<strong>' + A.preco(t.preco) + '</strong></p>' +
        '<button class="btn btn--claro" type="button" data-adicionar>Pedir agora ' + A.icone('seta') + '</button>' +
      '</div>' +
    '</article></li>';
  }

  /* ---------- Herói: destaque do "Mais pedido" e atalho para os adicionais ---------- */
  function renderHero() {
    var box = document.getElementById('hero-destaque');
    var p = D.produtos.find(function (x) { return x.selo === 'Mais pedido' && x.disponivel !== false && x.personalizavel; }) ||
            D.produtos.find(function (x) { return x.selo && x.disponivel !== false; });
    if (box && p) {
      box.innerHTML =
        A.img(p.imagem, 'produto', '58px', 'alt="" width="58" height="58"') +
        '<div class="hero__destaque-txt"><span class="selo">' + A.esc(p.selo) + '</span>' +
          '<strong>' + A.esc(p.nome) + '</strong>' +
          '<span>a partir de ' + A.preco(precoMinimo(p)) + '</span></div>' +
        '<button class="btn btn--claro btn--icone" type="button" aria-label="Escolher tamanho e adicionar ' + A.esc(p.nome) + '">' + A.icone('mais') + '</button>';
      box.querySelector('button').addEventListener('click', function () { abrirModal(p, { tamanhoId: '500' }); });
      box.hidden = false;
    }
    var chip = document.getElementById('hero-chip');
    var disp = D.adicionais.filter(function (a) { return a.disponivel !== false; });
    if (chip && disp.length) {
      chip.innerHTML = '<span class="hero__chip-fotos">' + disp.slice(0, 3).map(function (a) {
        return A.img(a.imagem, 'adicional', '30px', 'alt="" width="30" height="30"');
      }).join('') + '</span>' + disp.length + ' adicionais para montar o seu';
      chip.hidden = false;
    }
  }

  /* ---------- Renderização ---------- */
  function renderCombos() {
    var ul = document.getElementById('lista-combos');
    if (!ul) return;
    ul.innerHTML = D.combosEmDestaque.map(A.produto).filter(Boolean).map(cartaoCombo).join('');
  }

  function renderAbas() {
    var abas = document.getElementById('abas');
    abas.innerHTML = D.categorias.map(function (c) {
      var qtd = c.id === 'adicionais' ? D.adicionais.length : A.produtosDaCategoria(c.id).length;
      return '<button class="aba" type="button" role="tab" id="aba-' + c.id + '" data-aba="' + c.id + '" aria-controls="painel-cardapio" aria-selected="' + (c.id === abaAtual) + '" tabindex="' + (c.id === abaAtual ? 0 : -1) + '">' +
        A.esc(c.nome) + '<span class="aba__qtd">' + qtd + '</span></button>';
    }).join('');
  }

  // Centraliza a aba ativa rolando só a faixa de abas (nunca a página).
  function centralizarAba(b) {
    var faixa = b.parentElement;
    if (!faixa || faixa.scrollWidth <= faixa.clientWidth) return;
    var alvo = b.offsetLeft - (faixa.clientWidth - b.offsetWidth) / 2;
    faixa.scrollTo({ left: Math.max(0, alvo), behavior: A.reduzMovimento() ? 'auto' : 'smooth' });
  }

  function mostrarAba(id, focar) {
    abaAtual = id;
    document.querySelectorAll('.aba').forEach(function (b) {
      var sel = b.dataset.aba === id;
      b.setAttribute('aria-selected', sel);
      b.tabIndex = sel ? 0 : -1;
      if (sel) {
        centralizarAba(b);
        if (focar) b.focus({ preventScroll: true });
      }
    });
    var painel = document.getElementById('painel-cardapio');
    painel.setAttribute('aria-labelledby', 'aba-' + id);
    var html = id === 'adicionais'
      ? D.adicionais.map(cartaoAdicional).join('')
      : A.produtosDaCategoria(id).map(cartaoProduto).join('');
    painel.innerHTML = '<ul class="grade-produtos" data-stagger>' + html + '</ul>';
    A.emit('conteudo-novo', painel);
  }

  function renderPromos() {
    var ul = document.getElementById('lista-promos');
    if (!ul) return;
    var ativas = D.promocoes.filter(function (b) { return b.ativa !== false; });
    ul.innerHTML = ativas.slice(0, 2).map(bannerPromo).join('');
    // as demais promoções ativas aparecem em lista compacta no cartão ao lado
    var extra = document.getElementById('promos-extra');
    if (!extra) return;
    extra.innerHTML = ativas.slice(2).map(function (b) {
      var p = A.produto(b.produtoId);
      if (!p) return '';
      var t = p.tamanhos[0];
      return '<li class="promo-mini" data-produto="' + p.id + '" data-tamanho-ativo="' + t.id + '">' +
        A.img(b.imagem || p.imagem, 'banner', '64px', 'alt="" width="64" height="64" loading="lazy"') +
        '<div class="promo-mini__txt"><span>' + A.esc(b.chamada) + '</span><strong>' + A.esc(p.nome) + '</strong>' +
          '<em>' + (t.precoDe ? '<s>' + A.preco(t.precoDe) + '</s> ' : '') + A.preco(t.preco) + '</em></div>' +
        '<button class="btn btn--claro btn--icone" type="button" data-adicionar aria-label="Pedir ' + A.esc(p.nome) + '">' + A.icone('mais') + '</button>' +
      '</li>';
    }).join('');
    extra.hidden = !extra.innerHTML;
  }

  /* ---------- Ações dos cartões ---------- */
  function cfgDoCartao(card) {
    return { produtoId: card.dataset.produto, tamanhoId: card.dataset.tamanhoAtivo, qtd: 1 };
  }

  function adicionarRapido(card, btn) {
    var p = A.produto(card.dataset.produto);
    if (!p) return;
    // produtos que pedem escolha (tigela do seu jeito, promoções com adicionais inclusos) abrem a personalização
    if (p.abrirPersonalizacao || (p.personalizavel && A.qtdInclusos(p, A.tamanho(p, card.dataset.tamanhoAtivo)))) {
      return abrirModal(p, { tamanhoId: card.dataset.tamanhoAtivo });
    }
    var item = A.carrinho.adicionar(cfgDoCartao(card));
    if (!item) return;
    A.feedbackBotao(btn);
    A.toast(p.nome + ' (' + item.tamanhoRotulo + ') no seu pedido', { rotulo: 'Ver pedido', fn: A.carrinho.abrir });
  }

  function cliqueCartoes(e) {
    var chip = e.target.closest('[data-tamanho]');
    var card = e.target.closest('[data-produto]');
    if (chip && card) {
      var p = A.produto(card.dataset.produto);
      var t = A.tamanho(p, chip.dataset.tamanho);
      card.dataset.tamanhoAtivo = t.id;
      card.querySelectorAll('[data-tamanho]').forEach(function (c) { c.setAttribute('aria-checked', c === chip); });
      var precoEl = card.querySelector('[data-preco]');
      precoEl.outerHTML = htmlPreco(t);
      return;
    }
    var add = e.target.closest('[data-adicionar]');
    if (add && card) return adicionarRapido(card, add);
    if (e.target.closest('[data-personalizar]') && card) {
      return abrirModal(A.produto(card.dataset.produto), { tamanhoId: card.dataset.tamanhoAtivo });
    }
    var usar = e.target.closest('[data-usar-adicional]');
    if (usar) {
      A.emit('montador:selecionar', usar.dataset.usarAdicional);
      A.feedbackBotao(usar);
    }
  }

  /* ---------- Modal de personalização ---------- */
  var modal, mform, ctx = null;

  function abrirModal(p, opc) {
    if (!p) return;
    opc = opc || {};
    var item = opc.item;
    ctx = {
      produto: p,
      linha: item ? item.linha : null,
      tamanhoId: item ? item.tamanhoId : (A.tamanho(p, opc.tamanhoId).id),
      // opc.adicionais: adicionais já marcados ao abrir (ex.: sabor escolhido no slider do topo)
      adicionais: new Set(item ? item.adicionais.map(function (a) { return a.id; })
        : (p.personalizavel ? (opc.adicionais || []).filter(function (id) { var a = A.adicional(id); return a && a.disponivel !== false; }) : [])),
      removidos: new Set(item ? item.removidos : []),
      obs: item ? item.obs : '',
      qtd: item ? item.qtd : 1,
    };
    renderModal();
    atualizarTotalModal();
    A.abrirDialog(modal);
  }

  // mesma regra do carrinho: adicionais inclusos não somam; valores em centavos
  function extrasModal() {
    var t = A.tamanho(ctx.produto, ctx.tamanhoId);
    var lista = Array.from(ctx.adicionais).map(A.adicional).filter(Boolean);
    return A.marcarInclusos(lista, A.qtdInclusos(ctx.produto, t));
  }
  function precoModal() {
    var t = A.tamanho(ctx.produto, ctx.tamanhoId);
    var cent = A.centavos(t.preco) + extrasModal().reduce(function (s, a) { return s + (a.incluso ? 0 : A.centavos(a.preco)); }, 0);
    return cent * ctx.qtd / 100;
  }

  function renderModal() {
    var p = ctx.produto;
    var partes = [];
    partes.push('<div><h2 class="modal__nome" id="modal-titulo">' + A.esc(p.nome) + '</h2><p class="modal__desc">' + A.esc(p.descricao) + '</p></div>');

    if (p.tamanhos.length > 1) {
      partes.push('<div class="modal__grupo"><p class="modal__grupo-titulo">Tamanho</p><div class="tamanhos-chips" role="radiogroup" aria-label="Tamanho">' +
        p.tamanhos.map(function (t) {
          return '<button type="button" class="chip" role="radio" data-m-tamanho="' + t.id + '" aria-checked="' + (t.id === ctx.tamanhoId) + '">' + A.esc(A.rotuloTamanho(t)) + ' · ' + A.preco(t.preco) + '</button>';
        }).join('') + '</div></div>');
    } else {
      partes.push('<p><span class="tag-tamanho">' + A.esc(A.rotuloTamanho(p.tamanhos[0])) + '</span></p>');
    }

    if ((p.ingredientes || []).length) {
      partes.push('<div class="modal__grupo"><p class="modal__grupo-titulo">Ingredientes <small>' + (p.personalizavel ? 'toque para retirar' : 'já vêm no pedido') + '</small></p><div class="tamanhos-chips">' +
        p.ingredientes.map(function (n) {
          var tem = !ctx.removidos.has(n);
          return p.personalizavel
            ? '<button type="button" class="chip chip--risco" data-m-ingrediente="' + A.esc(n) + '" aria-pressed="' + tem + '">' + A.esc(n) + '</button>'
            : '<span class="chip">' + A.esc(n) + '</span>';
        }).join('') + '</div></div>');
    }

    if (p.personalizavel) {
      var nInc = A.qtdInclusos(p, A.tamanho(p, ctx.tamanhoId));
      if (nInc) partes.push('<p class="modal__inclusos" data-m-inclusos>' + A.icone('check') + '<span>Escolha até ' + nInc + ' adicionais inclusos no preço. Os demais são cobrados à parte.</span></p>');
      D.gruposAdicionais.forEach(function (g) {
        var lista = A.adicionaisDoGrupo(g.id).filter(function (a) { return a.disponivel !== false; });
        if (!lista.length) return;
        partes.push('<div class="modal__grupo"><p class="modal__grupo-titulo">' + A.esc(g.nome) + ' <small>adicionais opcionais</small></p><div class="extras">' +
          lista.map(function (a) {
            return '<button type="button" class="extra" data-m-extra="' + a.id + '" aria-pressed="' + ctx.adicionais.has(a.id) + '">' +
              A.img(a.imagem, 'adicional', '44px', 'alt="" width="44" height="44" loading="lazy"') +
              '<span class="extra__nome">' + A.esc(a.nome) + '</span><span class="extra__preco" data-m-preco="' + a.id + '">+ ' + A.preco(a.preco) + '</span>' +
              '<span class="extra__marca">' + A.icone('check') + '</span></button>';
          }).join('') + '</div></div>');
      });
    }

    partes.push('<div class="campo"><label for="m-obs">Observações (opcional)</label><textarea id="m-obs" maxlength="200" placeholder="Ex.: granola separada, pouco leite condensado">' + A.esc(ctx.obs) + '</textarea></div>');

    mform.innerHTML =
      '<div class="modal__foto">' + A.img(p.imagem, 'produto', '(max-width: 960px) 100vw, 400px', 'alt="' + A.esc(p.nome) + '" width="800" height="600"') +
        '<button class="icone-btn modal__fechar" type="button" data-fechar aria-label="Fechar">' + A.icone('fechar') + '</button></div>' +
      '<div class="modal__conteudo"><div class="modal__rolagem">' + partes.join('') + '</div>' +
        '<div class="modal__rodape">' +
          '<div class="stepper"><button type="button" data-m-qtd="-1" aria-label="Diminuir quantidade">' + A.icone('menos') + '</button>' +
          '<output id="m-qtd" aria-live="polite">' + ctx.qtd + '</output>' +
          '<button type="button" data-m-qtd="1" aria-label="Aumentar quantidade">' + A.icone('mais') + '</button></div>' +
          '<button class="btn btn--primario" type="submit" id="m-confirmar">' + (ctx.linha ? 'Salvar' : 'Adicionar') + ' · <span data-m-total>' + A.preco(precoModal()) + '</span></button>' +
        '</div></div>';
  }

  function atualizarTotalModal() {
    var el = mform.querySelector('[data-m-total]');
    if (el) el.textContent = A.preco(precoModal());
    // marca como "Incluso" os adicionais que não estão sendo cobrados
    var inclusos = {};
    extrasModal().forEach(function (a) { if (a.incluso) inclusos[a.id] = true; });
    mform.querySelectorAll('[data-m-preco]').forEach(function (sp) {
      var a = A.adicional(sp.dataset.mPreco);
      sp.textContent = inclusos[a.id] ? 'Incluso' : '+ ' + A.preco(a.preco);
      sp.classList.toggle('is-incluso', !!inclusos[a.id]);
    });
  }

  function initModal() {
    modal = document.getElementById('modal-produto');
    mform = document.getElementById('modal-form');
    A.prepararDialog(modal);

    mform.addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-m-tamanho]'))) {
        ctx.tamanhoId = b.dataset.mTamanho;
        mform.querySelectorAll('[data-m-tamanho]').forEach(function (x) { x.setAttribute('aria-checked', x === b); });
      } else if ((b = e.target.closest('[data-m-extra]'))) {
        var id = b.dataset.mExtra;
        ctx.adicionais.has(id) ? ctx.adicionais.delete(id) : ctx.adicionais.add(id);
        b.setAttribute('aria-pressed', ctx.adicionais.has(id));
      } else if ((b = e.target.closest('[data-m-ingrediente]'))) {
        var n = b.dataset.mIngrediente;
        ctx.removidos.has(n) ? ctx.removidos.delete(n) : ctx.removidos.add(n);
        b.setAttribute('aria-pressed', !ctx.removidos.has(n));
      } else if ((b = e.target.closest('[data-m-qtd]'))) {
        ctx.qtd = Math.min(99, Math.max(1, ctx.qtd + parseInt(b.dataset.mQtd, 10)));
        mform.querySelector('#m-qtd').textContent = ctx.qtd;
      } else return;
      atualizarTotalModal();
    });

    mform.addEventListener('input', function (e) { if (e.target.id === 'm-obs') ctx.obs = e.target.value; });

    mform.addEventListener('submit', function (e) {
      e.preventDefault();
      var cfg = {
        produtoId: ctx.produto.id, tamanhoId: ctx.tamanhoId,
        adicionais: Array.from(ctx.adicionais), removidos: Array.from(ctx.removidos),
        obs: ctx.obs, qtd: ctx.qtd,
      };
      if (ctx.linha) {
        A.carrinho.substituir(ctx.linha, cfg);
        A.fecharDialog(modal);
        A.toast('Item atualizado no seu pedido');
      } else {
        var item = A.carrinho.adicionar(cfg);
        A.fecharDialog(modal);
        if (item) A.toast(ctx.produto.nome + ' (' + item.tamanhoRotulo + ') no seu pedido', { rotulo: 'Ver pedido', fn: A.carrinho.abrir });
      }
    });

    // editar um item a partir do carrinho
    A.on('editar-item', function (item) {
      if (!item) return;
      abrirModal(A.produto(item.produtoId), { item: item });
    });
  }

  /* ---------- Inicialização ---------- */
  function init() {
    renderHero();
    renderCombos();
    renderAbas();
    mostrarAba(abaAtual);
    renderPromos();
    initModal();

    document.getElementById('lista-combos').addEventListener('click', cliqueCartoes);
    document.getElementById('painel-cardapio').addEventListener('click', cliqueCartoes);
    document.getElementById('lista-promos').addEventListener('click', cliqueCartoes);
    var extra = document.getElementById('promos-extra');
    if (extra) extra.addEventListener('click', cliqueCartoes);

    var abas = document.getElementById('abas');
    abas.addEventListener('click', function (e) {
      var b = e.target.closest('[data-aba]');
      if (b && b.dataset.aba !== abaAtual) mostrarAba(b.dataset.aba);
    });
    // setas do teclado entre as abas
    abas.addEventListener('keydown', function (e) {
      if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(e.key) < 0) return;
      e.preventDefault();
      var ids = D.categorias.map(function (c) { return c.id; });
      var i = ids.indexOf(abaAtual);
      if (e.key === 'ArrowRight') i = (i + 1) % ids.length;
      if (e.key === 'ArrowLeft') i = (i - 1 + ids.length) % ids.length;
      if (e.key === 'Home') i = 0;
      if (e.key === 'End') i = ids.length - 1;
      mostrarAba(ids[i], true);
    });

    document.addEventListener('click', function (e) {
      var ir = e.target.closest('[data-ir-aba]');
      if (!ir) return;
      mostrarAba(ir.dataset.irAba);
      A.irPara('#cardapio');
    });
  }

  A.cardapio = { mostrarAba: mostrarAba, abrirModal: abrirModal };
  A.on('init', init);
})();

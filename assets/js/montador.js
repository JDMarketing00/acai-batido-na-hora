/* =====================================================================
   Monte seu açaí: tamanho + frutas + complementos + caldas,
   preço em tempo real e envio para o carrinho.
   ===================================================================== */
(function () {
  'use strict';

  var A = window.Acai;
  var D = A.dados;
  var CHAVE = 'acai-batido-na-hora:montador:v1';
  var M = D.montador;

  var estado = { tamanhoId: M.tamanhoInicial || M.tamanhos[0].id, selecionados: [] };
  var form, resumo, barra;

  function tamanhoAtual() {
    return M.tamanhos.find(function (t) { return t.id === estado.tamanhoId; }) || M.tamanhos[0];
  }
  function total() {
    return estado.selecionados.reduce(function (s, id) {
      var a = A.adicional(id);
      return s + (a ? a.preco : 0);
    }, tamanhoAtual().preco);
  }
  function salvar() { A.storage.set(CHAVE, estado); }

  /* ---------- Passos ---------- */
  function renderPassos() {
    var html = '<fieldset class="passo"><legend class="passo__rotulo"><span class="passo__num">1</span> Escolha o tamanho</legend>' +
      '<div class="tamanhos-monte" data-stagger>' +
      M.tamanhos.map(function (t) {
        var id = 'mt-' + t.id;
        return '<div class="opcao-tamanho" data-reveal="scale"><input type="radio" name="tamanho" id="' + id + '" value="' + t.id + '"' + (t.id === estado.tamanhoId ? ' checked' : '') + '>' +
          '<label for="' + id + '"><span class="opcao-tamanho__ml">' + A.esc(A.rotuloTamanho(t)) + '</span><span class="opcao-tamanho__preco">' + A.preco(t.preco) + '</span></label></div>';
      }).join('') + '</div></fieldset>';

    var numero = 1;
    D.gruposAdicionais.forEach(function (g) {
      var lista = A.adicionaisDoGrupo(g.id);
      if (!lista.length) return;
      numero += 1;
      html += '<fieldset class="passo"><legend class="passo__rotulo"><span class="passo__num">' + numero + '</span> ' + A.esc(g.nome) +
        '<span class="passo__dica">Toque para escolher</span></legend><div class="grade-adicionais" data-stagger>' +
        lista.map(function (a) {
          var on = estado.selecionados.indexOf(a.id) >= 0;
          return '<button type="button" class="tile" data-reveal="scale" data-adicional="' + a.id + '" aria-pressed="' + on + '"' + (a.disponivel === false ? ' disabled' : '') + '>' +
            '<span class="tile__foto">' + A.img(a.imagem, 'adicional', '56px', 'alt="" width="56" height="56" loading="lazy"') + '</span>' +
            '<span class="tile__txt"><span class="tile__nome">' + A.esc(a.nome) + '</span>' +
            '<span class="tile__preco">' + (a.disponivel === false ? 'Indisponível' : '+ ' + A.preco(a.preco)) + '</span></span>' +
            '<span class="tile__check">' + A.icone('check') + '</span></button>';
        }).join('') + '</div></fieldset>';
    });
    html += '<div class="resumo-barra" id="monte-barra" aria-live="polite"></div>';
    form.innerHTML = html;
    barra = form.querySelector('#monte-barra');
  }

  /* ---------- Resumo ---------- */
  function renderResumo() {
    var itens = estado.selecionados.map(A.adicional).filter(Boolean);
    resumo.innerHTML =
      '<div class="resumo__topo"><span class="resumo__rotulo">Seu açaí</span><span class="resumo__tamanho">' + A.esc(A.rotuloTamanho(tamanhoAtual())) + '</span></div>' +
      '<div class="resumo__itens">' + (itens.length
        ? itens.map(function (a) { return '<span class="resumo__item">' + A.esc(a.nome) + '</span>'; }).join('')
        : '<span class="resumo__vazio">Nenhum adicional ainda.</span>') + '</div>' +
      '<div class="resumo__total"><span>Total</span><strong>' + A.preco(total()) + '</strong></div>' +
      '<div class="resumo__acoes"><button class="btn btn--primario btn--bloco btn--lg" type="button" data-monte-add>' + A.icone('carrinho') + ' Adicionar ao pedido</button>' +
      (itens.length ? '<button class="link-btn" type="button" data-monte-limpar>Limpar escolhas</button>' : '') + '</div>';
    if (barra) {
      barra.innerHTML = '<div class="resumo-barra__txt"><span>' + A.esc(A.rotuloTamanho(tamanhoAtual())) +
        (itens.length ? ' · ' + itens.length + (itens.length === 1 ? ' adicional' : ' adicionais') : ' · sem adicionais') + '</span>' +
        '<strong>' + A.preco(total()) + '</strong></div>' +
        '<button class="btn" type="button" data-monte-add>' + A.icone('carrinho') + ' Adicionar</button>';
    }
  }

  function atualizar() {
    salvar();
    renderResumo();
  }

  function alternar(id, ligar) {
    var i = estado.selecionados.indexOf(id);
    var on = ligar === undefined ? i < 0 : ligar;
    if (on && i < 0) estado.selecionados.push(id);
    if (!on && i >= 0) estado.selecionados.splice(i, 1);
    var tile = form.querySelector('[data-adicional="' + id + '"]');
    if (tile) tile.setAttribute('aria-pressed', on);
    atualizar();
  }

  function init() {
    form = document.getElementById('montador');
    resumo = document.getElementById('monte-resumo');
    if (!form || !resumo) return;

    var salvo = A.storage.get(CHAVE, null);
    if (salvo) {
      if (M.tamanhos.some(function (t) { return t.id === salvo.tamanhoId; })) estado.tamanhoId = salvo.tamanhoId;
      estado.selecionados = (salvo.selecionados || []).filter(function (id) { var a = A.adicional(id); return a && a.disponivel !== false; });
    }

    renderPassos();
    renderResumo();

    form.addEventListener('change', function (e) {
      if (e.target.name === 'tamanho') { estado.tamanhoId = e.target.value; atualizar(); }
    });
    form.addEventListener('click', function (e) {
      if (e.target.closest('#monte-barra')) return cliqueResumo(e);
      var tile = e.target.closest('[data-adicional]');
      if (tile && !tile.disabled) alternar(tile.dataset.adicional);
    });

    function cliqueResumo(e) {
      if (e.target.closest('[data-monte-limpar]')) {
        estado.selecionados.slice().forEach(function (id) { alternar(id, false); });
        return;
      }
      var add = e.target.closest('[data-monte-add]');
      if (!add) return;
      var item = A.carrinho.adicionar({ produtoId: 'monte', tamanhoId: estado.tamanhoId, adicionais: estado.selecionados.slice(), qtd: 1 });
      if (!item) return;
      A.feedbackBotao(add);
      A.toast(M.nome + ' (' + item.tamanhoRotulo + ') no seu pedido', { rotulo: 'Ver pedido', fn: A.carrinho.abrir });
      // começa um novo açaí, mantendo o tamanho
      setTimeout(function () { estado.selecionados.slice().forEach(function (id) { alternar(id, false); }); }, 1400);
    }
    resumo.addEventListener('click', cliqueResumo);

    // "No meu açaí" na aba Adicionais do cardápio
    A.on('montador:selecionar', function (id) {
      alternar(id, true);
      var a = A.adicional(id);
      A.toast((a ? a.nome : 'Adicional') + ' escolhido no seu açaí', { rotulo: 'Ir para Monte seu açaí', fn: function () { A.irPara('#monte'); } });
    });
  }

  A.montador = { alternar: alternar };
  A.on('init', init);
})();

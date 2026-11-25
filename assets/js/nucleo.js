/* =====================================================================
   Núcleo: funções compartilhadas por todos os módulos (window.Acai)
   ===================================================================== */
(function () {
  'use strict';

  var D = window.ACAI_DADOS;
  var A = (window.Acai = window.Acai || {});
  A.dados = D;

  /* ---------- Formatação ---------- */
  var moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  A.preco = function (v) {
    return moeda.format(Math.round((v || 0) * 100) / 100).replace(/ /g, ' ');
  };
  A.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  A.icone = function (id) {
    return '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-' + id + '"/></svg>';
  };
  A.uid = function () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  /* ---------- Imagens responsivas ----------
     Para cada foto em assets/img/fotos existe uma versão menor (ex.: copo-morango-400.webp).
     O navegador escolhe a mais leve que fica nítida na tela. Se a versão menor não existir,
     a foto principal é usada (ver o tratamento de erro no fim deste arquivo). */
  var VARIANTES = {
    produto: [['-400', 400], ['', 800]],
    adicional: [['-160', 160], ['', 420]],
    banner: [['-600', 600], ['', 900]],
  };
  A.img = function (src, tipo, sizes, extra) {
    var v = VARIANTES[tipo];
    var ok = v && /\.webp$/.test(src) && src.indexOf('assets/img/fotos/') === 0;
    var srcset = ok ? v.map(function (x) { return src.replace(/\.webp$/, x[0] + '.webp') + ' ' + x[1] + 'w'; }).join(', ') : '';
    return '<img src="' + A.esc(src) + '"' + (srcset ? ' srcset="' + A.esc(srcset) + '" sizes="' + A.esc(sizes) + '"' : '') + ' ' + (extra || '') + '>';
  };

  /* ---------- Acesso aos dados ---------- */
  // "monte" é o açaí montado na seção "Monte seu açaí"
  var produtoMonte = {
    id: 'monte',
    categoria: 'monte',
    nome: D.montador.nome,
    descricao: 'Açaí montado do seu jeito.',
    imagem: D.montador.imagem,
    tamanhos: D.montador.tamanhos,
    ingredientes: [],
    personalizavel: true,
    disponivel: true,
  };
  A.produto = function (id) {
    if (id === 'monte') return produtoMonte;
    return D.produtos.find(function (p) { return p.id === id; }) || null;
  };
  A.adicional = function (id) {
    return D.adicionais.find(function (a) { return a.id === id; }) || null;
  };
  A.produtosDaCategoria = function (cat) {
    return D.produtos.filter(function (p) { return p.categoria === cat; });
  };
  A.adicionaisDoGrupo = function (grupo) {
    return D.adicionais.filter(function (a) { return a.grupo === grupo; });
  };
  A.rotuloTamanho = function (t) {
    return t.rotulo || D.tamanhos[t.id] || t.id;
  };
  A.tamanho = function (produto, tamanhoId) {
    return produto.tamanhos.find(function (t) { return t.id === tamanhoId; }) || produto.tamanhos[0];
  };

  /* ---------- Dinheiro em centavos (evita erro de arredondamento) ---------- */
  A.centavos = function (v) { return Math.round((+v || 0) * 100); };

  /* ---------- Adicionais inclusos no preço (ex.: "300 ml + 2 adicionais") ----------
     Regra única para carrinho, personalização e mensagem: dos adicionais escolhidos,
     os N mais caros saem sem custo; os demais são cobrados. */
  A.qtdInclusos = function (produto, tamanho) {
    return (tamanho && tamanho.adicionaisInclusos) || (produto && produto.adicionaisInclusos) || 0;
  };
  A.marcarInclusos = function (extras, n) {
    var ordem = extras.map(function (a, i) { return { i: i, c: A.centavos(a.preco) }; })
      .sort(function (x, y) { return y.c - x.c || x.i - y.i; });
    var gratis = {};
    ordem.slice(0, n).forEach(function (o) { gratis[o.i] = true; });
    return extras.map(function (a, i) { return Object.assign({}, a, { incluso: !!gratis[i] }); });
  };

  /* ---------- Preferências ---------- */
  var mqReduz = window.matchMedia('(prefers-reduced-motion: reduce)');
  A.reduzMovimento = function () { return mqReduz.matches; };

  /* ---------- Armazenamento local (protegido contra bloqueio) ---------- */
  A.storage = {
    get: function (chave, padrao) {
      try {
        var v = window.localStorage.getItem(chave);
        return v ? JSON.parse(v) : padrao;
      } catch (e) { return padrao; }
    },
    set: function (chave, valor) {
      try { window.localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem armazenamento */ }
    },
  };

  /* ---------- Eventos entre módulos ---------- */
  var ouvintes = {};
  A.on = function (ev, fn) { (ouvintes[ev] = ouvintes[ev] || []).push(fn); };
  A.emit = function (ev, dado) { (ouvintes[ev] || []).forEach(function (fn) { fn(dado); }); };

  /* ---------- WhatsApp ---------- */
  A.linkWhats = function (texto) {
    var numero = String(D.contato.whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
  };

  /* ---------- Diálogos (carrinho e personalização) ---------- */
  A.abrirDialog = function (dlg) {
    if (!dlg || dlg.open) return;
    dlg.showModal();
    document.body.classList.add('travado');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { dlg.classList.add('is-open'); });
    });
  };
  A.fecharDialog = function (dlg) {
    if (!dlg || !dlg.open) return;
    dlg.classList.remove('is-open');
    var feito = false;
    var fim = function () {
      if (feito) return;
      feito = true;
      dlg.close();
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('travado');
    };
    if (A.reduzMovimento()) return fim();
    dlg.firstElementChild.addEventListener('transitionend', fim, { once: true });
    setTimeout(fim, 480);
  };
  A.prepararDialog = function (dlg) {
    // Esc e clique fora fecham com animação
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); A.fecharDialog(dlg); });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-fechar]')) A.fecharDialog(dlg);
    });
  };

  /* ---------- Aviso rápido (toast) ---------- */
  var toastEl, toastTimer, toastSai;
  function esconderToast() {
    if (!toastEl || toastEl.hidden) return;
    toastEl.classList.add('saindo');
    toastSai = setTimeout(function () { toastEl.hidden = true; toastEl.classList.remove('saindo'); }, 300);
  }
  A.toast = function (msg, acao) {
    toastEl = toastEl || document.getElementById('toast');
    clearTimeout(toastTimer);
    clearTimeout(toastSai);
    toastEl.classList.remove('saindo');
    toastEl.innerHTML = A.icone('check') + '<span>' + A.esc(msg) + '</span>' +
      (acao ? '<button type="button">' + A.esc(acao.rotulo) + '</button>' : '');
    if (acao) {
      toastEl.querySelector('button').addEventListener('click', function () { esconderToast(); acao.fn(); });
    }
    toastEl.hidden = false;
    toastEl.style.animation = 'none';
    void toastEl.offsetWidth;
    toastEl.style.animation = '';
    toastTimer = setTimeout(esconderToast, 3600);
  };

  /* ---------- Feedback no botão que adicionou ---------- */
  A.feedbackBotao = function (btn) {
    if (!btn || btn.classList.contains('is-ok')) return;
    var original = btn.innerHTML;
    btn.classList.add('is-ok');
    btn.innerHTML = A.icone('check') + (btn.classList.contains('btn--icone') ? '' : ' Adicionado');
    setTimeout(function () { btn.classList.remove('is-ok'); btn.innerHTML = original; }, 1400);
  };

  // Se uma versão menor da foto faltar, usa a foto principal (evita imagem quebrada)
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.tagName === 'IMG' && el.hasAttribute('srcset')) { el.removeAttribute('srcset'); el.removeAttribute('sizes'); }
  }, true);

  A.irPara = function (seletor) {
    var el = document.querySelector(seletor);
    if (el) el.scrollIntoView({ behavior: A.reduzMovimento() ? 'auto' : 'smooth', block: 'start' });
  };
})();

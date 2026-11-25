/* =====================================================================
   Animações e navegação: entrada do herói, revelar ao rolar (com
   stagger), navbar, menu do celular e link ativo.
   Só anima transform e opacity. Respeita prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';

  var A = window.Acai;
  var root = document.documentElement;
  var temIO = 'IntersectionObserver' in window;
  var io = null;

  /* ---------- Revelar ao rolar ---------- */
  function revelarTudo(raiz) {
    (raiz || document).querySelectorAll('[data-reveal], [data-observe]').forEach(function (el) { el.classList.add('is-visible'); });
  }

  function criarObservador() {
    if (!temIO || A.reduzMovimento()) return null;
    return new IntersectionObserver(function (entries) {
      var lote = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      // itens do mesmo grupo que entram juntos aparecem em sequência
      var grupos = new Map();
      lote.forEach(function (el) {
        var g = el.parentElement && el.parentElement.closest('[data-stagger]');
        if (!g) return;
        if (!grupos.has(g)) grupos.set(g, []);
        grupos.get(g).push(el);
      });
      grupos.forEach(function (lista) {
        lista.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
        lista.forEach(function (el, i) { el.style.setProperty('--i', Math.min(i, 8)); });
      });
      lote.forEach(function (el) { el.classList.add('is-visible'); io.unobserve(el); });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
  }

  A.observar = function (raiz) {
    if (!io) return revelarTudo(raiz);
    (raiz || document).querySelectorAll('[data-reveal]:not(.is-visible), [data-observe]:not(.is-visible)').forEach(function (el) { io.observe(el); });
  };

  /* ---------- Entrada do herói ---------- */
  // A entrada começa no primeiro quadro (título e foto principal já nascem visíveis).
  function entrada() {
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('is-ready'); }); });
  }

  /* ---------- Navbar e menu ---------- */
  function navbar() {
    var nav = document.querySelector('.nav');
    var sentinela = document.querySelector('.nav-sentinel');
    if (nav && sentinela && temIO) {
      new IntersectionObserver(function (e) { nav.classList.toggle('is-scrolled', !e[0].isIntersecting); }).observe(sentinela);
    } else if (nav) nav.classList.add('is-scrolled');

    var toggle = document.querySelector('.nav__toggle');
    var painel = document.getElementById('menu-mobile');
    if (!toggle || !painel) return;
    function menu(aberto) {
      toggle.setAttribute('aria-expanded', String(aberto));
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', aberto);
      if (aberto) {
        painel.hidden = false;
        requestAnimationFrame(function () { painel.classList.add('is-open'); });
      } else {
        painel.classList.remove('is-open');
        setTimeout(function () { if (!painel.classList.contains('is-open')) painel.hidden = true; }, 300);
      }
    }
    toggle.addEventListener('click', function () { menu(toggle.getAttribute('aria-expanded') !== 'true'); });
    painel.addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) menu(false); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) { if (e.matches) menu(false); });
  }

  /* ---------- Link ativo ---------- */
  function linkAtivo() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
    if (!temIO || !links.length) return;
    var porId = {};
    links.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (porId[e.target.id]) porId[e.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id], footer[id]').forEach(function (s) { spy.observe(s); });
  }

  function init() {
    io = criarObservador();
    A.observar(document);
    entrada();
    navbar();
    linkAtivo();
    A.on('conteudo-novo', function (raiz) { A.observar(raiz); });
    // se a pessoa ligar "reduzir movimento" com a página aberta, tudo aparece na hora
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
      if (e.matches) { root.classList.add('is-ready'); revelarTudo(); }
    });
  }

  A.animacoes = { init: init };
})();

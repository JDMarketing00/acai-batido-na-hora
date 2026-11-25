/* =====================================================================
   Slider de sabores da primeira tela.
   Lê window.ACAI_DADOS.sabores. Troca com setas, pontos, nomes, teclado
   e deslizando o dedo. Troca sozinho (autoplay) e para quando a pessoa
   interage. Parallax leve pelo mouse e pela rolagem.
   Só anima transform e opacity. Respeita prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';

  var A = window.Acai;
  var D = window.ACAI_DADOS;

  var cfg, lista, raiz, slides = [], fundos = [], infos = [], nomes = [], dots = [];
  var atual = 0;
  var auto = false;          // troca automática ligada
  var pausas = {};           // motivos de pausa temporária (mouse, foco, fora da tela, aba escondida)
  var visivel = true;

  function dois(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- Preço "a partir de" (produto + adicionais do sabor) ---------- */
  function precoSabor(s) {
    var p = A.produto(s.produtoId);
    if (!p || p.disponivel === false) return null;
    var extras = (s.adicionais || []).map(A.adicional).filter(function (a) { return a && a.disponivel !== false; });
    var menor = null;
    p.tamanhos.forEach(function (t) {
      var lista2 = p.personalizavel ? A.marcarInclusos(extras.slice(), A.qtdInclusos(p, t)) : [];
      var c = A.centavos(t.preco) + lista2.reduce(function (s2, a) { return s2 + (a.incluso ? 0 : A.centavos(a.preco)); }, 0);
      if (menor === null || c < menor) menor = c;
    });
    return menor === null ? null : menor / 100;
  }

  /* ---------- Modelos ---------- */
  function htmlFundo(s, i) {
    return '<div class="sabores__fundo' + (i === 0 ? ' is-ativo' : '') + '" data-tema="' + A.esc(s.tema || 'acai') + '"></div>';
  }

  function srcCopo(s, carregar) {
    var pequeno = s.copo.replace(/\.(webp|png|jpe?g)$/i, '-480.$1');
    var attr = carregar ? 'src' : 'data-src';
    return attr + '="' + A.esc(s.copo) + '" ' + (carregar ? '' : 'data-') + 'srcset="' + A.esc(pequeno) + ' 480w, ' + A.esc(s.copo) + ' 720w"';
  }

  function htmlSlide(s, i, total) {
    var carregar = i === 0;
    var nome = String(s.nome || '').toUpperCase();
    var letras = Array.from(nome).map(function (l, k) {
      return '<span class="sabor__letra" style="--i:' + k + '">' + (l === ' ' ? '&nbsp;' : A.esc(l)) + '</span>';
    }).join('');
    var ings = (s.ingredientes || []).map(function (g, k) {
      var prof = +g.prof || 1;
      var frente = prof >= 1;
      var desfoque = frente ? 0 : Math.round((1 - prof) * 50) / 10;
      var dur = (5.2 + ((k * 37) % 19) / 10).toFixed(1);
      return '<div class="sabor__ing par ' + (frente ? 'is-frente' : 'is-tras') + '" style="' +
        '--x:' + (+g.x || 50) + '%;--y:' + (+g.y || 50) + '%;--w:' + (+g.tamanho || 10) + '%;' +
        '--p:' + prof + ';--ps:' + (-prof * 0.9).toFixed(2) + ';--giro:' + (+g.giro || 0) + 'deg;' +
        '--i:' + k + ';--dur:' + dur + 's;--atraso:-' + ((k * 1.3) % 4).toFixed(1) + 's;--desfoque:' + desfoque + 'px">' +
        '<div class="sabor__entrada"><img class="flutua" ' + (carregar ? 'src' : 'data-src') + '="' + A.esc(g.imagem) + '" width="300" height="300" alt="" decoding="async"></div></div>';
    }).join('');
    return '<div class="sabor' + (i === 0 ? ' is-primeiro' : '') + '" data-tema="' + A.esc(s.tema || 'acai') + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' de ' + total + ': ' + A.esc(s.titulo) + '"' + (i === 0 ? '' : ' aria-hidden="true" inert') + '>' +
      '<div class="sabor__cena">' +
        '<div class="sabor__brilho" aria-hidden="true"></div>' +
        '<div class="sabor__gigante par" aria-hidden="true"><span class="sabor__linha" style="--letras:' + Math.max(nome.length, 4) + '">' + letras + '</span></div>' +
        '<div class="sabor__sombra par"><div class="sabor__entrada"><i></i></div></div>' +
        '<div class="sabor__copo par"><div class="sabor__entrada"><img class="flutua" ' + srcCopo(s, carregar) + ' sizes="(max-width: 960px) 58vw, 480px" width="720" height="1080" alt="Copo de ' + A.esc(s.titulo) + ' com ' + A.esc(String(s.descricao || '').replace(/\.$/, '').toLowerCase()) + '"' + (carregar ? ' fetchpriority="high"' : ' decoding="async"') + '></div></div>' +
        ings +
      '</div></div>';
  }

  function htmlInfo(s, i, total) {
    var preco = precoSabor(s);
    return '<div class="sabor-info' + (i === 0 ? ' is-ativo' : '') + '"' + (i === 0 ? '' : ' aria-hidden="true" inert') + '>' +
      '<p class="sabor-info__num">' + dois(i + 1) + ' <span>/ ' + dois(total) + '</span></p>' +
      '<p class="sabor-info__titulo">' + A.esc(s.titulo) + '</p>' +
      '<p class="sabor-info__desc">' + A.esc(s.descricao) + '</p>' +
      (preco !== null
        ? '<div class="sabor-info__pe"><p class="sabor-info__preco">a partir de <strong>' + A.preco(preco) + '</strong></p>' +
          '<button class="btn btn--claro" type="button" data-sabor-pedir="' + i + '">Quero este sabor ' + A.icone('seta') + '</button></div>'
        : '') +
      '</div>';
  }

  /* ---------- Troca de sabor ---------- */
  function carregarImagens(slide) {
    if (!slide || slide._carregado) return;
    slide._carregado = true;
    slide.querySelectorAll('img[data-src]').forEach(function (img) {
      if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute('data-srcset'); }
      img.src = img.dataset.src; img.removeAttribute('data-src');
    });
  }

  function marcar(el, ativo) {
    if (!el) return;
    if (ativo) { el.removeAttribute('aria-hidden'); el.inert = false; }
    else { el.setAttribute('aria-hidden', 'true'); el.inert = true; }
  }

  function irPara(n, opc) {
    opc = opc || {};
    var total = slides.length;
    n = (n + total) % total;
    if (n === atual) return;
    var dir = opc.dir || (n > atual ? 1 : -1);
    raiz.style.setProperty('--dir', dir);

    var velho = slides[atual], novo = slides[n];
    carregarImagens(novo);
    carregarImagens(slides[(n + 1) % total]);

    velho.classList.remove('is-ativo', 'is-primeiro');
    velho.classList.add('is-saindo');
    clearTimeout(velho._t);
    velho._t = setTimeout(function () { velho.classList.remove('is-saindo'); }, 1000);
    marcar(velho, false);

    clearTimeout(novo._t);
    novo.classList.remove('is-saindo');
    void novo.offsetWidth;          // começa a entrada do ponto de partida
    novo.classList.add('is-ativo');
    marcar(novo, true);

    fundos.forEach(function (f, k) { f.classList.toggle('is-ativo', k === n); });
    infos.forEach(function (f, k) {
      f.classList.toggle('is-ativo', k === n);
      marcar(f, k === n);
    });
    raiz.dataset.tema = novo.dataset.tema;
    atual = n;
    atualizarControles();
  }

  function atualizarControles() {
    nomes.forEach(function (b, k) { if (k === atual) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    dots.forEach(function (b, k) { if (k === atual) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  }

  /* ---------- Autoplay ---------- */
  // O tempo de cada sabor é a animação da barrinha do ponto ativo; quando ela termina, passa.
  // Pausar a animação (mouse em cima, foco, fora da tela, aba escondida) pausa a troca junto.
  function atualizarPausa() {
    var pausado = Object.keys(pausas).some(function (k) { return pausas[k]; });
    raiz.classList.toggle('is-pausado', pausado);
  }
  function pausar(motivo, sim) { pausas[motivo] = sim; atualizarPausa(); }

  function ligarAuto(sim) {
    auto = !!sim;
    raiz.classList.toggle('is-auto', auto);
    var b = raiz.querySelector('[data-sabor-pausa]');
    if (b) {
      b.setAttribute('aria-pressed', String(!auto));
      b.classList.toggle('is-parado', !auto);
      var r = b.querySelector('[data-sabor-pausa-rotulo]');
      if (r) r.textContent = auto ? 'Pausar troca automática' : 'Retomar troca automática';
    }
    // durante a troca automática o leitor de tela não anuncia cada sabor
    var vivo = document.getElementById('sabores-infos');
    if (vivo) vivo.setAttribute('aria-live', auto ? 'off' : 'polite');
  }

  // qualquer interação da pessoa para a troca automática
  function interagiu() { if (auto) ligarAuto(false); }

  /* ---------- Parallax (mouse e rolagem) ---------- */
  function parallax() {
    var palco = document.getElementById('sabores-palco');
    var alvo = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, rolagem = 0, rodando = false;
    var fino = window.matchMedia('(hover: hover) and (pointer: fine)');

    function quadro() {
      pos.x += (alvo.x - pos.x) * 0.08;
      pos.y += (alvo.y - pos.y) * 0.08;
      palco.style.setProperty('--mx', pos.x.toFixed(3));
      palco.style.setProperty('--my', pos.y.toFixed(3));
      palco.style.setProperty('--sp', rolagem.toFixed(3));
      if (Math.abs(alvo.x - pos.x) > 0.002 || Math.abs(alvo.y - pos.y) > 0.002) requestAnimationFrame(quadro);
      else rodando = false;
    }
    function mexer() { if (!rodando) { rodando = true; requestAnimationFrame(quadro); } }

    raiz.addEventListener('pointermove', function (e) {
      if (!fino.matches || e.pointerType !== 'mouse' || A.reduzMovimento()) return;
      var r = raiz.getBoundingClientRect();
      alvo.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      alvo.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      mexer();
    });
    raiz.addEventListener('pointerleave', function () { alvo.x = 0; alvo.y = 0; mexer(); });

    var hero = document.getElementById('inicio');
    window.addEventListener('scroll', function () {
      if (!visivel || A.reduzMovimento()) return;
      var h = hero.offsetHeight || 1;
      rolagem = Math.min(Math.max(window.scrollY / h, 0), 1);
      mexer();
    }, { passive: true });
  }

  /* ---------- Deslizar o dedo ---------- */
  function deslizar() {
    var palco = document.getElementById('sabores-palco');
    var ini = null;
    palco.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      ini = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId };
    });
    function fim(e) {
      if (!ini || e.pointerId !== ini.id) return;
      var dx = e.clientX - ini.x, dy = e.clientY - ini.y;
      ini = null;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        interagiu();
        irPara(atual + (dx < 0 ? 1 : -1), { dir: dx < 0 ? 1 : -1 });
      }
    }
    palco.addEventListener('pointerup', fim);
    palco.addEventListener('pointercancel', function () { ini = null; });
    // impede que o navegador "arraste" a foto no computador
    palco.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  /* ---------- Tamanho do nome gigante: ocupa a largura da tela sem cortar ---------- */
  function ajustarNomes() {
    var largura = document.documentElement.clientWidth * (window.innerWidth > 960 ? 0.92 : 0.94);
    // ajusta por escala (não mexe no layout: nada "pula" na página)
    raiz.querySelectorAll('.sabor__linha').forEach(function (el) {
      el.style.scale = '';
      var cs = getComputedStyle(el);
      var base = parseFloat(cs.fontSize) || 100;
      var w = el.offsetWidth;
      if (!w) return;
      el.style.fontSize = 'var(--gig-max)';
      var max = parseFloat(getComputedStyle(el).fontSize) || base;
      el.style.fontSize = '';
      el.style.scale = Math.min(largura / w, max / base).toFixed(3);
    });
  }

  /* ---------- Montagem ---------- */
  function montar() {
    var total = lista.length;
    var copoAntigo = raiz.querySelector('#sabores-slides .sabor__copo img');

    document.getElementById('sabores-fundos').innerHTML = lista.map(htmlFundo).join('');
    document.getElementById('sabores-slides').innerHTML = lista.map(function (s, i) { return htmlSlide(s, i, total); }).join('');
    document.getElementById('sabores-infos').innerHTML = lista.map(function (s, i) { return htmlInfo(s, i, total); }).join('');

    // reaproveita a foto do primeiro copo que já estava na tela (sem piscar)
    var copoNovo = raiz.querySelector('#sabores-slides .sabor__copo img');
    if (copoAntigo && copoNovo && copoAntigo.getAttribute('src') === copoNovo.getAttribute('src')) {
      copoNovo.parentNode.replaceChild(copoAntigo, copoNovo);
    }

    document.getElementById('sabores-nomes').innerHTML = lista.map(function (s, i) {
      return '<li><button type="button" class="sabores__nome" data-ir="' + i + '"' + (i === 0 ? ' aria-current="true"' : '') + '>' +
        '<span class="sabores__nome-num" aria-hidden="true">' + dois(i + 1) + '</span>' + A.esc(s.nome) + '</button></li>';
    }).join('');
    document.getElementById('sabores-dots').innerHTML = lista.map(function (s, i) {
      return '<button type="button" class="sabores__dot" data-ir="' + i + '" aria-label="Mostrar ' + A.esc(s.titulo) + '"' + (i === 0 ? ' aria-current="true"' : '') + '><span></span></button>';
    }).join('');

    slides = Array.prototype.slice.call(raiz.querySelectorAll('.sabor'));
    fundos = Array.prototype.slice.call(raiz.querySelectorAll('.sabores__fundo'));
    infos = Array.prototype.slice.call(raiz.querySelectorAll('.sabor-info'));
    nomes = Array.prototype.slice.call(raiz.querySelectorAll('.sabores__nome'));
    dots = Array.prototype.slice.call(raiz.querySelectorAll('.sabores__dot'));
    slides[0]._carregado = true;
    raiz.style.setProperty('--intervalo', (Math.max(+cfg.intervalo || 4000, 2000)) + 'ms');
    document.getElementById('sabores-controles').hidden = total < 2;
  }

  function eventos() {
    raiz.addEventListener('click', function (e) {
      var ir = e.target.closest('[data-ir]');
      if (ir) { interagiu(); var n = +ir.dataset.ir; irPara(n, { dir: n > atual ? 1 : -1 }); return; }
      if (e.target.closest('[data-sabor-anterior]')) { interagiu(); irPara(atual - 1, { dir: -1 }); return; }
      if (e.target.closest('[data-sabor-proximo]')) { interagiu(); irPara(atual + 1, { dir: 1 }); return; }
      if (e.target.closest('[data-sabor-pausa]')) {
        // retomar é um pedido explícito: vale mesmo com o foco dentro do slider
        if (!auto) { pausas.foco = false; pausas.mouse = false; atualizarPausa(); }
        ligarAuto(!auto);
        return;
      }
      var pedir = e.target.closest('[data-sabor-pedir]');
      if (pedir) {
        interagiu();
        var s = lista[+pedir.dataset.saborPedir];
        var p = s && A.produto(s.produtoId);
        if (p && A.cardapio) A.cardapio.abrirModal(p, { tamanhoId: '500', adicionais: s.adicionais || [] });
      }
    });

    // setas do teclado com o foco dentro do slider
    raiz.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.target.closest('input, textarea, select')) return;
      e.preventDefault();
      interagiu();
      irPara(atual + (e.key === 'ArrowRight' ? 1 : -1), { dir: e.key === 'ArrowRight' ? 1 : -1 });
      var foco = e.target.closest('[data-ir]');
      if (foco) { var grupo = foco.classList.contains('sabores__dot') ? dots : nomes; if (grupo[atual]) grupo[atual].focus(); }
    });

    // o tempo de cada sabor acabou: próximo
    raiz.addEventListener('animationend', function (e) {
      if (e.animationName !== 'sabor-progresso' || !auto) return;
      irPara(atual + 1, { dir: 1 });
    });

    // pausa enquanto a pessoa lê ou mexe nos controles
    var painel = raiz.querySelectorAll('.sabores__nomes, .sabores__controles, .sabores__infos');
    painel.forEach(function (el) {
      el.addEventListener('mouseenter', function () { pausar('mouse', true); });
      el.addEventListener('mouseleave', function () { pausar('mouse', false); });
    });
    raiz.addEventListener('focusin', function (e) { if (e.target.matches(':focus-visible')) pausar('foco', true); });
    raiz.addEventListener('focusout', function (e) { if (!raiz.contains(e.relatedTarget)) pausar('foco', false); });

    document.addEventListener('visibilitychange', function () { pausar('aba', document.hidden); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visivel = en[0].isIntersecting;
        raiz.classList.toggle('is-fora', !visivel);
        pausar('fora', !visivel);
      }, { threshold: 0.15 }).observe(raiz);
    }

    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(ajustarNomes, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarNomes);

    // com "reduzir movimento" ligado no meio da visita, a troca automática para
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
      if (e.matches) ligarAuto(false);
      atualizarBotaoPausa();
    });
  }

  function atualizarBotaoPausa() {
    var b = raiz.querySelector('[data-sabor-pausa]');
    if (b) b.hidden = !cfg.autoplay || A.reduzMovimento() || slides.length < 2;
  }

  function init() {
    cfg = (D && D.sabores) || {};
    lista = (cfg.lista || []).filter(function (s) { return s && s.copo && s.titulo; });
    raiz = document.getElementById('sabores');
    if (!raiz || !lista.length) return;

    montar();
    eventos();
    parallax();
    deslizar();
    ajustarNomes();
    atualizarBotaoPausa();
    ligarAuto(cfg.autoplay !== false && !A.reduzMovimento() && slides.length > 1);
    raiz.classList.add('is-montado');
    // entrada do primeiro sabor: o copo já está na tela; o nome e os ingredientes chegam em seguida
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      var s0 = slides[0];
      if (s0.classList.contains('is-primeiro')) { s0.classList.remove('is-primeiro'); s0.classList.add('is-ativo'); }
    }); });

    // fotos dos outros sabores: o 2º carrega quando a página termina; cada um dos
    // seguintes, quando o anterior entra na tela (ver irPara)
    function depois() { carregarImagens(slides[1]); }
    if (document.readyState === 'complete') setTimeout(depois, 300);
    else window.addEventListener('load', function () { setTimeout(depois, 300); });
  }

  A.sabores = { irPara: function (n) { irPara(n); }, atual: function () { return atual; } };
  A.on('init', init);
})();

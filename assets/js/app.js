/* =====================================================================
   Inicialização: liga os módulos na ordem certa, monta o rodapé com
   as informações de contato de dados.js e ajusta textos que dependem
   da configuração da loja (entrega, retirada, WhatsApp).
   ===================================================================== */
(function () {
  'use strict';

  var A = window.Acai;
  var D = A.dados;
  var MSG_WHATS = 'Olá! Vim pelo site e gostaria de fazer um pedido.';

  // Linha de informação: só aparece quando o dado existe em dados.js (nada é inventado)
  function linha(icone, conteudo) {
    return conteudo ? '<li>' + A.icone(icone) + '<span>' + conteudo + '</span></li>' : '';
  }
  function soDigitos(v) { return String(v || '').replace(/\D/g, ''); }

  function renderRodape() {
    var el = document.getElementById('rodape-conteudo');
    if (!el) return;
    var c = D.contato;
    var L = D.loja;
    var whats = A.linkWhats(MSG_WHATS);

    var contato =
      linha('whats', '<a href="' + A.esc(whats) + '" target="_blank" rel="noopener">' + (c.whatsappExibicao ? 'WhatsApp ' + A.esc(c.whatsappExibicao) : 'Fale pelo WhatsApp') + '</a>') +
      linha('telefone', c.telefone ? '<a href="tel:+55' + soDigitos(c.telefone) + '">' + A.esc(c.telefone) + '</a>' : '') +
      linha('insta', c.instagram ? '<a href="https://instagram.com/' + A.esc(c.instagram) + '" target="_blank" rel="noopener">@' + A.esc(c.instagram) + '</a>' : '') +
      linha('local', c.endereco
        ? A.esc(c.endereco) + (c.cidade ? '<br>' + A.esc(c.cidade) : '') + (c.mapa ? '<br><a href="' + A.esc(c.mapa) + '" target="_blank" rel="noopener">Ver no mapa</a>' : '')
        : '');

    var horarios = (c.horarios || []).map(function (h) {
      return '<li>' + A.icone('relogio') + '<span><b>' + A.esc(h.dias) + '</b><br>' + A.esc(h.horas) + '</span></li>';
    }).join('');

    var pedidos = '';
    if (L.entrega) pedidos += linha('sacola', 'Entrega: ' + (typeof L.taxaEntrega === 'number' ? 'taxa de ' + A.preco(L.taxaEntrega) : 'taxa a combinar'));
    if (L.retirada) pedidos += linha('local', 'Retirada no balcão');
    pedidos += linha('whats', 'Pedidos pelo WhatsApp');
    if ((L.formasPagamento || []).length) {
      pedidos += linha('cartao', 'Pagamento<span class="rodape__pagamentos">' +
        L.formasPagamento.map(function (f) { return '<span>' + A.esc(f) + '</span>'; }).join('') + '</span>');
    }

    // Aviso único (só em modo demonstração) com o que ainda falta preencher em dados.js
    var faltam = [];
    if (!c.whatsapp) faltam.push('WhatsApp');
    if (!c.telefone) faltam.push('telefone');
    if (!c.endereco) faltam.push('endereço');
    if (!(c.horarios || []).length) faltam.push('horário de funcionamento');
    if (!c.instagram) faltam.push('Instagram');
    var aviso = L.modoDemonstracao && faltam.length
      ? '<p class="rodape__pendente">' + A.icone('relogio') + '<span>Em configuração: ' + A.esc(faltam.join(', ').replace(/, ([^,]*)$/, ' e $1')) + '.</span></p>' : '';

    var social = (c.instagram ? '<a href="https://instagram.com/' + A.esc(c.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram">' + A.icone('insta') + '</a>' : '') +
      '<a href="' + A.esc(whats) + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + A.icone('whats') + '</a>';

    var colunas = [
      '<div><h2 class="rodape__titulo">Contato</h2><ul>' + contato + '</ul></div>',
      horarios ? '<div><h2 class="rodape__titulo">Horário de funcionamento</h2><ul>' + horarios + '</ul></div>' : '',
      '<div><h2 class="rodape__titulo">Pedidos</h2><ul>' + pedidos + '</ul></div>',
      '<div><h2 class="rodape__titulo">Navegue</h2><ul>' +
        '<li><a href="#cardapio">Cardápio</a></li><li><a href="#combos">Combos</a></li>' +
        '<li><a href="#promocoes">Promoções</a></li><li><a href="#monte">Monte o seu</a></li>' +
      '</ul></div>',
    ].filter(Boolean);

    el.innerHTML =
      '<div class="rodape__grid" style="--colunas:' + colunas.length + '">' +
        '<div class="rodape__marca">' +
          '<a class="logo" href="#inicio" aria-label="' + A.esc(D.marca.nome) + ', início"><img class="logo__img" src="assets/img/logo.svg" width="323" height="133" alt="" loading="lazy"></a>' +
          '<p>' + A.esc(D.marca.slogan) + '</p>' +
          '<div class="rodape__social">' + social + '</div>' +
        '</div>' + colunas.join('') +
      '</div>' + aviso +
      '<div class="rodape__base"><p>© ' + new Date().getFullYear() + ' ' + A.esc(D.marca.nome) + '. Todos os direitos reservados.</p><p>Imagens ilustrativas.</p></div>';
  }

  // Textos do herói que dependem da loja
  function ajustarTextos() {
    var L = D.loja;
    var li = document.querySelector('[data-se-entrega]');
    var txt = document.querySelector('[data-texto-entrega]');
    if (li && txt) {
      if (L.entrega && L.retirada) txt.textContent = 'Entrega ou retirada';
      else if (L.entrega) txt.textContent = 'Entrega';
      else if (L.retirada) txt.textContent = 'Retirada no balcão';
      else li.hidden = true;
    }
    document.querySelectorAll('[data-whats-link]').forEach(function (a) { a.href = A.linkWhats(MSG_WHATS); });
  }

  function iniciar() {
    if (D.loja.modoDemonstracao) {
      document.querySelectorAll('[data-aviso-demo]').forEach(function (el) { el.hidden = false; });
    }
    ajustarTextos();
    renderRodape();
    A.emit('init');          // carrinho, cardápio e montador se montam aqui
    A.animacoes.init();      // depois do conteúdo pronto, para observar tudo
    window.__acaiOk = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();

/* =====================================================================
   DADOS DO SITE: Açaí Batido na Hora
   ---------------------------------------------------------------------
   Este é o ÚNICO arquivo que precisa ser editado para mudar preços,
   produtos, fotos, promoções, contato e horários.

   - Preços: números com ponto decimal (ex.: 18.9 = R$ 18,90).
   - Fotos: caminho a partir da pasta do site. Troque o arquivo em
     assets/img/fotos/... mantendo o nome, ou aponte para outro arquivo.
   - Para esconder um item sem apagar, use disponivel: false.
   - Para tirar uma promoção do ar, use ativa: false.

   ATENÇÃO: os preços abaixo são EXEMPLOS. Troque pelos preços reais e
   depois mude loja.modoDemonstracao para false.
   ===================================================================== */
window.ACAI_DADOS = {

  marca: {
    nome: 'Açaí Batido na Hora',
    slogan: 'Seu momento mais delicioso começa aqui.',
  },

  contato: {
    // DDI + DDD + número, só dígitos. Ex.: '5511987654321'.
    // Vazio: o botão abre o WhatsApp para a pessoa escolher o contato.
    whatsapp: '',
    whatsappExibicao: '',      // como o número aparece no site. Ex.: '(11) 98765-4321'
    telefone: '',              // telefone para ligação, se houver. Ex.: '(11) 3333-4444'
    instagram: '',             // usuário sem @. Ex.: 'acaibatidonahora'
    endereco: '',              // Ex.: 'Rua Exemplo, 100, Centro'
    cidade: '',                // Ex.: 'São Paulo, SP'
    mapa: '',                  // link do Google Maps
    horarios: [
      // { dias: 'Segunda a sexta', horas: '13h às 23h' },
    ],
  },

  loja: {
    modoDemonstracao: true,    // true mostra o aviso "preços de exemplo"
    entrega: true,             // oferece entrega
    retirada: true,            // oferece retirada no balcão
    taxaEntrega: null,         // número (ex.: 5) ou null para "a combinar"
    formasPagamento: ['Pix', 'Cartão na entrega', 'Dinheiro'],
  },

  /* Grupos de adicionais (usados no "Monte seu açaí" e na personalização) */
  gruposAdicionais: [
    { id: 'frutas', nome: 'Frutas' },
    { id: 'complementos', nome: 'Complementos' },
    { id: 'caldas', nome: 'Caldas' },   // aparece quando houver adicionais com grupo: 'caldas'
  ],

  adicionais: [
    { id: 'morango', nome: 'Morango', grupo: 'frutas', preco: 3.0, imagem: 'assets/img/fotos/adicionais/morango.webp', disponivel: true },
    { id: 'banana', nome: 'Banana', grupo: 'frutas', preco: 2.0, imagem: 'assets/img/fotos/adicionais/banana.webp', disponivel: true },
    { id: 'kiwi', nome: 'Kiwi', grupo: 'frutas', preco: 3.5, imagem: 'assets/img/fotos/adicionais/kiwi.webp', disponivel: true },
    { id: 'granola', nome: 'Granola', grupo: 'complementos', preco: 2.0, imagem: 'assets/img/fotos/adicionais/granola.webp', disponivel: true },
    { id: 'leite-em-po', nome: 'Leite em pó', grupo: 'complementos', preco: 2.5, imagem: 'assets/img/fotos/adicionais/leite-em-po.webp', disponivel: true },
    { id: 'leite-condensado', nome: 'Leite condensado', grupo: 'complementos', preco: 2.5, imagem: 'assets/img/fotos/adicionais/leite-condensado.webp', disponivel: true },
    { id: 'nutella', nome: 'Nutella', grupo: 'complementos', preco: 5.0, imagem: 'assets/img/fotos/adicionais/nutella.webp', disponivel: true },
    { id: 'mousse-morango', nome: 'Mousse de morango', grupo: 'complementos', preco: 4.0, imagem: 'assets/img/fotos/adicionais/mousse-morango.webp', disponivel: true },
    { id: 'calda-chocolate', nome: 'Calda de chocolate', grupo: 'complementos', preco: 2.5, imagem: 'assets/img/fotos/adicionais/calda-chocolate.webp', disponivel: true },
  ],

  /* Nomes dos tamanhos padrão */
  tamanhos: {
    '300': '300 ml',
    '500': '500 ml',
    '700': '700 ml',
    '1000': '1 litro',
  },

  /* Abas do cardápio, na ordem em que aparecem */
  categorias: [
    { id: 'copos', nome: 'Copos de açaí' },
    { id: 'tigelas', nome: 'Tigelas' },
    { id: 'combos', nome: 'Combos' },
    { id: 'barcas', nome: 'Barcas' },
    { id: 'promocoes', nome: 'Promoções' },
    { id: 'adicionais', nome: 'Adicionais' },
  ],

  /* ------------------------------------------------------------------
     PRODUTOS
     tamanhos: lista de { id, preco } usando os ids de "tamanhos" acima,
               ou { id, rotulo, preco } para um tamanho próprio.
               precoDe (opcional) mostra o preço antigo riscado.
     ingredientes: o que já vem no produto (vai na mensagem do pedido).
     personalizavel: true deixa o cliente incluir adicionais.
     adicionaisInclusos (no tamanho): quantos adicionais já estão no preço
               (ex.: "300 ml + 2 adicionais"). Os demais são cobrados.
     ------------------------------------------------------------------ */
  produtos: [
    /* Copos */
    {
      id: 'copo-tradicional', categoria: 'copos', nome: 'Açaí tradicional',
      descricao: 'Açaí puro, grosso e cremoso, batido na hora.',
      imagem: 'assets/img/fotos/produtos/copo-tradicional.webp',
      tamanhos: [{ id: '300', preco: 12 }, { id: '500', preco: 16 }, { id: '700', preco: 20 }, { id: '1000', preco: 27 }],
      ingredientes: [], personalizavel: true, disponivel: true,
    },
    {
      id: 'copo-morango', categoria: 'copos', nome: 'Açaí com morango',
      descricao: 'Açaí cremoso com morangos frescos fatiados.',
      imagem: 'assets/img/fotos/produtos/copo-morango.webp',
      tamanhos: [{ id: '300', preco: 14 }, { id: '500', preco: 18 }, { id: '700', preco: 23 }, { id: '1000', preco: 30 }],
      ingredientes: ['Morango'], personalizavel: true, disponivel: true,
    },
    {
      id: 'copo-banana', categoria: 'copos', nome: 'Açaí com banana',
      descricao: 'Açaí com rodelas de banana e um toque de granola.',
      imagem: 'assets/img/fotos/produtos/copo-banana.webp',
      tamanhos: [{ id: '300', preco: 13 }, { id: '500', preco: 17 }, { id: '700', preco: 22 }, { id: '1000', preco: 29 }],
      ingredientes: ['Banana', 'Granola'], personalizavel: true, disponivel: true,
    },
    {
      id: 'copo-granola', categoria: 'copos', nome: 'Açaí com granola',
      descricao: 'Açaí com granola crocante, morango e frutas vermelhas.',
      imagem: 'assets/img/fotos/produtos/copo-granola.webp',
      tamanhos: [{ id: '300', preco: 14 }, { id: '500', preco: 18 }, { id: '700', preco: 23 }, { id: '1000', preco: 30 }],
      ingredientes: ['Granola', 'Morango', 'Frutas vermelhas'], personalizavel: true, disponivel: true,
    },
    {
      id: 'copo-especial', categoria: 'copos', nome: 'Açaí especial',
      descricao: 'Banana, morango, granola e leite em pó por cima.',
      imagem: 'assets/img/fotos/produtos/copo-especial.webp',
      tamanhos: [{ id: '300', preco: 17 }, { id: '500', preco: 22 }, { id: '700', preco: 27 }, { id: '1000', preco: 35 }],
      ingredientes: ['Banana', 'Morango', 'Granola', 'Leite em pó'], personalizavel: true, disponivel: true, selo: 'Mais pedido',
    },
    {
      id: 'copo-premium', categoria: 'copos', nome: 'Açaí premium',
      descricao: 'Camadas de açaí, Nutella, leite condensado, morango e leite em pó.',
      imagem: 'assets/img/fotos/produtos/copo-premium.webp',
      tamanhos: [{ id: '300', preco: 19 }, { id: '500', preco: 25 }, { id: '700', preco: 31 }, { id: '1000', preco: 39 }],
      ingredientes: ['Nutella', 'Leite condensado', 'Morango', 'Leite em pó'], personalizavel: true, disponivel: true,
    },

    /* Tigelas */
    {
      id: 'tigela-frutas-vermelhas', categoria: 'tigelas', nome: 'Tigela frutas vermelhas',
      descricao: 'Açaí na tigela com mirtilo, framboesa, amora, granola e hortelã.',
      imagem: 'assets/img/fotos/produtos/tigela-frutas-vermelhas.webp',
      tamanhos: [{ id: '500', preco: 24 }, { id: '700', preco: 30 }],
      ingredientes: ['Frutas vermelhas', 'Granola', 'Hortelã'], personalizavel: true, disponivel: true,
    },
    {
      id: 'tigela-tropical', categoria: 'tigelas', nome: 'Tigela tropical',
      descricao: 'Morango, kiwi, granola e coco ralado sobre açaí cremoso.',
      imagem: 'assets/img/fotos/produtos/tigela-tropical.webp',
      tamanhos: [{ id: '500', preco: 22 }, { id: '700', preco: 28 }],
      ingredientes: ['Morango', 'Kiwi', 'Granola', 'Coco ralado'], personalizavel: true, disponivel: true,
    },
    {
      id: 'tigela-banana', categoria: 'tigelas', nome: 'Tigela banana e cacau',
      descricao: 'Banana fatiada, nibs de cacau e coco ralado.',
      imagem: 'assets/img/fotos/produtos/tigela-banana.webp',
      tamanhos: [{ id: '500', preco: 20 }, { id: '700', preco: 26 }],
      ingredientes: ['Banana', 'Nibs de cacau', 'Coco ralado'], personalizavel: true, disponivel: true,
    },
    {
      id: 'tigela-do-seu-jeito', categoria: 'tigelas', nome: 'Tigela do seu jeito',
      descricao: 'A tigela base de açaí. Você escolhe as frutas e os complementos.',
      imagem: 'assets/img/fotos/produtos/tigela-do-seu-jeito.webp',
      tamanhos: [{ id: '500', preco: 18 }, { id: '700', preco: 24 }],
      ingredientes: [], personalizavel: true, disponivel: true, abrirPersonalizacao: true,
    },

    /* Combos (nomes da referência da loja; descrições e preços são exemplos) */
    {
      id: 'combo-ultra', categoria: 'combos', nome: 'Combo Ultra', nomeScript: 'Ultra',
      descricao: 'O mais completo: morango, banana, mirtilo, granola e Nutella.',
      imagem: 'assets/img/fotos/produtos/combo-ultra.webp',
      tamanhos: [{ id: 'unico', rotulo: 'Copo de 700 ml', preco: 29.9 }],
      ingredientes: ['Morango', 'Banana', 'Mirtilo', 'Granola', 'Nutella'], personalizavel: false, disponivel: true, selo: 'Mais pedido',
    },
    {
      id: 'combo-ninho', categoria: 'combos', nome: 'Combo Ninho', nomeScript: 'Ninho',
      descricao: 'Açaí com leite em pó, leite condensado e morango.',
      imagem: 'assets/img/fotos/produtos/combo-ninho.webp',
      tamanhos: [{ id: 'unico', rotulo: 'Copo de 500 ml', preco: 21.9 }],
      ingredientes: ['Leite em pó', 'Leite condensado', 'Morango'], personalizavel: false, disponivel: true,
    },
    {
      id: 'combo-magnifico', categoria: 'combos', nome: 'Combo Magnífico', nomeScript: 'Magnífico',
      descricao: 'Camadas de açaí com Nutella, morango, granola e leite em pó.',
      imagem: 'assets/img/fotos/produtos/combo-magnifico.webp',
      tamanhos: [{ id: 'unico', rotulo: 'Copo de 500 ml', preco: 24.9 }],
      ingredientes: ['Nutella', 'Morango', 'Granola', 'Leite em pó'], personalizavel: false, disponivel: true,
    },
    {
      id: 'combo-tropical', categoria: 'combos', nome: 'Combo Tropical', nomeScript: 'Tropical',
      descricao: 'Tigela com granola, coco ralado, goji e pasta de amendoim.',
      imagem: 'assets/img/fotos/produtos/combo-tropical.webp',
      tamanhos: [{ id: 'unico', rotulo: 'Tigela de 500 ml', preco: 26.9 }],
      ingredientes: ['Granola', 'Coco ralado', 'Goji berry', 'Pasta de amendoim'], personalizavel: false, disponivel: true,
    },

    /* Barcas */
    {
      id: 'barca-media', categoria: 'barcas', nome: 'Barca média',
      descricao: 'Barca de açaí com morango, banana, framboesa, chia, coco e castanhas. Serve 2 pessoas.',
      imagem: 'assets/img/fotos/produtos/barca-media.webp',
      tamanhos: [{ id: 'unico', rotulo: '700 ml', preco: 39.9 }],
      ingredientes: ['Morango', 'Banana', 'Framboesa', 'Chia', 'Coco ralado', 'Castanhas'], personalizavel: true, disponivel: true,
    },
    {
      id: 'barca-grande', categoria: 'barcas', nome: 'Barca grande',
      descricao: 'A barca completa, com frutas, granola, coco e castanhas. Serve 3 a 4 pessoas.',
      imagem: 'assets/img/fotos/produtos/barca-grande.webp',
      tamanhos: [{ id: 'unico', rotulo: '1 litro', preco: 54.9 }],
      ingredientes: ['Morango', 'Banana', 'Framboesa', 'Granola', 'Coco ralado', 'Castanhas'], personalizavel: true, disponivel: true,
    },

    /* Promoções (ficam na aba Promoções e nos banners) */
    {
      id: 'promo-terca', categoria: 'promocoes', nome: 'Terça em dobro',
      descricao: 'Dois copos de 500 ml com granola e morango pelo preço especial de terça.',
      imagem: 'assets/img/fotos/produtos/promo-terca.webp',
      tamanhos: [{ id: 'unico', rotulo: '2 copos de 500 ml', preco: 27, precoDe: 36 }],
      ingredientes: ['Granola', 'Morango'], personalizavel: false, disponivel: true,
    },
    {
      id: 'promo-sextou', categoria: 'promocoes', nome: 'Sextou com açaí',
      descricao: 'Qualquer copo de 300 ml com 2 adicionais.',
      imagem: 'assets/img/fotos/produtos/promo-sextou.webp',
      tamanhos: [{ id: 'unico', rotulo: 'Copo de 300 ml + 2 adicionais', preco: 10, precoDe: 16, adicionaisInclusos: 2 }],
      ingredientes: [], personalizavel: true, disponivel: true,
    },
    {
      id: 'promo-barca', categoria: 'promocoes', nome: 'Barca completa',
      descricao: 'Barca de 1 litro com 10 adicionais. Ideal para a galera.',
      imagem: 'assets/img/fotos/produtos/promo-barca.webp',
      tamanhos: [{ id: 'unico', rotulo: '1 litro + 10 adicionais', preco: 49.9, precoDe: 64.9, adicionaisInclusos: 10 }],
      ingredientes: [], personalizavel: true, disponivel: true,
    },
  ],

  /* Os 4 combos que aparecem na seção "Nossos combos" (ids de produtos) */
  combosEmDestaque: ['combo-ultra', 'combo-ninho', 'combo-magnifico', 'combo-tropical'],

  /* Slider de sabores da primeira tela.
     - Cada sabor abre o produto de "produtoId" já com os "adicionais" marcados
       (use [] para nenhum). O preço mostrado vem do próprio produto.
     - tema: cor de fundo do slide ('acai', 'morango', 'ninho' ou 'chocolate').
     - copo: foto do copo com fundo transparente, 720 x 1080 px, copo apoiado
       na base da imagem (+ versão "-480" com 480 x 720 px para o celular).
     - ingredientes: fotos recortadas que flutuam em volta do copo.
       x e y: posição do centro (% da cena), tamanho: largura (% da cena),
       giro: graus, prof: profundidade (acima de 1 fica na frente do copo e
       mexe mais no parallax; abaixo de 1 fica atrás e desfocado).
     FOTOS DE DEMONSTRAÇÃO: troque pelas fotos reais dos copos da loja. */
  sabores: {
    autoplay: true,        // passa de um sabor para o outro sozinho
    intervalo: 4000,       // tempo de cada sabor, em milissegundos
    lista: [
      {
        id: 'tradicional', nome: 'Tradicional', titulo: 'Açaí Tradicional',
        descricao: 'Banana, granola e açaí.', tema: 'acai',
        copo: 'assets/img/fotos/sabores/copo-tradicional.webp',
        produtoId: 'copo-tradicional', adicionais: ['banana', 'granola'],
        ingredientes: [
          { imagem: 'assets/img/fotos/sabores/banana-1.webp', x: 17, y: 26, tamanho: 12, giro: -18, prof: 1.35 },
          { imagem: 'assets/img/fotos/sabores/banana-3.webp', x: 84, y: 20, tamanho: 10.5, giro: 24, prof: 0.6 },
          { imagem: 'assets/img/fotos/sabores/banana-2.webp', x: 74, y: 70, tamanho: 12, giro: 10, prof: 1.6 },
          { imagem: 'assets/img/fotos/sabores/banana-4.webp', x: 28, y: 84, tamanho: 9.6, giro: -34, prof: 0.55 },
          { imagem: 'assets/img/fotos/sabores/baga.webp', x: 36, y: 6, tamanho: 7.1, giro: 0, prof: 1.1 },
          { imagem: 'assets/img/fotos/sabores/baga.webp', x: 79, y: 44, tamanho: 6.3, giro: 50, prof: 1.25 },
        ],
      },
      {
        id: 'morango', nome: 'Morango', titulo: 'Açaí com Morango',
        descricao: 'Morangos frescos e açaí.', tema: 'morango',
        copo: 'assets/img/fotos/sabores/copo-morango.webp',
        produtoId: 'copo-morango', adicionais: [],
        ingredientes: [
          { imagem: 'assets/img/fotos/sabores/morango-1.webp', x: 18, y: 28, tamanho: 12, giro: -14, prof: 1.35 },
          { imagem: 'assets/img/fotos/sabores/morango-2.webp', x: 83, y: 22, tamanho: 10, giro: 18, prof: 0.6 },
          { imagem: 'assets/img/fotos/sabores/morango-3.webp', x: 74, y: 72, tamanho: 11, giro: -8, prof: 1.6 },
          { imagem: 'assets/img/fotos/sabores/morango-1.webp', x: 29, y: 84, tamanho: 7, giro: 40, prof: 0.55 },
          { imagem: 'assets/img/fotos/sabores/baga.webp', x: 64, y: 5, tamanho: 6.3, giro: 20, prof: 1.1 },
        ],
      },
      {
        id: 'ninho', nome: 'Ninho', titulo: 'Açaí com Ninho',
        descricao: 'Creme de leite em pó e açaí.', tema: 'ninho',
        copo: 'assets/img/fotos/sabores/copo-ninho.webp',
        produtoId: 'combo-ninho', adicionais: [],
        ingredientes: [
          { imagem: 'assets/img/fotos/sabores/colher-leite.webp', x: 25, y: 77, tamanho: 18, giro: -14, prof: 1.5 },
          { imagem: 'assets/img/fotos/sabores/baga.webp', x: 80, y: 30, tamanho: 7.1, giro: 0, prof: 1.2 },
          { imagem: 'assets/img/fotos/sabores/baga.webp', x: 20, y: 22, tamanho: 6.3, giro: 30, prof: 0.6 },
          { imagem: 'assets/img/fotos/sabores/morango-3.webp', x: 75, y: 70, tamanho: 10, giro: 12, prof: 1.4 },
          { imagem: 'assets/img/fotos/sabores/morango-1.webp', x: 82, y: 14, tamanho: 7, giro: -30, prof: 0.55 },
        ],
      },
      {
        id: 'nutella', nome: 'Nutella', titulo: 'Açaí com Nutella',
        descricao: 'Chocolate, creme e açaí.', tema: 'chocolate',
        copo: 'assets/img/fotos/sabores/copo-nutella.webp',
        produtoId: 'copo-tradicional', adicionais: ['nutella'],
        ingredientes: [
          { imagem: 'assets/img/fotos/sabores/choco-1.webp', x: 18, y: 28, tamanho: 11, giro: -18, prof: 1.35 },
          { imagem: 'assets/img/fotos/sabores/choco-2.webp', x: 84, y: 20, tamanho: 9, giro: 22, prof: 0.6 },
          { imagem: 'assets/img/fotos/sabores/choco-3.webp', x: 75, y: 72, tamanho: 12, giro: 8, prof: 1.6 },
          { imagem: 'assets/img/fotos/sabores/avela-1.webp', x: 28, y: 84, tamanho: 10.2, giro: 0, prof: 0.55 },
          { imagem: 'assets/img/fotos/sabores/avela-2.webp', x: 64, y: 6, tamanho: 8.2, giro: 30, prof: 1.1 },
        ],
      },
    ],
  },

  /* Banners da seção "Promoções irresistíveis" (os 2 primeiros ativos aparecem) */
  promocoes: [
    {
      id: 'banner-terca', produtoId: 'promo-terca', ativa: true,
      chamada: 'Terça em dobro', titulo: '2 copos de 500 ml',
      texto: 'Toda terça-feira, no balcão e no delivery.',
      imagem: 'assets/img/fotos/promocoes/terca.webp',
    },
    {
      id: 'banner-barca', produtoId: 'promo-barca', ativa: true,
      chamada: 'Chama no delivery', titulo: 'Barca de açaí?',
      texto: 'Barca completa de 1 litro com 10 adicionais.',
      imagem: 'assets/img/fotos/promocoes/barca.webp',
    },
    {
      id: 'banner-sextou', produtoId: 'promo-sextou', ativa: true,
      chamada: 'Sextoooou!', titulo: 'Com gosto de açaí',
      texto: 'Qualquer copo de 300 ml com 2 adicionais.',
      imagem: 'assets/img/fotos/promocoes/sextou.webp',
    },
  ],

  /* "Monte seu açaí": preço base de cada tamanho (os adicionais somam por cima) */
  montador: {
    nome: 'Açaí do seu jeito',
    imagem: 'assets/img/fotos/produtos/copo-tradicional.webp',
    tamanhos: [
      { id: '300', preco: 12 },
      { id: '500', preco: 16 },
      { id: '700', preco: 20 },
      { id: '1000', preco: 27 },
    ],
    tamanhoInicial: '500',
  },
};

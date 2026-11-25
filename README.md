# Açaí Batido na Hora: site e cardápio digital

HTML, CSS e JavaScript puros. Não precisa de instalação nem de build: é só subir a pasta inteira para a hospedagem.

## Antes de colocar no ar

Tudo isso fica em **um único arquivo: `assets/js/dados.js`**.

1. **WhatsApp:** preencha `contato.whatsapp` com DDI + DDD + número, só dígitos (ex.: `'5511987654321'`). Enquanto estiver vazio, o WhatsApp abre e a pessoa escolhe para quem mandar.
2. **Preços:** os preços atuais são **exemplos**. Troque pelos reais.
   - Telefone para ligação (se houver): `contato.telefone`.
3. **Contato e horário:** `whatsappExibicao`, `instagram`, `endereco`, `cidade`, `mapa` e `horarios`. O rodapé só mostra o que estiver preenchido.
4. **Entrega:** `loja.taxaEntrega` (número, ou `null` para "a combinar"), `loja.entrega`, `loja.retirada` e `loja.formasPagamento`.
5. Depois de tudo conferido, mude `loja.modoDemonstracao` para `false`. Isso remove o aviso de "preços de exemplo".
6. Site no ar pelo GitHub Pages: https://jdmarketing00.github.io/acai-batido-na-hora/ (se usar domínio próprio, troque og:url e og:image no `index.html`).

## Onde mexer no dia a dia (`assets/js/dados.js`)

| Quero... | Campo |
|---|---|
| Mudar um preço | `produtos[...].tamanhos[...].preco` ou `adicionais[...].preco` |
| Mostrar preço antigo riscado | `precoDe` no tamanho |
| Adicionar um produto | copie um bloco de `produtos` e troque `id`, `nome`, `categoria`, `imagem`... |
| Esconder um item sem apagar | `disponivel: false` |
| Mudar os 4 combos da seção "Nossos combos" | `combosEmDestaque` |
| Criar ou tirar uma promoção | `promocoes` (banner) + o produto com `categoria: 'promocoes'`; `ativa: false` tira do ar |
| Preço base do "Monte seu açaí" | `montador.tamanhos` |
| Nova fruta, complemento ou calda | `adicionais` com `grupo: 'frutas'`, `'complementos'` ou `'caldas'` |
| Promoção com adicionais no preço (ex.: "300 ml + 2 adicionais") | `adicionaisInclusos: 2` no tamanho; os 2 mais caros escolhidos saem sem custo e os demais são cobrados |
| Sabores do slider da primeira tela | `sabores.lista` (veja abaixo) |
| Ligar ou desligar a troca automática do slider | `sabores.autoplay` (`true`/`false`) e `sabores.intervalo` (milissegundos, hoje 4000) |

Cada produto tem: `id`, `nome`, `descricao`, `categoria`, `imagem`, `tamanhos`, `ingredientes`, `personalizavel` e `disponivel`. Essa estrutura já serve de base para um painel administrativo no futuro: basta o painel gerar este mesmo objeto.

## Slider de sabores (primeira tela)

A primeira tela é um slider com um copo por sabor, o nome do sabor em letras gigantes atrás dele e ingredientes flutuando em volta. Cada sabor fica em `dados.js`, em `sabores.lista`:

- `nome` (palavra gigante e navegação), `titulo` e `descricao` (texto ao lado do copo) e `tema` (cor de fundo: `'acai'`, `'morango'`, `'ninho'` ou `'chocolate'`).
- `produtoId` e `adicionais`: o botão **Quero este sabor** abre esse produto do cardápio com esses adicionais já marcados. O "a partir de" é calculado com os preços do próprio cardápio. Hoje: Tradicional abre o *Açaí tradicional* com banana e granola; Morango abre o *Açaí com morango*; Ninho abre o *Combo Ninho*; Nutella abre o *Açaí tradicional* com Nutella. É só trocar o `produtoId` para apontar para outro produto.
- `copo`: foto do copo **sem fundo** (WebP ou PNG), 720 × 1080 px, com o copo apoiado na base da imagem e centralizado.
- `ingredientes`: fotos recortadas, quadradas (300 × 300, fundo transparente), com posição (`x`, `y`), `tamanho`, `giro` e `prof` (profundidade: acima de 1 fica na frente do copo; abaixo de 1 fica atrás, desfocado).

Navegação: setas, pontos, nomes dos sabores, setas do teclado e deslizar o dedo. A troca automática para quando a pessoa usa qualquer controle, pausa com o mouse sobre o texto do sabor, com o slider fora da tela ou com a aba escondida, e não roda para quem pediu "reduzir movimento" no aparelho.

Os nomes, os pontos e os textos do primeiro carregamento também estão escritos no `index.html` para a tela não "pular" enquanto a página carrega. O script refaz tudo a partir de `dados.js` em seguida. Se mudar sabores, textos ou preços, o site mostra o que está em `dados.js`; atualizar o HTML é opcional e só evita uma troca rápida na abertura.

## Identidade visual

- **Cores** (todas no topo de `assets/css/styles.css`, em `:root`): roxo açaí (`--acai-900` a `--acai-50`), branco, creme (`--creme`), verde folha (`--folha`) para ingredientes e descontos, e mel (`--mel`) só para selos e destaques.
- **Logo:** `assets/img/logo.svg` (para fundo escuro) e `assets/img/logo-roxa.svg` (para fundo claro, impressos, Instagram). O ícone da aba é `assets/img/favicon.svg`. As letras já estão em contorno, então a logo aparece igual em qualquer lugar. Para regerar: `python3 ferramentas/gerar-logo.py`.
- **Fontes** (ficam no próprio site, em `assets/fonts/`, sem depender do Google): **Shrikhand** na logo e nos títulos grandes, **Caveat Brush** (letra de pincel) no slogan e nas chamadas pequenas, e **Figtree** nos textos, botões e preços.
- **Fotos:** só fotografias reais. Nenhum desenho, ícone de comida ou emoji no lugar de produto.
- **Rodapé:** mostra contato, telefone, endereço, horário, entrega e pagamento a partir de `dados.js`. Só aparece o que estiver preenchido. Em modo demonstração, um aviso discreto lista o que ainda falta configurar; com `modoDemonstracao: false` ele some.

## Fotos

As fotos estão em `assets/img/fotos/`, separadas em `produtos/`, `adicionais/`, `promocoes/`, `sabores/` (slider), `hero/` e `decor/`. **São fotos de banco de imagens gratuito (Pexels), usadas como provisórias.** Os copos do slider receberam um leve ajuste de cor e são copos de creme com frutas, não açaí da loja. O ideal é trocar tudo pelas fotos dos produtos da loja:

- Mantenha o mesmo nome de arquivo, ou mude o caminho em `dados.js`.
- Produtos: 800 × 600 px (4:3). Adicionais: quadradas, 420 × 420. Banners: 900 × 1100.
- Slider (`sabores/`): copos **sem fundo**, 720 × 1080 px, todos do mesmo modelo de copo e na mesma escala (a coleção fica uniforme). Fotografe os copos da loja de lado, em fundo liso, e recorte o fundo.
- Prefira WebP com qualidade perto de 80 para o site carregar rápido.
- **Depois de trocar fotos, rode `python3 ferramentas/gerar-versoes.py`.** Ele cria as versões leves que o celular usa (`-400`, `-160`, `-600` e `-480` dos copos do slider). Se esquecer, o site não quebra: usa a foto principal, só que mais pesada.
- A pasta `ferramentas/` não precisa ir para a hospedagem.

## Estrutura do código

```
index.html               estrutura da página
assets/css/styles.css    cores (no topo, em :root), layout e animações
assets/js/dados.js       TODOS os dados editáveis
assets/js/nucleo.js      funções comuns (preço, WhatsApp, janelas, avisos)
assets/js/carrinho.js    carrinho, dados do cliente e mensagem do WhatsApp
assets/js/cardapio.js    combos, abas do cardápio, promoções e personalização
assets/js/montador.js    "Monte seu açaí"
assets/js/sabores.js     slider de sabores da primeira tela
assets/js/animacoes.js   animações de rolagem, navbar e menu do celular
assets/js/app.js         liga tudo e monta o rodapé
assets/fonts/            fontes do site (Shrikhand, Caveat Brush, Figtree)
ferramentas/             gerar-versoes.py (versões leves das fotos) e gerar-logo.py (logo e ícone)
```

O carrinho fica salvo no navegador do cliente (localStorage). Ao recarregar a página, os itens continuam lá, já com os preços atuais de `dados.js`.

## Pedido pelo WhatsApp

A mensagem sai com número do pedido, data e hora, cada item com tamanho, ingredientes, ingredientes retirados, adicionais (inclusos ou cobrados), observação, quantidade e preço, subtotal, entrega, total, nome, endereço e forma de pagamento com troco. Os valores são calculados em centavos, sem erro de arredondamento.

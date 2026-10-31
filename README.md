# onevessel-ui

Identidade compartilhada dos apps OneVessel: **Materiais**, **Paradas** e **Bordo**, mais a plataforma.

Este repositório é a única fonte das cores, tipografia, espaçamentos, CSS de componentes, fontes, ícones de PWA e do logo dos relatórios. Os apps instalam por versão; nenhum app copia valores para dentro de si.

## O que tem aqui

| Pasta | O que é |
| --- | --- |
| `tokens/tokens.json` | Fonte de tudo: cores nos dois temas, tipografia, espaçamentos, raios, sombras, tamanhos e camadas |
| `css/tokens.css` | Gerado do arquivo acima. Variáveis CSS (`--ov-*`), tema escuro na raiz e claro em `[data-theme="claro"]` |
| `css/casca.css` | Só a estrutura das telas: barra lateral (240px; 56px recolhida abaixo de 1024px e, desde a v3.15.0, por escolha da pessoa, com o botão `.ov-lateral-alternar`), barra superior, cabeçalho e barra inferior do celular (abaixo de 768px), seletor de embarcação, conta, sincronização, menu (com o rótulo de grupo e o item da seção aberta), paleta (com a lista, o aviso e o anel do campo), folha móvel do "Mais" (com o topo, a lista e a conta, desde a v3.11.0), etiqueta, estado (`.ov-estado`), faixa e estados de tela. Importável sozinha: sem `body`, sem base de 14px, sem impressão |
| `css/janelas.css` | As camadas sobre a tela: Diálogo, Toast, Painel lateral, rodapé e alturas da folha móvel, e o `ov-btn-perigo`. Importável sozinho, como a casca (depende de `tokens.css` e `casca.css`; o `ov-btn-perigo`, da base do `controles.css`) |
| `css/telas.css` | O que vai dentro da tela (v3.7.0; o miolo do item do Precisa de você e o cartão que estica na grade desde a v3.8.0): tipografia, cartão e indicadores (grade 4/2/1), Precisa de você, visões e filtros, contador, progresso, segmentado, checkbox, tabela (lista de linhas abaixo de 768px), barra de ações em massa e esqueleto. Importável sozinho, como a casca (depende de `tokens.css` e, para o movimento reduzido, de `casca.css`) |
| `css/controles.css` | Botões e campo (v3.12.0; antes, só no `onevessel.css`): `.ov-btn` e as variantes, `.ov-campo-grupo`, `.ov-label`, `.ov-campo`, `.ov-ajuda` e `.ov-erro-campo`; desde a v3.13.0, o `textarea.ov-campo`, o campo de linha (`.ov-campo[data-densidade="linha"]`) e o ícone do erro. Importável sozinho, como a casca (depende só de `tokens.css`) |
| `css/onevessel.css` | A base de 14px, o ícone de app e a matriz de permissões. Começa importando `casca.css`, `janelas.css`, `telas.css`, `relatorio.css` e `controles.css` |
| `css/relatorio.css` | O papel dos relatórios internos (v3.10.0): folha, timbre, resumo, seções, tabela, coluna numérica e estado com símbolo. Só `.rel-*`; importável sozinho, como a casca (depende de `tokens.css` e `fontes.css`). Importa o `previa.css` |
| `css/previa.css` | A barra da Página de impressão e a área em volta da folha (v3.11.0): `.rel-barra`, `.rel-barra-titulo` e `.rel-area`, interface em `--ov-*`, sem a folha e sem `@page`; no papel, a barra some. Importável sozinho, também pela prévia de um formulário oficial |
| `css/impressao.css` | O `@page relatorio` e o `@page relatorio-paisagem` (com o rodapé nas caixas de margem) e o `@media print` das `.rel-*`. Sem seletor global (v3.10.0) |
| `css/fontes.css` | IBM Plex Sans e Mono servidas pelo próprio app, sem Google Fonts. Só para o que é impresso: a interface usa a fonte do sistema |
| `fonts/` | Os `.woff2` do subconjunto latino (400, 500, 600) |
| `tailwind/preset.js` | Preset do Tailwind 3 que aponta para as mesmas variáveis |
| `icons/` | `plataforma/`: os ícones do PWA da OneVessel (192, 512, maskable, apple-touch-icon e o SVG de origem); `bordo/`, `paradas/` e `materiais/`: só o `icone.svg` de cada módulo, que não é instalável (v3.14.0) |
| `marca/` | O logo horizontal da BRAM Offshore (`bram-offshore-horizontal.png`, 2425×1073, fundo transparente), para o timbre dos relatórios (v3.10.0) |
| `manifestos/` | O `plataforma.webmanifest`, modelo do manifesto do PWA da OneVessel, o único instalável (desde a v3.14.0; os dos módulos saíram) |
| `js/` | O comportamento que os apps repetiam linha a linha (D1): o núcleo da paleta de comandos, o foco preso dos diálogos e, desde a v3.6.0, o núcleo do Toast, o teclado do Painel lateral, a pilha de camadas modais e o registro de alterações, e, desde a v3.8.0, o teclado da linha da tabela; desde a v3.15.0, a lateral recolhida por escolha; desde a v3.20.0, o plural, as datas e os teclados das abas, da lista de cards, do menu e do "+ Filtro". ESM puro, sem dependência (nem de React), com `.d.ts` |
| `exemplo/` | Página de conferência com tudo aplicado nos dois temas, inclusive a casca |
| `scripts/conferir.mjs` | `npm run conferir`: confere a divisão entre `casca.css`, `janelas.css`, `telas.css`, `controles.css`, `relatorio.css`, `previa.css`, `onevessel.css` e `impressao.css` (o `relatorio.css` só com `.rel-*`, sem base e importando o `previa.css`; o `previa.css` só com a barra e a área, sem `@page` e, no papel, só escondendo; o `impressao.css` só com `.rel-*` e `@page` com nome, sem `visibility` nem `position: absolute`; e que todo CSS está em `exports`), que nenhum CSS tem `outline: none` (sem exceção desde a v3.12.0), que nenhum nome antigo de app sobrou e que `js/` só importa caminho relativo, tem um `.d.ts` por `.js` e está todo em `exports` |
| `test/` | `npm run testar`: os testes de `js/`, sem DOM, e os da divisão do CSS (`css.test.mjs`: o que saiu do `onevessel.css` na v3.5.0 mora no `janelas.css`, o `.ov-estado` da v3.6.0 no `casca.css` e as telas da v3.7.0 no `telas.css`, com os mesmos valores; na v3.8.0, toda regra do `telas.css` da v3.7.0 com os mesmos valores, mais o miolo do item e o cartão que estica; na v3.9.0, toda regra do `casca.css` e do `janelas.css` da v3.8.0 igual, fora a lista que ganhou o recuo lateral, e nela a fórmula da v3.8.0 com o recuo em 0; e o contraste dos estados novos nos dois temas, pelos tokens; e `relatorio.test.mjs`, da v3.10.0: o `onevessel.css` com o que importa igual ao da v3.9.0 fora as três regras alteradas pelo nome, o `relatorio.css` e o `impressao.css` sem seletor global, `th` com 8,5pt ou mais, as duas páginas com nome e o logo pelo sha256; `temas.test.mjs`, da v3.10.1: o `tokens.css` com `color-scheme: dark` na raiz e no escuro e `light` no claro; e `v3.11.0.test.mjs`: toda regra dos CSS da v3.10.1 igual, fora as alteradas pelo nome (a sombra do cartão no claro, a alça, o campo da paleta e o hover do primário), o que nasceu exatamente pela lista, os valores das classes novas, o `previa.css` e o contraste do hover do primário, do cartão aberto e da paleta; e `v3.12.0.test.mjs`: toda regra dos CSS da v3.11.0 igual, fora as alteradas pelo nome (o campo, o foco do campo, o botão no toque e o hover do indicador), o que nasceu exatamente pela lista, o `controles.css` importável sozinho e importado por último pelo `onevessel.css`, nenhum `outline: none`, o cartão clicável, os alvos de toque e o contraste do campo e do realce; e `v3.13.0.test.mjs`: toda regra dos CSS da v3.12.0 igual, sem alterada nenhuma, o que nasceu exatamente pela lista (com a barra de ações em massa no toque pelo nome), o campo de linha no computador e no toque, o `textarea`, o ícone do erro, o `controles.css` importável sozinho e o exemplo; e `v3.14.0.test.mjs`: `manifestos/` e `icons/` com exatamente os 9 arquivos que ficam, com o sha256 da v3.13.0, os módulos sem manifesto nem PNG, o `gerar-icones.mjs` com PNG só para a plataforma e o exemplo; e `v3.15.0.test.mjs`: toda regra do `casca.css` da v3.14.0 igual, o que nasceu exatamente pela lista, a lateral recolhida por escolha com as mesmas declarações da de abaixo de 1024px (sem a margem), nenhuma `transition`, o botão escondido abaixo de 1024px, o núcleo (ler, gravar, alternar, aplicar, armazenamento quebrado, evento de outra aba) e o exemplo; e `v3.15.1.test.mjs`: toda regra do `casca.css` da v3.15.0 igual, fora as alteradas pelo nome (o `data-fixo` e o botão), nenhuma nascida, os dois blocos de recolhido ainda iguais, o botão com texto, o rodapé na ordem e, com o Chromium do Playwright instalado, os centros dos ícones medidos no exemplo recolhido (iguais, com 1px de tolerância, a 1280px pelo atributo e a 900px pela largura). Desde a v3.11.0, os testes das versões anteriores comparam fixture com fixture). Roda `node --test "test/*.test.mjs"`, com o glob do próprio Node: no Node 24, `node --test test/` não abre pasta |

## Cor e tipografia, em uma linha

Duas identidades, e nunca se misturam:

- **Interface dos apps** — paleta petrol/ciano da Bram Power sobre o navy `#040a12`: `--ov-acao` é o petrol `#0e7490`, igual nos dois temas; `--ov-acao-hover` e `--ov-foco` são o ciano `#22d3ee` no escuro e o petrol escurecido `#0a5f77` no claro. Tipografia é a **fonte do sistema** (`--font-sans`): a bordo a conexão cai e o app tem que abrir sem esperar download nenhum.
- **Tudo que é impresso** — timbre da BRAM: `--rel-*` (marinho `#0d4b88` e laranja `#ec6a3b`) e **IBM Plex** (`--font-rel-sans`, `--font-rel-mono`), servida em woff2 pelo próprio app. É o que as classes `.rel-*` usam.

Fora disso ficam os **formulários oficiais** (NORMAM-08/DPC, ANVISA): reproduzem o anexo do órgão e não recebem nada daqui.

## Instalar num app

```bash
npm i "onevessel-ui@github:MilasKaab/onevessel-ui#v3.20.0"
```

Use sempre uma **tag de versão**. Quando a design system mudar, sai uma tag nova e cada app atualiza quando quiser — nunca no meio de outra entrega.

### Qual CSS importar

| Arquivo | Quem importa |
| --- | --- |
| `tokens.css` | Todo app, sempre primeiro |
| `casca.css` | App que mantém a própria base (Bordo, Paradas): só as classes de estrutura (e, desde a v3.6.0, o `.ov-estado`), sem mexer no `body` nem na impressão |
| `janelas.css` | App que mantém a própria base (Bordo, Paradas), depois de `casca.css`: Diálogo, Toast, Painel lateral e folha |
| `telas.css` | App que mantém a própria base (Bordo, Paradas), depois de `janelas.css`: indicadores, Precisa de você, visões, tabela, barra de massa, esqueleto |
| `controles.css` | App que mantém a própria base (Bordo, Paradas), depois de `telas.css`: botões e campo (v3.12.0). Quem importa `janelas.css` importa este também (o `ov-btn-perigo` é só a cor sobre o `ov-btn`) |
| `onevessel.css` | App que adota a base de 14px e todos os componentes (já traz `casca.css`, `janelas.css`, `telas.css`, `relatorio.css` e `controles.css`; não importe junto) |
| `relatorio.css` | Bordo e Paradas: **só nas rotas dos relatórios internos**, nunca no CSS global. No Materiais chega pelo `onevessel.css` (só `.rel-*`, nenhum `@page`: sem dano). Já traz o `previa.css` |
| `previa.css` | A prévia de um formulário oficial, que não pode receber o `relatorio.css`: só a barra e a área (v3.11.0). Nas rotas dos relatórios internos ele já vem pelo `relatorio.css` |
| `impressao.css` | Todo app: **só nas rotas dos relatórios internos**, depois do `relatorio.css` (ou do `onevessel.css`). Nunca no CSS global, nunca numa rota de formulário oficial |
| `fontes.css` | Quem imprime relatório (IBM Plex) |

### Casca

```html
<a class="ov-pular" href="#titulo-da-tela">Pular para o conteúdo</a>   <!-- primeiro elemento da página (v3.19.0) -->
<div class="ov-casca">
  <nav class="ov-lateral">
    <div class="ov-lateral-marca">
      <svg …glifo do app…/>
      <div class="ov-lateral-marca-texto">
        <span class="ov-lateral-marca-nome">Bordo</span>
        <span class="ov-lateral-marca-sub">Pessoas e acomodação</span>
      </div>
    </div>
    <button class="ov-seletor-embarcacao" aria-haspopup="menu" aria-expanded="false" title="Bram Power">
      <svg …anchor…/><span class="ov-lateral-texto">Bram Power</span>
    </button>
    <button class="ov-busca-gatilho" title="Buscar">
      <svg …search…/><span class="ov-lateral-texto">Buscar…</span><kbd class="ov-tecla">Ctrl K</kbd>
    </button>
    <a class="ov-nav" href="/bordo/" aria-current="page" title="Conveses">
      <svg …/><span class="ov-lateral-texto">Conveses</span>
    </a>
    <div class="ov-lateral-grupo">Outros apps</div>
    …
    <div class="ov-lateral-rodape">                     <!-- nesta ordem -->
      <div class="ov-lateral-grupo"></div>
      <button class="ov-lateral-alternar" type="button" aria-expanded="true" aria-label="Recolher barra lateral" title="Recolher barra lateral">
        <svg …panel-left-close…/><span class="ov-lateral-texto">Recolher barra lateral</span>
      </button>
      …linhas do app…                                  <!-- sem a conta desde a v3.19.0 (C26, L8) -->
    </div>
  </nav>
  <div class="ov-conteudo">
    <header class="ov-cabecalho-movel">…</header>        <!-- só abaixo de 768px -->
    <header class="ov-superior">
      <div class="ov-trilha">Bordo / <b>Conveses</b></div>
      <div class="ov-superior-direita">                  <!-- nesta ordem -->
        <button class="ov-conta">Ana Souza</button>
        <span class="ov-sincronizacao" data-tom="atencao">Sem conexão<span class="ov-sincronizacao-fila"> · 3 na fila</span></span>
        …até 2 ações (um Menu ⋮ conta como uma)…
      </div>
    </header>
    <main class="ov-tela" data-largura="larga">…</main>   <!-- lista ou grade; sem o atributo, 1280px -->
    <nav class="ov-barra-inferior">                      <!-- só abaixo de 768px -->
      <a class="ov-barra-inferior-item" aria-current="page">…</a>   <!-- até 4 destinos -->
      <button class="ov-barra-inferior-item" aria-expanded="false">…Mais</button>
    </nav>
  </div>
</div>
```

- Tudo que é texto na lateral vai em `.ov-lateral-texto` (ou `.ov-lateral-marca-texto`): abaixo de 1024px a lateral recolhe para 56px, esse texto sai da tela (continua para o leitor de tela) e o `title` de cada item fica.
- **Lateral recolhida por escolha** (v3.15.0): abaixo de 1024px a lateral recolhe sozinha; a partir de 1024px, recolhe por escolha da pessoa, com `data-lateral="recolhida"` na `.ov-casca` — o mesmo estado de 56px de abaixo de 1024px, **só a lateral**: a margem da tela continua 32px. Com o atributo ausente ou `"aberta"`, 240px como sempre; abaixo de 1024px o atributo não muda nada. Sem atalho de teclado, sem expandir ao passar o mouse, sem animação (troca seca).
- **O botão** `.ov-lateral-alternar` vai no `.ov-lateral-rodape` e só aparece a partir de 1024px. Segue a régua da lateral (100% de largura, 32px, 48 no toque; o ícone centrado na recolhida) e tem o anel único do livro. Desde a v3.15.1 é ícone + `<span class="ov-lateral-texto">`, como os outros itens: aberta mostra o texto, recolhida só o ícone, com o `title`; o `aria-label` continua. O pacote não traz ícone: o app põe o SVG do Lucide e troca texto e atributos pelo estado (`botaoDaLateral` do núcleo dá `icone`, `texto`, `rotulo` e `expandido`):

  | Estado | Ícone | Texto, `aria-label` e `title` | `aria-expanded` |
  | --- | --- | --- | --- |
  | aberta | `panel-left-close` | Recolher barra lateral | `true` |
  | recolhida | `panel-left-open` | Expandir barra lateral | `false` |

- **O rodapé, nesta ordem** (v3.15.1): um `.ov-lateral-grupo` vazio, que separa o rodapé das seções (na recolhida é o filete que já divide "Outros apps"; aberta, só o espaço), o botão como primeiro item, as linhas que o app puser ali e a conta por último.

- A escolha mora no aparelho, em `localStorage` na chave `ov-lateral` (`js/lateral-nucleo.js`), e vale para todos os módulos na mesma origem; é **por aparelho** (estação compartilhada), não por pessoa. Com o armazenamento bloqueado, vale só na página, como o `ov-tema`. Aplique o `data-lateral` antes da primeira pintura, como o tema, e ouça outra aba com `ouvirLateral`:

```js
import { lerLateral, alternarLateral, aplicarLateral, botaoDaLateral, ouvirLateral } from 'onevessel-ui/js/lateral-nucleo.js'

const casca = document.querySelector('.ov-casca')
aplicarLateral(casca, lerLateral(localStorage))
// No clique do botão: o estado da página vence o guardado (armazenamento bloqueado).
const novo = alternarLateral(localStorage, casca.dataset.lateral)
aplicarLateral(casca, novo)
const { icone, texto, rotulo, expandido } = botaoDaLateral(novo)
const parar = ouvirLateral(window, (estado) => aplicarLateral(casca, estado))
```

  O `localStorage` pode lançar só de ser lido (aba anônima, política): pegue-o num `try/catch` e passe `null` se lançar; o núcleo aceita `null`.
- **Por que a v3.15.0 é minor:** nada muda para quem não põe o atributo nem o botão. As regras de antes ficam iguais; o botão entra como seletor novo nas listas do toque e do centrado, e o recolhido por escolha é um bloco novo, `@media (min-width: 1024px)`, com as mesmas declarações da lateral de abaixo de 1024px sob `:where(.ov-casca[data-lateral="recolhida"])` (o `:where()` não soma força: a conta da barra superior fica como a 900px). CSS não junta `@media` e atributo numa regra só; o teste da v3.15.0 cobra que os dois blocos são iguais.
- **Por que a v3.15.1 é patch:** três correções sem classe nova. (1) Na recolhida, a âncora do seletor com `data-fixo` ficava 5px fora do eixo dos outros ícones (centro a 22,5px, os outros a 27,5px, na `@media` e no atributo): o `padding-right: 10px` do `[data-fixo]` (0,2,0) vencia o `padding: 0` do recolhido (0,1,0). O seletor passa a `.ov-seletor-embarcacao:where([data-fixo])`, com a força do seletor sozinho: pega os mesmos elementos, aberto fica igual, e os dois blocos de recolhido (iguais, como na v3.15.0) vencem. (2) O botão ganha o texto, e a regra dele, as declarações para mostrá-lo (`gap: 10px`, `min-width: 0`, `text-align: left`, `white-space: nowrap`). (3) O filete acima do botão é markup, com a classe que já existe. Na adoção, o app põe o `<span>` do texto e o `.ov-lateral-grupo` no rodapé; quem não puser fica como na v3.15.0, com a âncora já no eixo.
- O topo da lateral num app é o glifo solto de 20px em `currentColor`; `.ov-monograma` é só da plataforma.
- `.ov-seletor-embarcacao` desenha a própria seta. Com um navio só, use `data-fixo` num elemento que não é botão: sem seta, sem cursor.
- Em tela de toque (`pointer: coarse`), os itens da lateral passam a 48px.
- Margem da tela: 32px no computador, 24px de 768 a 1023px, 16px abaixo de 768px.
- **Largura da tela** (v3.16.0). Cada tela declara a largura: `data-largura="larga"` nas telas de lista ou grade (tabelas, conveses, históricos); sem o atributo, o teto de leitura de 1280px (formulários, painéis, texto, cartões de resumo). Recolher a lateral dá à tela larga o espaço da lateral; a de 1280 só cresce se a janela for estreita. A larga vai até `--ov-conteudo-largo` (1864px = 1920 − 56, com a margem de 32 de cada lado dentro): num 1920 a tela tem 1680 com a lateral aberta e 1864 recolhida, e o teto só age acima de 1920. Abaixo de 1024px o atributo não muda nada (a tela já cabe na janela).
- **Por que a v3.16.0 é minor:** um token novo (`--ov-conteudo-largo`) e duas regras novas, `.ov-tela[data-largura="larga"]` na casca e, num bloco `@media (min-width: 1024px)` novo, `.ov-tela[data-largura="larga"] .ov-tabela .nome` nas telas. Nada muda para a tela sem o atributo; `--ov-conteudo-max` continua 1280px. Na adoção, o app põe o atributo nas telas de lista ou grade.
- Abaixo de 768px, `.ov-paleta` vira a tela "Buscar", inteira.
- **Miolo da paleta** (v3.11.0): `.ov-paleta-lista` rola por dentro até `min(60vh, 480px)` (4px em cima; no celular, sem limite e com a área segura de baixo), os `.ov-paleta-item` dela com cursor de mão, `a.ov-paleta-item` sem cor de link (Ctrl/Cmd-clique abre outra aba) e `.ov-paleta-aviso` para o aviso de um grupo ou o vazio, em 13px e `ov-texto-terciario`. O campo da `.ov-paleta-busca` tem o anel único do livro no próprio campo (o `outline: none` saiu).
- **Folha do "Mais"** (v3.11.0): dentro da `.ov-folha`, depois da `.ov-folha-alca`, o `.ov-folha-topo` (com o `h2.ov-folha-titulo` e o Fechar do app) e a `.ov-folha-menu`, que rola por dentro com a área segura de baixo e dá 48px aos `.ov-menu-item`. A alça e o topo são puxador (`touch-action: none`). A conta vai em `p.ov-folha-conta`. Os grupos ("Outros apps", "Conta") em `.ov-menu-grupo`, que serve também ao `.ov-menu` (lá com `aria-hidden`). O item da seção aberta leva `aria-current="page"` e ganha o desenho do `.ov-nav` ativo, no menu e na folha.

```html
<div class="ov-folha" role="dialog" aria-modal="true" aria-labelledby="mais">
  <div class="ov-folha-alca"></div>
  <div class="ov-folha-topo"><h2 class="ov-folha-titulo" id="mais">Mais</h2>…Fechar…</div>
  <div class="ov-folha-menu">
    <a class="ov-menu-item" href="…" aria-current="page">…</a>
    <h3 class="ov-menu-grupo">Conta</h3>
    <p class="ov-folha-conta"><svg …circle-user…/>Ana Souza</p>
  </div>
</div>
```
- Recuos laterais da área segura (desde a v3.9.0, para o iPhone deitado; precisam de `viewport-fit=cover`): a lateral cresce por dentro o recuo da esquerda, e o de baixo no rodapé, sem encolher o alvo; `.ov-superior`, `.ov-tela` e `.ov-faixa` recebem o da direita; abaixo de 768px, `.ov-cabecalho-movel`, `.ov-barra-inferior` e `.ov-tela` recebem os dois; a `.ov-folha` e o Painel lateral em folha (abaixo de 1024px), na própria caixa. Sem recorte, todo recuo vale 0 e nada muda.

### Janelas

Desde a v3.5.0 (D3 da F4). A Bordo e o Paradas importam `tokens.css`, `casca.css` e `janelas.css`; quem usa o `onevessel.css` já recebe tudo. As regras de uso (quando é Diálogo, quando é Toast, Desfazer) estão em `janelas-e-avisos.md`, no `onevessel-docs`.

```html
<!-- Diálogo: div do app, véu e foco preso (focoQueGira), não <dialog> -->
<div class="ov-veu"></div>
<div class="ov-dialogo" data-tamanho="confirmacao" role="alertdialog" aria-labelledby="t" aria-describedby="f">
  <h2 class="ov-dialogo-titulo" id="t">Remover o dia 14/10?</h2>
  <p class="ov-dialogo-frase" id="f">As atividades do dia somem para todas as estações.</p>
  <div class="ov-dialogo-acoes">                      <!-- Cancelar antes da ação -->
    <button class="… Cancelar">Cancelar</button>
    <button class="ov-btn-perigo …">Remover dia</button>
  </div>
</div>

<div class="ov-dialogo" data-tamanho="formulario" role="dialog" aria-labelledby="t2">
  <h2 class="ov-dialogo-titulo" id="t2">Encerrar TT</h2>
  <div class="ov-dialogo-corpo">…campos…</div>      <!-- rola por dentro -->
  <div class="ov-dialogo-acoes">…</div>
</div>

<!-- Toasts: no layout, sobrevivem à troca de tela -->
<div class="ov-toasts">                               <!-- data-com-barra com a .ov-acoes-massa na tela -->
  <div class="ov-toast" role="status">
    <div class="ov-toast-linha"><svg …/>3 contagens aprovadas<button class="ov-toast-acao">Desfazer</button></div>
    <div class="ov-toast-tempo"><span></span></div>
  </div>
  <div class="ov-toast" data-tipo="erro" role="alert">
    <div class="ov-toast-linha"><svg …/>Não consegui encerrar a TT.<button class="ov-toast-acao">Tentar de novo</button></div>
  </div>
</div>

<!-- Painel lateral: data-abas dá 480px -->
<aside class="ov-painel" data-abas role="complementary">
  <div class="ov-painel-cab">…</div>
  <div class="ov-painel-corpo">…<div class="ov-abas-internas">…</div><dl class="ov-dados">…</dl></div>
</aside>

<!-- Folha móvel: data-altura="rapida" (40%), "detalhe" (90%) ou "cheia" (100%) -->
<div class="ov-folha" data-altura="detalhe">
  <div class="ov-folha-alca"></div>
  <div class="ov-folha-corpo">…</div>
  <div class="ov-folha-rodape">…até 2 botões…</div>
</div>
```

- **Diálogo**: `data-tamanho="confirmacao"` (ou sem atributo) tem 440px (`--ov-dialogo`); `"formulario"` tem 640px (`--ov-dialogo-formulario`), com o `.ov-dialogo-corpo` rolando. Abaixo de 768px a confirmação continua centrada, com 16px de margem, e **o formulário vira folha em tela cheia pelo próprio CSS** (`@media` sobre `data-tamanho="formulario"`): o app não troca classe nem precisa saber a largura. Nesse caso as ações ganham a geometria do `.ov-folha-rodape`.
- **`ov-btn-perigo`** só existe dentro do Diálogo e traz **só as cores** (`--ov-erro` e `--ov-sobre-erro`). A base do botão (altura, padding, fonte) é o `ov-btn` do `controles.css` (v3.12.0): o `janelas.css` não o importa, como não importa a casca (a soma do `onevessel.css` repetiria as regras); o app importa os dois.
- **Toast**: centro inferior no computador; com a barra de ações em massa na tela, o app põe `data-com-barra` na `.ov-toasts` e a pilha sobe para 96px. Abaixo de 768px, logo abaixo da barra superior (`--ov-barra-superior` + área segura + 12px), entrando de cima. Sem `data-tipo` (ou `"sucesso"`) o ícone vai em `--ov-toast-sucesso`; `data-tipo="erro"` usa `--ov-toast-erro` e o CSS esconde a barra de tempo. O máximo de 3 é do app.
- **Barra de tempo**: anda de 100% a 0 em `--ov-toast-duracao` (8s, em `tokens.css`; o app pode trocar a variável) e **pausa com `:hover` e `:focus-within`** no toast. O temporizador do núcleo do toast (`js/toast-nucleo.js` desde a v3.6.0) pausa e retoma **nos mesmos eventos** (`mouseenter`/`mouseleave`, `focusin`/`focusout` do toast), senão a barra e o fechamento se desencontram.
- **Painel lateral**: não é modal no computador. **Abaixo de 1024px vira Folha móvel de 90%** (`data-altura="cheia"` no painel dá a tela inteira) e passa a ser modal: **o app põe o `.ov-veu` antes dele e prende o foco** enquanto a folha estiver aberta.
- **Modo foco** (v3.17.0), para a tela em que a lista ao lado polui a leitura (em teste em Pessoas da Bordo). A tela põe `data-painel="foco"` no contêiner que tem, **como filhos**, a coluna da lista (o elemento que contém a `.ov-tabela`) e o `.ov-painel`; o modo age só a partir de 1024px e só enquanto o painel é filho dele (`:has`), então o atributo pode ficar fixo na tela. Cabeçalho e célula das colunas principais levam `data-principal` (`<th data-principal>`, `<td class="nome" data-principal>`); as outras somem e voltam ao fechar o painel. A lista fica numa coluna de 360px (se não sobram 520px para o painel, ela cede), com o nome em reticências; o texto das linhas que não estão abertas passa a `--ov-texto-secundario` (cor, nunca `opacity`) e volta com `:hover` e `:focus-visible`; a linha aberta mantém o destaque de seleção; `.meta` e `.ov-estado` guardam a cor própria. O painel ganha `--ov-superficie-elevada`, borda esquerda `--ov-borda-forte`, `--ov-sombra-2`, o resto da largura (mínimo 520px) e a altura toda abaixo da barra superior (`sticky`), com o corpo rolando por dentro. Os Detalhes vão para colunas de no mínimo 280px: na `.ov-dados`, cada par `dt`/`dd` embrulhado num `div` (fora do modo o `div` some, com `display: contents`, e a lista fica como a de pares soltos); no formulário, o elemento cujos filhos são `.ov-campo-grupo`, e o resto dele (botões, avisos) ocupa a linha toda. Sem véu: a lista continua clicável e rolável. Abaixo de 1024px nada muda (Folha móvel).
- **Por que a v3.17.0 é minor:** só regras novas no `janelas.css`: `.ov-dados > div` e um bloco `@media (min-width: 1024px)` com o modo foco, todo preso a `[data-painel="foco"]:has(> .ov-painel)`. Nenhuma regra de antes muda; tela sem o atributo e `.ov-dados` de pares soltos ficam iguais.
- **Modo foco, segundo plano revisto** (v3.18.1): as linhas que não estão abertas passam de `--ov-texto-secundario` a `--ov-texto-terciario` **e peso 400**, também no `.nome` (que tem 500): com o secundário (7,3:1 no claro, contra 16,7:1 do texto) o esmaecimento quase não se via. O terciário fica em 5,9:1 sobre `--ov-superficie` no claro e 5,8:1 no escuro (5,3 e 6,5 sobre `--ov-fundo`), ainda AA, porque as linhas continuam clicáveis. `:hover` e `:focus-visible` devolvem cor e peso; a linha aberta fica como estava.
- **Folha**: sem `data-altura`, a altura do conteúdo (o "Mais"). Na `"cheia"` some o raio e a alça, e entra a área segura de cima. Os botões do `.ov-folha-rodape` têm 48px e a mesma largura.
- **Movimento reduzido** (`janelas.css` e `casca.css`): as entradas não sobem nem escalam, só aparecem; a barra de tempo continua, porque diz quanto falta.

### Controles

Desde a v3.12.0 (V17: PV-2, PV-3, BV-4, BV-9, BV-10). Botões e campo saíram do `onevessel.css` para o `controles.css`, importável sozinho, com a régua do livro para a suíte inteira. As regras de uso estão em `componentes.md` (Botão, Campo), no `onevessel-docs`.

```html
<button class="ov-btn ov-btn-primario" type="button">Salvar</button>
<button class="ov-btn ov-btn-secundario" type="button">Cancelar</button>
<button class="ov-btn ov-btn-fantasma ov-btn-icone" type="button" aria-label="Imprimir" title="Imprimir"><svg …printer…/></button>  <!-- ícone de 18px pelo pacote (v3.19.0) -->

<!-- Desabilitado com o motivo (v3.19.0): no title e, no toque, escrito abaixo -->
<button class="ov-btn ov-btn-primario" type="button" disabled title="Preencha a embarcação" aria-describedby="motivo-aprovar">Aprovar</button>
<span class="ov-motivo" id="motivo-aprovar">Preencha a embarcação</span>

<!-- Salvando (v3.19.0): não fica desabilitado; rótulo e reticências num span só -->
<button class="ov-btn ov-btn-primario" type="button" aria-busy="true"><span>Salvando<span class="ov-reticencias" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></span></button>

<div class="ov-campo-grupo">
  <label class="ov-label" for="imo">IMO</label>
  <input class="ov-campo" id="imo" aria-invalid="true" aria-describedby="imo-erro">
  <span class="ov-erro-campo" id="imo-erro"><svg aria-hidden="true">…CircleAlert…</svg>O IMO tem 7 dígitos.</span>
</div>

<textarea class="ov-campo" id="motivo" rows="3"></textarea>

<!-- Campo de linha: a célula editada dentro da linha da tabela -->
<td><input class="ov-campo" data-densidade="linha" aria-label="Camarote de João Pereira"></td>
```

- **Botão**: 36px no computador e **48px no toque** (`pointer: coarse`; até a v3.11.0, 44), peso 500, raio `ov-raio-md`. O `.ov-btn-sm` (28px) é só do computador: no toque vai a 48 como os outros. O `.ov-btn-icone` fica quadrado (36 ou 48). O `.ov-btn-primario` sob o mouse tem o texto em `ov-fundo` (desde a v3.11.0: 10,99:1 no escuro e 6,40:1 no claro, em vez de 1,72:1).
- **Campo**: 44px no computador e **48px no toque** (v3.19.0, C30; até a v3.18.2, 44 em qualquer tela), texto de 16px, borda `ov-borda-controle`, fundo `ov-superficie-recuada` (o do livro para o campo dentro de cartão, e o mesmo fora dele: no cartão fica recuado, na página um tom acima). **Foco: o anel único do livro** (`outline: 2px solid var(--ov-foco)`, recuo 2px), sem halo e sem trocar a borda; o `outline: none` saiu. Erro: `aria-invalid="true"` põe a borda em `ov-erro`.
- **Rótulo** (`.ov-label`): 14px/500 em `ov-texto`; `small` dentro dele para "(opcional)". Ajuda em `.ov-ajuda` e erro em `.ov-erro-campo`, os dois em 13px.
- **Ícone do erro** (v3.13.0): o `CircleAlert` do Lucide, 16px, `aria-hidden`, como primeiro filho do `.ov-erro-campo`; o `svg` filho direto não encolhe quando o texto quebra e fica centrado na primeira linha de 18px.
- **`textarea.ov-campo`** (v3.13.0): a altura vem do `rows` do app (`height: auto`), com o mínimo de 44px; padding de 9px em cima e embaixo, que põe a primeira linha de 16/24 na mesma altura do texto do input; `resize: vertical`.
- **Campo de linha** (v3.13.0, a exceção do livro): `data-densidade="linha"` no `.ov-campo` (`input`, `select` ou `textarea`) para o campo que edita uma célula dentro da linha da tabela (ou da lista densa): **36px e texto de 14/20 no computador**, com o fundo, a borda, o raio e o anel do `.ov-campo`; no `textarea`, mínimo de 36 e padding de 7px. **No toque, é o `.ov-campo` de 48 e 16px** (v3.19.0, C30: no toque, todo controle tem 48; até a v3.18.2 ficava em 44), e texto abaixo de 16px faz o Safari do iPhone dar zoom no foco; a linha da tabela cresce com ele no toque. Fica no meio da célula (`vertical-align: middle`): na linha de base, o espaço do descendente fazia a linha crescer (50 no toque). Formulário é sempre o `.ov-campo` sem o atributo.
- **O que muda na tela de quem recebe o `onevessel.css` (a plataforma):** o botão no toque sobe de 44 para 48px; o campo perde o halo e a borda `ov-acao` do foco e ganha o anel; o fundo do campo passa de `ov-fundo` a `ov-superficie-recuada`. No computador com mouse, o botão continua com 36. Das telas, sob o mouse o indicador que é link troca a borda forte pelo realce, e a `.ov-visao` e o segmentado sobem a 48 no toque. A plataforma muda ao adotar a tag, num PR dela.
- **O que muda na tela na v3.13.0:** só a barra de ações em massa, no toque, de 48 para 50px. O resto é classe nova: o `textarea.ov-campo` sem o atributo deixa de ter 44px fixos (vale o `rows`), e o campo de linha só aparece onde o app puser `data-densidade="linha"`.

### Telas

Desde a v3.7.0 (D1 da F5). O CSS que ficava só no `onevessel.css` (e que a Bordo e o Paradas não importam por causa da base) mora no `telas.css`, com os mesmos valores, e o que faltava nasceu lá. As regras de uso estão em `componentes.md`, no `onevessel-docs`.

```html
<!-- Precisa de você: até 5 itens (regra do app); sem item, o vazio -->
<section class="ov-cartao ov-pendencias" aria-labelledby="pv">
  <div class="ov-pendencias-cab">
    <h2 class="ov-titulo-3" id="pv">Precisa de você</h2>
    <span class="ov-tag" data-tom="erro"><span class="ov-tag-ponto"></span>Urgente <span class="ov-tnum">1</span></span>
    <span class="ov-tag" data-tom="atencao"><span class="ov-tag-ponto"></span>Atenção <span class="ov-tnum">2</span></span>
    <a class="ov-pendencias-ver-tudo" href="…">Ver tudo</a>
  </div>
  <ul class="ov-pendencias-lista">
    <li>
      <a class="ov-pendencia" href="…" data-tom="atencao">   <!-- filete reto de 2px na cor da tag (v3.19.0) -->
        <span class="ov-estado ov-pendencia-estado" data-tom="atencao">Atenção</span>
        <span class="ov-pendencia-texto">
          <span class="ov-pendencia-titulo"><span class="ov-pendencia-id">1234</span>Título</span>
          <span class="ov-pendencia-contexto">Contexto</span>
        </span>
        <svg class="ov-pendencia-seta" aria-hidden="true">…</svg>
      </a>
    </li>
    <!-- item sem link: <div class="ov-pendencia">…</div>, o mesmo miolo, sem a seta -->
  </ul>
  <!-- ou: <p class="ov-pendencias-vazio">Nada pendente com você.</p> -->
</section>

<!-- Aba de rota (v3.11.0): link com aria-current, no desenho da visão selecionada -->
<nav class="ov-visoes" aria-label="Conveses">
  <a class="ov-visao" href="…" aria-current="page">Principal</a>
  <a class="ov-visao" href="…">Superior</a>
</nav>

<!-- Visões grandes (v3.18.0): a divisão principal da tela, presa sob a barra superior -->
<div class="ov-visoes" data-tamanho="grande" role="tablist" aria-label="…">
  <button class="ov-visao" type="button" role="tab" aria-selected="true" aria-controls="…" tabindex="0">
    <svg aria-hidden="true">…</svg>Atividades planejadas
    <span class="ov-rotulo">30 atividades aguardando</span><span class="ov-tnum">30</span>
  </button>
  <button class="ov-visao" type="button" role="tab" aria-selected="false" aria-controls="…" tabindex="-1">…</button>
</div>

<!-- Cartão aberto (v3.11.0): o registro do painel -->
<button class="ov-cartao" aria-current="true">…</button>

<!-- Indicadores: 4 colunas, 2 de 768 a 1023px, 1 no celular -->
<div class="ov-indicadores">
  <a class="ov-cartao ov-indicador" href="…" data-filete="andamento">…</a>   <!-- filete de status (v3.19.0) -->
</div>

<!-- Tabela: a célula do nome leva .nome; abaixo de 768px vira lista de linhas -->
<table class="ov-tabela">
  <thead><tr><th></th><th>Nome</th><th>Função</th><th>Estado</th></tr></thead>
  <tbody><tr><td><input class="ov-check" type="checkbox" aria-label="…"></td><td class="nome">João Pereira</td><td>Mecânico</td><td><span class="ov-estado" data-tom="sucesso">A bordo</span></td>
    <td class="num">14<span class="ov-so-no-celular"> dias a bordo</span></td><td class="ov-fora-do-celular">…Excluir…</td></tr></tbody>
</table>

<!-- Tabela larga (v3.19.0): a coluna que sai no tablet e a rolagem com sombra -->
<div class="ov-cartao ov-rolagem">
  <table class="ov-tabela">
    <thead><tr><th>Nome</th>…<th data-some-no-tablet>Encerrada em</th><th data-some-no-tablet>Encerrada por</th></tr></thead>
    <tbody><tr><td class="nome">…</td>…<td data-some-no-tablet>…</td><td data-some-no-tablet>…</td></tr></tbody>
  </table>
</div>

<!-- Barra de ações em massa: data-flutuante dá a posição e a entrada -->
<div class="ov-acoes-massa" data-flutuante role="toolbar" aria-label="3 selecionadas">…</div>

<!-- Esqueleto: no formato da tela, sem spinner -->
<div aria-busy="true"><div aria-hidden="true">
  <div class="ov-esqueleto-linha"><span class="ov-esqueleto-texto"></span><span class="ov-esqueleto-texto"></span></div>
  <span class="ov-esqueleto" style="height: 120px"></span>
</div></div>
```

- **Tabela numa tela larga** (v3.16.0): dentro da `.ov-tela[data-largura="larga"]`, a partir de 1024px, o `.nome` perde o teto de 320px e as colunas de texto ficam com o espaço; números e datas continuam no tamanho natural (`nowrap`). Abaixo de 1024px o atributo não muda nada (no tablet o nome segue com o teto). Sem `table-layout: fixed`. O pacote não põe rolagem lateral na `.ov-tabela`: tabela mais larga que a tela continua como antes, e a rolagem, quando houver, é de um contêiner do app.
- **Lista do celular**: abaixo de 768px, **a `.ov-tabela` que tem uma `td.nome`** vira lista de linhas de 64px ou mais, com o nome em cima em 16px e as outras células numa linha de `legenda`, separadas por "·", e divisor `ov-borda`. O cabeçalho sai da tela e continua para o leitor de tela; a célula com `.ov-check` fica à esquerda. O app não troca de classe. Tabela sem `td.nome` (as da plataforma até a v3.6) continua como estava, rolando de lado, e navegador sem `:has()` também.
- **Só na lista, fora da lista** (v3.11.0): dentro da `.ov-tabela`, o `.ov-so-no-celular` (um rótulo, `inline`) só aparece na lista do celular, onde o cabeçalho sai ("12 atividades"); o `.ov-fora-do-celular` (uma célula, ou o `th` dela) some na lista e fica de 768px para cima, no tablet também.
- **Cartão** (v3.11.0): sem sombra em nenhum tema (o livro: cartão em repouso se separa por borda). **Cartão aberto**: `aria-current="true"` no `.ov-cartao` dá borda `ov-acao` e `ov-acao-suave` sobre a superfície, como a linha selecionada da tabela. A regra é fraca (`:where`): a borda de alerta que o app põe numa classe dele, depois do pacote, continua vencendo.
- **Aba de rota** (v3.11.0): a `.ov-visao` também é link de navegação, com `aria-current="page"` na rota aberta, no desenho da selecionada e sem sublinhado. O `tablist` (`aria-selected`) fica para a visão que filtra a mesma tela.
- **Visões grandes** (v3.18.0): `data-tamanho="grande"` no `.ov-visoes`, para a divisão principal de uma tela, que a pessoa troca o tempo todo (o filtro abaixo dela fica nas visões normais). As visões dividem a largura em partes iguais, num controle com cara de cartão: fundo opaco `--ov-superficie`, contorno de 1px `--ov-borda`, raio `--ov-raio-md` nos quatro cantos e divisória de 1px entre as visões; 64px no computador e 56 abaixo de 768px. No botão, ícone e rótulo centrados numa linha; a partir de 768px, o `.ov-rotulo` (a contagem por extenso) centrado numa linha própria abaixo, em `--ov-texto-secundario`; abaixo de 768px ele some e aparece o `.ov-tnum` (o número), na linha do rótulo; o app põe os dois no mesmo botão e o CSS troca. A selecionada (`aria-selected="true"`, ou `aria-current="page"` na aba de rota): fundo `--ov-acao-suave`, filete inferior de 2px `--ov-acao` por sombra interna, rótulo em `--ov-texto` e ícone em `--ov-acao-texto` (o rótulo em `--ov-acao-texto` dava 4,07:1 no tema claro); as outras com o rótulo em `--ov-texto-secundario`. O anel de foco vai para dentro (o cartão corta o que passa da borda). Fica presa sob a barra superior ao rolar (`sticky`, `top: var(--ov-barra-superior)`; abaixo de 768px somando `env(safe-area-inset-top)`, a altura do `.ov-cabecalho-movel`), em `--ov-z-flutuante`, abaixo da barra e dos menus. O teclado é o das visões, no app (setas, Home, End, só a selecionada no Tab); nenhum JS novo.
- **Por que a v3.18.0 é minor:** só regras novas no `telas.css`, todas presas a `.ov-visoes[data-tamanho="grande"]`. Nenhuma regra de antes muda; o `.ov-visoes` sem o atributo fica igual.
- **Visões grandes pela largura do controle** (v3.18.1): a troca do `.ov-rotulo` pelo `.ov-tnum`, e a altura 64/56, olham a largura do próprio controle (`@container`), não a da janela: numa coluna estreita no computador (o Paradas a 1024 com o painel aberto, ~115px por visão) o subtítulo não cabia nos 64px e era cortado. O limite é **400px de controle** (duas visões de 200: o subtítulo pede ~155px de texto e 24 de padding; a consulta mede sem o contorno, 398). O `.ov-visoes[data-tamanho="grande"]` passa a ser contêiner (`container-type: inline-size`, `container-name: ov-visoes`), e a altura vai para as visões (62px, ou 54 no estreito; mais o contorno, 64 e 56), porque um contêiner não se consulta a si mesmo. O `top` com a área segura continua abaixo de 768px de janela (é a barra do celular). O `sticky` e o `z-index` ficam iguais (medidos). **Na adoção:** o controle precisa de largura dada pelo pai (bloco, ou item esticado de flex/grid): com `container-type: inline-size` a largura não vem mais do conteúdo, e num pai `flex` com `align-items: flex-start` (em coluna) ou como item que encolhe ao conteúdo, ele iria a zero. E o rótulo é do app: a 115px por visão nem "Atividades planejadas" cabe; o "Planejadas" com o número cabe (sobra 1px de transbordo a 115).
- **Por que a v3.18.1 é patch:** nenhuma classe nova; as duas correções mexem só nas regras que já existiam, com as alteradas pelo nome no teste da versão. No `janelas.css`, a regra do segundo plano muda a cor e ganha o peso, e um seletor dela com ` .nome` leva o peso ao nome. No `telas.css`, `.ov-visoes[data-tamanho="grande"]` perde o `height` e vira contêiner, a visão troca `height: auto` por `62px`, e as três regras do número saem do `@media (max-width: 767px)` para o `@container ov-visoes (width < 398px)` (a visão também com a altura de 54px); no `@media` fica só o `top`. O `scripts/css-regras.mjs` passa a entrar em `@container`.
- **Ação da linha sem sublinhado** (v3.18.2): `data-abre-linha` marca o botão ou link da célula que faz o mesmo que clicar na linha (abrir o painel ou ir ao registro); dentro da `.ov-tabela` ele não sublinha, nem no hover (`.ov-tabela td [data-abre-linha] { text-decoration: none }`). Um link de célula que leva a outro lugar não leva o atributo e continua sublinhando. O `td` no seletor é de propósito: dá 0,2,1, que vence o `hover:underline` (0,2,0) de um Tailwind 3, fora de camada e depois do pacote (o Paradas); sem ele, a utilidade venceria pela ordem. No Tailwind 4 (a Bordo) a utilidade está em `@layer utilities` e perde para o pacote, que entra fora de camada. Sem `!important`: um `!underline` do app continua vencendo. Mesmo assim, na adoção, o app tira o `hover:underline` da ação da linha.
- **Por que a v3.18.2 é patch:** nenhuma classe nova e nenhuma regra de antes muda; nasce uma regra no `telas.css`, presa a um atributo que os apps já usam na ação da linha, e o que ela tira (o sublinhado) o pacote nunca pôs.
- **Cartão clicável** (v3.12.0): `a.ov-cartao` e `button.ov-cartao` têm cursor de mão e, sob o mouse, o realce do livro, `ov-linha-hover` por cima da superfície; a borda não muda e o cartão aberto fica como está. O `a.ov-indicador` ganhou o mesmo realce no lugar da borda `ov-borda-forte` (o livro cita cartão e indicador na mesma regra); a borda de alerta fica visível sob o mouse. Regras fracas (`:where`), como a do aberto.
- **Barra de ações em massa no toque** (v3.13.0): a `.ov-acoes-massa` tem 50px em `pointer: coarse` (48 de miolo e a borda de 1px dentro), para conter os botões de 48; com 48 eles passavam 1px em cima e embaixo, por cima da borda. No computador continua com 48.
- **Alvos de toque** (v3.12.0): em `pointer: coarse`, a `.ov-visao` e os botões do `.ov-segmentado` têm 48px de altura mínima (eram 32 e 30; o segmentado fica com 56). Uma linha de `.ov-visoes` que quebra ganha outra fileira de 48px, 4px abaixo: 52px a mais por fileira.
- **Miolo do item** (v3.8.0): o `.ov-pendencia-estado` vai ao lado do `.ov-estado`, numa coluna de 88px (as palavras alinham); título (`.ov-pendencia-titulo`, 600, com elipse) e contexto (`.ov-pendencia-contexto`, 12px/16px) em duas linhas; o identificador (`.ov-pendencia-id`, mono 12px/16px) antes do título; a seta (`.ov-pendencia-seta`) no fim. Identificador, contexto e seta em `ov-texto-terciario`. **Item sem link** é `div.ov-pendencia`, sem a seta e sem CSS próprio: o realce e o anel de foco são só do `a`. O título da caixa é do app.
- **Indicadores**: a grade é a `.ov-indicadores`, em `div` ou `ul`; o máximo de 4 é do app. Em `ul`, desde a v3.8.0 o `li` é flex e o cartão ocupa a altura dele: os cartões de uma linha ficam da mesma altura nas duas formas. A grade continua 4/2/1 (1 coluna até 767px).
- **Barra de ações em massa**: `data-flutuante` põe a `.ov-acoes-massa` fixa, centrada, 24px acima do rodapé e da área segura (no celular, acima da `.ov-barra-inferior`), em `--ov-z-flutuante` e `--ov-fundo-barra` sem desfoque, entrando de 12px em 180ms. Sem o atributo, a caixa é a da v3.6. Com ela na tela, a `.ov-toasts` leva `data-com-barra`. Esc e ✕ limpam a seleção no app.
- **Esqueleto**: `.ov-esqueleto` é o bloco (o app dá a altura; 48px sem ela), `.ov-esqueleto-texto` uma linha de texto (o app dá a largura) e `.ov-esqueleto-linha` uma linha de tabela (44px; 64px no celular). Também serve uma `<tr>` da `.ov-tabela` com um `.ov-esqueleto-texto` por célula. Pulsa só na opacidade.
- **Movimento reduzido** (`telas.css`): a barra de massa só aparece, já no lugar (`ovFade`, da casca), e o esqueleto não pulsa.
- **Teclado da tabela** (↑↓, Enter, X): o núcleo é o `js/teclas-da-tabela.js` desde a v3.8.0 (ver `js/`); quem diz onde está o foco dentro da linha é a tabela, no app.

### Livro v4 (v3.19.0)

CSS e tokens da direção visual e das regras C de 30 e 31/10 (livro v4) e o bloco A da antiga v3.18.3. Nenhum `js/` novo (plural, data e hora e os núcleos de teclado vão na v3.20.0). As regras de uso estão no `livro-da-marca.md` e no `componentes.md` (Estado, Precisa de você, Indicador, Botão, Campo, Tabela, Visões e filtros, Casca), no `onevessel-docs`.

```html
<!-- Estado de fluxo: ponto + palavra; Em andamento no amarelo, só no ponto -->
<span class="ov-estado" data-tom="andamento">Em andamento há 3h10</span>

<!-- Tag pastel: situação ou alerta do registro; sem data-tom, neutra -->
<span class="ov-tag" data-tom="info">A bordo</span>
<span class="ov-tag">Arquivada</span>
<!-- Com ponto e contagem, só no cabeçalho do "Precisa de você" -->
<span class="ov-tag" data-tom="erro"><span class="ov-tag-ponto"></span>Urgente <span class="ov-tnum">2</span></span>
<!-- Tag forte: só o Crítico, com o ícone -->
<span class="ov-tag" data-tom="critico"><svg …triangle-alert…/>Crítico</span>
```

- **Tokens novos** (`tokens.json`, o `tokens.css` gerado): `ov-status-andamento` (`#facc15` nos dois temas; ponto, filete e barra, nunca texto: 1,53:1 sobre o branco, a exceção do livro), `ov-critico` (`#f87171` / `#dc2626`, fundo da tag forte, texto `ov-sobre-erro`: 7,18:1 e 4,83:1), `ov-tag-<tom>-fundo` e `ov-tag-<tom>-texto` para neutro, info, atencao, erro e sucesso, e `ov-destaque-texto` (`#fb923c` / `#9a4508`). O texto de cada tag dá, sobre o próprio fundo composto em `ov-superficie`, `ov-superficie-elevada` e `ov-fundo`, no mínimo 7,74:1 no escuro e 6,15:1 no claro (o teste da versão calcula). O `ov-destaque-suave` não muda. O preset do Tailwind lê o `tokens.json` e já traz as cores novas.
- **Estado e tags** (`casca.css`): `.ov-estado[data-tom="andamento"]`; `.ov-tag` (12/16, 500, padding 2px 8px, `ov-raio-sm`, sem ícone) com `data-tom` neutro, info, atencao, erro e sucesso; `.ov-tag-ponto` (6px, na cor do tom: `ov-neutro`, `ov-info`, `ov-atencao`, `ov-erro`, `ov-sucesso`); a contagem em `.ov-tnum` (algarismos tabulares dentro da tag também sem o `onevessel.css`); `.ov-tag[data-tom="critico"]` com o ícone de 14px em `currentColor`.
- **Filetes** (`telas.css`): `.ov-indicador[data-filete="neutro|info|andamento|atencao|erro|sucesso"]`, 3px à esquerda por `box-shadow: inset`, não por borda. **Em alerta** (`.ov-indicador[data-alerta="true"]`), a borda e o filete vão a `ov-destaque`: o filete de alerta substitui o de status, com ou sem `data-filete` (a regra do alerta desceu para logo depois dos filetes, com a mesma força, e vence pela ordem). `.ov-pendencia[data-tom="erro|atencao"]`, filete reto de 2px na cor da tag. O `.ov-progresso` continua por `--estado-cor`: a barra em segmentos é um `span` por status, cada um com a cor dele (no exemplo).
- **Contador** (`.ov-contador-destaque`): o texto passa a `ov-destaque-texto`: no claro, de 4,26 para 5,52:1 sobre o próprio fundo; no escuro, a mesma cor (5,99:1 sobre `ov-superficie`, 5,37:1 sobre `ov-superficie-elevada`). No "Precisa de você", os apps trocam o contador pelas tags Urgente e Atenção.
- **Visão selecionada** (`.ov-visao[aria-selected="true"]`, `[aria-current="page"]`): fundo `ov-acao-suave`, contorno de 1px `ov-acao` por sombra interna e rótulo em `ov-texto` peso 600 (14,2:1 no claro, 12,0:1 no escuro). As visões grandes não mudam: a regra delas continua vencendo pela força, e ganha o `font-weight: 500` dela para não herdar o 600.
- **Toque** (`pointer: coarse`): o `.ov-campo` com 48 (o `textarea` com 48 de mínimo e padding de 11px), o campo de linha também (48 e 16px); `.ov-abas-internas button` com 48 (`janelas.css`); `.ov-superior .ov-conta` com 48 (era 36: a força da regra da barra vencia o 48 da conta); `.ov-chip-filtro` com 48 de altura mínima e o ✕ com 48×48 (era 22; o ícone continua o de 14px do app).
- **Paleta**: no item realçado, o `.meta` vai a `ov-texto-secundario` (5,33:1 no escuro; era 4,22:1).
- **Botão** (`controles.css`): desabilitado a `opacity: .6` (era .45); `.ov-btn-icone svg` com 18px, sem encolher (o app deixa de passar `size`); `.ov-btn[aria-busy="true"]` com `cursor: progress`; `.ov-reticencias`, três pontos que acendem em sequência, só por opacidade, 1,2 s por ciclo, parados e visíveis com `prefers-reduced-motion`; `.ov-motivo`, 12/16 em `ov-texto-terciario`, 4px acima, escondido fora do toque e visível em `pointer: coarse`.
- **Contrato do "Salvando…"**, que o CSS não garante e o app cumpre: com `aria-busy="true"`, o app **ignora todo clique e Enter no botão até a resposta** — o botão não fica `disabled`, então continua clicável, e é essa guarda que evita o duplo envio; troca o rótulo pelo gerúndio ("Salvando", "Enviando") seguido das `.ov-reticencias` (`aria-hidden`), com o rótulo e as reticências num `span` só (soltos no botão, o gap de 8px do `.ov-btn` os separaria); mantém a variante e a largura; e, quando o servidor responde, tira o `aria-busy` e volta ao rótulo normal ou ao erro.
- **Contrato do `.ov-motivo`**: o motivo tem `id` próprio, o botão desabilitado aponta para ele por `aria-describedby` (escondido fora do toque, ele continua valendo como descrição), e o mesmo texto vai no `title` do botão (o computador mostra no mouse; no toque o `title` não existe, e o motivo aparece escrito abaixo).
- **Tabela no tablet** (C5): entre 768 e 1023px, `th` e `td` com `data-some-no-tablet` na `.ov-tabela` saem (o `data-principal` é do modo foco; abaixo de 768 a lista do celular tem as células todas). **`.ov-rolagem`**, o contêiner da tabela que ainda transborda: `overflow-x: auto` e a sombra na borda do lado que tem conteúdo escondido, só com CSS (as capas com `background-attachment: local` cobrem as sombras, presas na caixa, quando se chega à ponta). A capa tem a cor `--rolagem-fundo` (sem ela, `ov-superficie`, a do cartão). A sombra é o `ov-texto-secundario` (`--rolagem-sombra` troca), claro no escuro e escuro no claro, a 40% na borda (a cor começa em −150% do raio; sem `color-mix`, que tablet antigo não tem): 2,2:1 sobre `ov-superficie` e `ov-superficie-elevada` no escuro e 1,9:1 no claro. Uma sombra escura não se vê no escuro (o `ov-veu` dava 1,1:1).
- **Pular para o conteúdo** (C25, `casca.css`): `.ov-pular`, primeiro elemento da página, um link para o `h1` da tela; fora da tela até o `:focus-visible`, aí no topo à esquerda (somando a área segura), acima de tudo (`--ov-z-toast` + 1), com o anel do livro; 48 no toque. O `h1` leva `id` e `tabindex="-1"`.
- **Conta** (C26, L8): mora só na barra superior a partir de 768px; o rodapé da lateral fica só com o Recolher. As regras `.ov-conta` da lateral ficam no `casca.css` até os apps adotarem (a base é a mesma da barra superior).
- **Alteradas pelo nome** (o teste da versão cobra cada uma; o resto das fixtures da v3.18.2 fica igual regra a regra): no `controles.css`, `.ov-btn:disabled` e, no toque, `.ov-campo[data-densidade="linha"]` e `textarea.ov-campo[data-densidade="linha"]`; no `telas.css`, `.ov-visao[aria-selected="true"]`, `.ov-visao[aria-current="page"]`, `.ov-visoes[data-tamanho="grande"] > .ov-visao:is([aria-selected="true"], [aria-current="page"])`, `.ov-contador-destaque` e `.ov-indicador[data-alerta="true"]` (ganha o filete e desce para depois dos filetes; a única velha que muda de lugar). No `casca.css`, no `janelas.css` e no `tokens.css` nenhuma regra muda: só nascem.
- **Por que a v3.19.0 é minor:** classes, tokens e regras novas (`.ov-tag`, `.ov-tag-ponto`, `.ov-motivo`, `.ov-reticencias`, `.ov-rolagem`, `.ov-pular`, os filetes e o `data-some-no-tablet`), e as regras que mudam de valor estão na lista acima.
- **O que muda na tela dos apps ao adotar:** todo `.ov-btn-icone` passa a desenhar o ícone com 18px (o app tira o `size`); a visão selecionada fica preenchida em `ov-acao-suave`, com contorno `ov-acao` e rótulo 600 (antes `ov-item-ativo` com contorno `ov-borda-forte` e 500); no toque, todo campo vai a 48px, o campo de linha também, e as abas internas, a conta da barra superior e o chip de filtro com o ✕ vão a 48; o texto do contador de pendências escurece no claro; o indicador em alerta ganha o filete laranja de 3px à esquerda; o desabilitado fica menos apagado (0,6); e o `.meta` do item realçado da paleta clareia no escuro. O resto só aparece onde o app puser a classe ou o atributo novo.

### Texto, datas e teclado (v3.20.0)

Seis núcleos novos em `js/`, das decisões C de 31/10 (C8, C18, C19, C10) e do bloco D do livro v4. Nenhum CSS, token ou `js/` de antes muda. As regras de uso estão no `livro-da-marca.md` (Tom e escrita; Acessibilidade) e no `componentes.md` (Lista de cards, Visões e filtros, Painel lateral, Menu), no `onevessel-docs`. Como os outros núcleos: lógica pura, sem DOM e sem framework; o app descreve a tecla (`{ key, ctrlKey, metaKey, altKey, shiftKey }`, o `TeclaPressionada` do `teclas-do-painel.js`) e aplica a ação. **Com Ctrl, ⌘, Alt ou Shift, setas, Home, End e Enter não são dos núcleos** (como na tabela e no painel; Alt ← é o voltar do navegador); só o Esc e o Tab do menu fecham com qualquer modificador.

**Plural** (`texto.js`, C8): nunca "(s)"; singular só para 1; zero com número; o número em pt-BR.

```js
import { plural, palavra } from 'onevessel-ui/js/texto.js'

plural(3, 'pessoa', 'pessoas')       // "3 pessoas"
plural(0, 'atividade', 'atividades') // "0 atividades"
plural(1234, 'pessoa', 'pessoas')    // "1.234 pessoas"
palavra(1, 'dia', 'dias')            // "dia" (só a palavra, para quem já escreve o número)
```

**Data e hora** (`datas.js`, C18): sempre no fuso de Brasília (`FUSO_DE_BRASILIA`, `America/Sao_Paulo`, V2 de 31/10), nunca o do aparelho nem o do processo (na Vercel, UTC: o instante 02:30Z ainda é o dia anterior em Brasília); 24 h, sem segundos, sem "h" na hora. Aceita `Date`, texto ISO e milissegundos; vazio ou inválido devolve `""`. **Texto só com a data** (`"2026-10-26"`, a chave de dia do Paradas) é o dia de Brasília que ele nomeia, à meia-noite. Um `Date` é sempre instante: a data de `type="date"` que a Bordo grava à meia-noite UTC (os documentos do despacho) continua no `formatarData` dela, que lê em UTC. O "às" da frase ("encerrada em 26/10/2026 às 09:00") é do app.

```js
import { data, dataHora, dataHoraCurta, decorrido, diaRelativo, title } from 'onevessel-ui/js/datas.js'

data(i)                          // "26/10/2026"
dataHora(i)                      // "26/10/2026 09:00" (registro histórico)
dataHoraCurta(i)                 // "27/10, 20:00" no ano corrente; de outro ano, a dataHora
decorrido(Date.now() - inicio)   // "agora" · "há 45 min" · "há 3h" · "há 3h05" · "há 2 dias"
diaRelativo(i)                   // "hoje" · "ontem" · "24/10/2026"
title(i)                         // a dataHora, para o title de toda forma curta ou relativa
```

```html
<time datetime="2026-10-27T23:00:00Z" title="27/10/2026 20:00">27/10, 20:00</time>
<span class="ov-estado" data-tom="andamento" title="31/10/2026 06:55">Em andamento há 3h05</span>
```

`decorrido` recebe milissegundos (negativo, de relógio adiantado, é "agora"); os minutos depois da hora vão com dois dígitos e só quando não são zero. `dataHoraCurta` e `diaRelativo` recebem um `agora` opcional (o teste passa um fixo).

**Teclado das abas** (`teclas-das-abas.js`, C19), para as visões (`.ov-visoes`) e as abas internas do painel (`.ov-abas-internas`): ←→ com volta, Home, End; o resto é `null`. **A troca acontece no foco** (o app ativa a aba que recebe o foco, no mesmo passo) e **só a ativa entra no Tab** (`tabindex="0"` nela e `-1` nas outras, do app, como o `role`, o `aria-selected` e o `aria-controls`). Sem aba ativa (`atual` -1), → vai à primeira e ← à última.

```js
import { abaDeDestino } from 'onevessel-ui/js/teclas-das-abas.js'

function aoTeclar(evento) {                    // no role="tablist"
  const destino = abaDeDestino(atual, abas.length, evento)
  if (destino === null) return
  evento.preventDefault()
  ativar(abas[destino].id)                     // aria-selected, tabindex 0/-1 e o painel
  botoes[destino].focus()
}
```

**Teclado da Lista de cards** (`teclas-da-lista.js`, C10): uma parada de Tab por lista; ↑↓ entre cards **sem volta** (no primeiro, ↑ não faz nada), Home, End; Enter abre e fecha o card em foco; Esc dentro do card devolve o foco ao card. `acaoDaTeclaNaLista(tecla, indice, total, alvo)` devolve `{ foco: i }`, `{ alternar: i }`, `{ voltarAoCard: i }` ou `null` (o app não chama `preventDefault`). `indice` é o card onde está o foco; `alvo` diz onde, dentro dele:

| `alvo` | O foco está | ↑↓ Home End | Enter | Esc |
| --- | --- | --- | --- | --- |
| `'card'` | no próprio card (o elemento com o `tabindex`) | andam entre cards | `{ alternar }` | `null` |
| `'controle'` | num botão ou link do card | andam entre cards (como da Excluir na linha da tabela) | `null` (é do botão) | `{ voltarAoCard }` |
| `'campo'` | num campo de texto ou de escolha do card | `null` (cursor do campo) | `null` (a quebra de linha do `textarea`) | `{ voltarAoCard }` |

**Num campo de texto dentro do card, o núcleo ignora ↑↓, Home, End e Enter**: são do campo. Só o Esc volta ao card; um campo que usa o Esc (uma lista aberta) chama `preventDefault`, e o app não pergunta ao núcleo com `evento.defaultPrevented`. Para classificar o foco, o `ehCampo` do `teclas-do-painel.js` serve.

**Os controles do card só entram no Tab no card ativo.** O card ativo é o de `cardDoTab(total, ultimoComFoco)` (o último que teve o foco, se ainda está na lista; senão o primeiro; -1 com a lista vazia): ele leva `tabindex="0"` e os outros cards `tabindex="-1"`; **os botões, links e campos de todo card que não é o ativo levam `tabindex="-1"`**, e os do ativo ficam sem `tabindex` (na ordem natural). Quando o foco entra noutro card (setas, clique), ele vira o ativo e os `tabindex` trocam. No índice de dias do Paradas, a lixeira só entra no Tab da linha em foco, pela mesma regra.

```js
import { acaoDaTeclaNaLista, cardDoTab } from 'onevessel-ui/js/teclas-da-lista.js'
import { ehCampo } from 'onevessel-ui/js/teclas-do-painel.js'

function aoTeclar(evento) {                    // na lista
  if (evento.defaultPrevented) return
  const card = evento.target.closest('[data-card]')
  const indice = cards.indexOf(card)
  const alvo = evento.target === card ? 'card' : ehCampo(evento.target) ? 'campo' : 'controle'
  const acao = acaoDaTeclaNaLista(evento, indice, cards.length, alvo)
  if (!acao) return
  evento.preventDefault()
  if ('foco' in acao) cards[acao.foco].focus()
  else if ('alternar' in acao) alternar(acao.alternar)
  else cards[acao.voltarAoCard].focus()
}
```

**Teclado do Menu** (`menu-nucleo.js`, bloco D): o ⋮, o "+ Filtro", o "Exibir", o seletor de embarcação e o menu da conta. ↑↓ com volta, Home, End; Esc fecha e devolve o foco ao gatilho; Tab (e Shift Tab) fecha **sem** `preventDefault`, e o foco segue; Enter e Espaço são do próprio item (botão ou link de verdade). `acaoDaTeclaNoMenu(tecla, atual, total)` devolve `{ foco: i }`, `{ fechar: true, devolverFoco }` ou `null`. Abrir, posicionar, focar o primeiro item, fechar no clique fora, na rolagem e no redimensionar ficam no app; o Esc o app ouve no `document`, para fechar mesmo com o foco fora do menu. O aviso do "+ Filtro" conta como item (focável, `aria-disabled`).

```js
import { acaoDaTeclaNoMenu } from 'onevessel-ui/js/menu-nucleo.js'

function aoTeclar(evento) {                    // no role="menu" (e o Esc no document)
  const itens = [...menu.querySelectorAll('[role^="menuitem"]')]
  const acao = acaoDaTeclaNoMenu(evento, itens.indexOf(document.activeElement), itens.length)
  if (!acao) return
  if ('foco' in acao) { evento.preventDefault(); itens[acao.foco].focus() }
  else fechar(acao.devolverFoco)               // Esc: foca o gatilho; Tab: deixa o foco seguir
}
```

**"+ Filtro"** (`filtro-nucleo.js`, bloco D): `menuDoFiltro(campos, emUso, opcoes)` devolve `{ itens, aviso }`. `itens` são os campos da visão que ainda não filtram e têm **duas opções ou mais** na lista, na ordem dos campos; sem nenhum, `aviso` é `TODOS_EM_USO` ("Todos os filtros em uso") quando algum filtro está em uso, e `NADA_PARA_FILTRAR` ("Nada para filtrar nesta lista") quando nenhum está — o critério do Paradas #104, aceito em 29/10. **O botão nunca some** (28/10, AJ4): sem itens, o menu abre com o aviso, um `menuitem` com `aria-disabled`, focável, sem ação. O segundo passo (os valores do campo, com "Voltar") e os chips são do app.

```js
import { menuDoFiltro } from 'onevessel-ui/js/filtro-nucleo.js'

const { itens, aviso } = menuDoFiltro(['tipo', 'empresa', 'turno'], Object.keys(filtros), (campo) => valoresNaLista(campo))
// itens: ['empresa']   aviso: null
// sem itens: aviso "Todos os filtros em uso" ou "Nada para filtrar nesta lista"
```

- **Por que a v3.20.0 é minor:** só arquivos novos em `js/` (seis `.js` com os seus `.d.ts`, todos em `exports`). Os CSS, o `tokens.json` e os `js/` de antes ficam com os bytes da v3.19.0 (o teste da versão cobra pelo sha256).
- **O que muda na tela dos apps ao adotar:** nada, até o app trocar o código dele pelo núcleo. Ao trocar: datas e horas que hoje saem no fuso do aparelho (o `formatDiaHora` e o `formatDataHora` do Paradas) passam ao de Brasília; o "(s)" sai; o milhar ganha o ponto; as abas do `PainelDaTt` ganham Home e End; o "+ Filtro" da Bordo deixa de sumir e deixa de oferecer campo de uma opção só.

### Relatório (papel e impressão)

Desde a v3.10.0 (D1 da F7). As `.rel-*` que moravam no `onevessel.css` estão no `relatorio.css`, com os mesmos valores, fora três regras: a `.rel-pagina` ganhou `page: relatorio`, o `.rel-tabela th` subiu de 11px para 8,5pt e a `.rel-barra` virou interface (fonte do sistema, `--ov-*`, sem o `max-width: 210mm`). O `impressao.css` foi reescrito sem seletor global. As regras do documento (Timbre, resumo, estados, nome do arquivo) estão em `relatorios-e-logos.md`, no `onevessel-docs`.

**Onde importar.** O app importa o `relatorio.css` e o `impressao.css` **só nas rotas dos relatórios internos**, nunca no CSS global. Nenhum dos dois chega a um formulário oficial (NORMAM, ANVISA): nem o CSS, nem uma classe `.rel-*`, nem o logo. No Materiais o `relatorio.css` vem pelo `onevessel.css` global, sem dano (só classes `.rel-*`); o `impressao.css`, que tem o `@page`, entra só nas rotas de relatório em todo app.

```js
// Rota de relatório interno (Bordo, Paradas): o layout dela, não o globals.css
import 'onevessel-ui/css/fontes.css'
import 'onevessel-ui/css/relatorio.css'   // já traz o previa.css
import 'onevessel-ui/css/impressao.css'
```

```js
// Prévia de um formulário oficial: só a barra e a área, nada da folha nem @page
import 'onevessel-ui/css/previa.css'
```

```html
<html style='--rel-rodape: "OneVessel · Bordo · Ocupação do convés"'>
…
<div class="rel-area">
  <div class="rel-barra">
    <button>Voltar</button>                    <!-- os botões são do app -->
    <h1 class="rel-barra-titulo">Ocupação do convés A</h1>
    <button>Imprimir ou salvar PDF</button>
  </div>
  <article class="rel-pagina">                <!-- data-orientacao="paisagem" para A4 deitado -->
    <header class="rel-timbre">
      <img src="/marca/bram-offshore-horizontal.png" alt="BRAM Offshore">
      <div><h2 class="rel-titulo">Ocupação do convés</h2><div class="rel-sub">&lt;navio&gt; · Convés A</div></div>
      <div class="rel-meta">20/10/2026<br>Emitido por &lt;pessoa&gt;</div>
    </header>
    <div class="rel-resumo"><div><b>22 / 49</b><span>leitos ocupados</span></div>…</div>
    <h3 class="rel-secao">Camarotes</h3>
    <table class="rel-tabela">
      <thead><tr><th>Camarote</th><th>Estado</th><th class="rel-num">Leitos</th></tr></thead>
      <tbody><tr>
        <td>A-101</td>
        <td><span class="rel-estado"><span aria-hidden="true">●</span> Concluído</span></td>
        <td class="rel-num">4</td>
      </tr></tbody>
    </table>
    <footer class="rel-rodape">…</footer>     <!-- só na tela; no papel, as caixas de margem -->
  </article>
</div>
```

- **Páginas com nome.** A `.rel-pagina` pede `page: relatorio` (`@page relatorio`: A4 em pé, margem de 16mm); com `data-orientacao="paisagem"`, `page: relatorio-paisagem` (A4 deitado, 16mm), e na tela a folha tem 297mm e a proporção do A4 deitado (`aspect-ratio: 297 / 210`). Não há `@page` sem nome: o do formulário oficial fica intacto. Duas consequências:
  - `page: relatorio` sem o `impressao.css` (o Materiais, que recebe a `.rel-pagina` pelo `onevessel.css`) não muda tamanho nem margem, mas força uma quebra de página antes e depois da folha, como toda troca de página com nome.
  - **Na rota do relatório, nenhum `@page` sem nome pode vir depois do `impressao.css`.** No Chromium 156 (medido em 20/10, no PDF), um `@page { size; margin }` sem nome que venha depois ganha do `@page relatorio` no tamanho e na margem: o Chromium decide pela ordem, não pelo nome. Antes dele, não atrapalha.
- **Rodapé.** Sai inteiro pelas caixas de margem das duas páginas, em IBM Plex Sans 8pt, `rel-mudo`: à esquerda (`@bottom-left`) o texto de `--rel-rodape`; à direita (`@bottom-right`) "pág. n/N", dos contadores `page` e `pages`. **O app escreve `--rel-rodape` no `<html>` (`:root`) da prévia, com o texto entre aspas** (`--rel-rodape: "OneVessel · Bordo · Ocupação do convés"`, pelo atributo `style` do `<html>` ou por um `:root { }` da rota). Definida no `body` ou na `.rel-pagina`, a caixa sai vazia (medido no Chromium 156: a caixa de margem herda da raiz, não da folha); sem a variável, a esquerda sai vazia e a numeração continua. Só o Chrome e o Edge 131+ desenham caixas de margem: fora deles, o documento sai sem rodapé. A `.rel-rodape` da folha some no papel, para o texto não sair duas vezes; na tela ela continua. No diálogo do Chrome, desmarcar "Cabeçalhos e rodapés", senão o navegador soma os dele.
- **Papel em preto e branco** (`@media print`): a `.rel-barra` some e a `.rel-area` perde o fundo (pelo `previa.css`); filete em preto; logo em cinza, com 10mm de altura (40px na tela); sem fundos (a `.rel-area` e a folha ficam sem cor, o resumo sem tinta e com borda fina); títulos e números do resumo em preto. Linha de tabela não quebra entre páginas (`.rel-tabela tr`), e o cabeçalho (`.rel-tabela thead`) se repete em cada página.
- **Tamanhos**: todo texto da folha com 8,5pt ou mais (o `th` subiu para 8,5pt); o rodapé, 8pt.
- **Coluna numérica**: `.rel-num` no `th` e no `td` da coluna: à direita, `tabular-nums`.
- **Estado e prioridade**: `.rel-estado` é símbolo e palavra, sem fundo e sem cor de estado (herda a cor do texto). O app escreve o símbolo num `span` com `aria-hidden` (● ○ ▲ × △, a tabela está em `relatorios-e-logos.md`); a Plex não tem esses glifos, e eles caem na fonte do sistema.
- **Barra** (`.rel-barra`): interface, não papel — fonte do sistema e `--ov-*`. Voltar à esquerda, o título (`.rel-barra-titulo`, `titulo-3`: 16px, 600, com elipse) ocupa o resto, e a ação fica à direita. Ocupa a largura da `.rel-area`, para alinhar com a folha em pé e deitada. Os botões são do app. Desde a v3.11.0 (BV-8) a barra e a área moram no `previa.css`, com os mesmos valores: o `relatorio.css` o importa, e a prévia de um formulário oficial importa só ele.
- **Fora daqui**: o JSX da barra e do Timbre, o conteúdo de cada relatório, o `<title>` e o nome do arquivo são do app; o PDF por código do Paradas (pdfmake) segue as mesmas medidas, com o tema próprio conferido contra os tokens.

### App com CSS próprio (Materiais)

```js
// main.jsx, antes do CSS do app
import 'onevessel-ui/css/fontes.css'
import 'onevessel-ui/css/tokens.css'
import 'onevessel-ui/css/onevessel.css'
import './estilos-do-app.css'
```

Na fase F1, aponte as variáveis antigas para as novas em vez de trocar tudo de uma vez:

```css
:root {
  --bp-fundo: var(--ov-fundo);
  --bp-texto: var(--ov-texto);
  --bp-acento: var(--ov-acao);
}
```

Assim a tela inteira muda de aparência sem tocar em componente nenhum, e as variáveis antigas vão sendo apagadas aos poucos.

### App com Tailwind 3 (Paradas)

```js
// tailwind.config.js
module.exports = {
  presets: [require('onevessel-ui/tailwind/preset.js')],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
}
```

```js
// main.jsx
import 'onevessel-ui/css/fontes.css'
import 'onevessel-ui/css/tokens.css'
import 'onevessel-ui/css/casca.css'
import 'onevessel-ui/css/janelas.css'
import 'onevessel-ui/css/telas.css'
import 'onevessel-ui/css/controles.css'
import './index.css' // onde ficam as diretivas do Tailwind
```

Depois disso, `bg-fundo`, `text-texto`, `bg-acao`, `rounded-lg`, `shadow-1`, `h-campo` e `text-titulo-1` já saem com os valores da OneVessel.

**O preset não declara `spacing` nem `darkMode`** (decidido em 12/10, v3.3.0):

- `spacing`: a escala padrão do Tailwind (`p-4` = `1rem`) já coincide com `--ov-esp-*` com raiz de 16px, e em `rem` ela cresce quando a pessoa aumenta a fonte do navegador. Use `p-4`, `gap-2` etc. normalmente; `--ov-esp-*` continua valendo no CSS escrito à mão.
- `darkMode`: os tokens trocam de tema sozinhos, por variável, com `data-theme` no `<html>`; `bg-fundo` já está certo nos dois temas. Se o app ainda usa `dark:`, ele declara o próprio `darkMode` no `tailwind.config.js` e mantém a classe em sincronia com `data-theme`.

### App com Tailwind 4 (Bordo)

O Tailwind 4 não usa preset. Importe os tokens e repasse as variáveis no `@theme`:

```css
@import 'tailwindcss';
@import 'onevessel-ui/css/fontes.css';
@import 'onevessel-ui/css/tokens.css';
@import 'onevessel-ui/css/casca.css';
@import 'onevessel-ui/css/janelas.css';
@import 'onevessel-ui/css/telas.css';
@import 'onevessel-ui/css/controles.css';

@theme {
  --color-fundo: var(--ov-fundo);
  --color-superficie: var(--ov-superficie);
  --color-borda: var(--ov-borda);
  --color-texto: var(--ov-texto);
  --color-texto-secundario: var(--ov-texto-secundario);
  --color-acao: var(--ov-acao);
  --color-sucesso: var(--ov-sucesso);
  --color-atencao: var(--ov-atencao);
  --color-erro: var(--ov-erro);
  --radius-md: var(--ov-raio-md);
  --radius-lg: var(--ov-raio-lg);
  --color-foco: var(--ov-foco);
  /* sem var(--font-sans) aqui: o nome seria igual ao da variável e viraria um laço */
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
```

Os utilitários próprios do app (`bg-painel`, `text-texto`) continuam funcionando enquanto você troca um por um.

## js/

Comportamento sem framework que a Bordo e o Paradas tinham igual, linha a linha (D1; desde a v3.4.0). ESM puro, sem DOM e sem importar pacote nenhum; os tipos vêm junto, para TypeScript strict.

| Arquivo | O que é |
| --- | --- |
| `js/paleta-nucleo.js` | O núcleo da paleta de comandos: filtro (sem acento e sem caixa), ordem dos grupos, seleção, teclado (↑↓, Enter, Esc), atalho Ctrl K / ⌘K, atributos ARIA e o anúncio do `aria-live`. Reexporta `focoQueGira` |
| `js/foco-preso.js` | `focoQueGira` e `FOCAVEIS`: o foco preso da folha do "Mais" e da paleta |
| `js/toast-nucleo.js` | O núcleo do Toast (v3.6.0): fila de 3, prazo de 8s com pausa por ponteiro e foco, erro sem prazo, filtro do Ctrl Z |
| `js/teclas-do-painel.js` | O teclado do Painel lateral (v3.6.0): ↑↓ trocam de registro, Esc fecha, e onde está o foco |
| `js/camada.js` | A pilha de camadas modais (v3.6.0): quem está no topo e a trava de rolagem do `<html>` |
| `js/alteracoes-nucleo.js` | "Há alterações nesta tela" (v3.6.0): o registro em árvore e o texto único do "Descartar alterações?" |
| `js/teclas-da-tabela.js` | O teclado da linha da `.ov-tabela` (v3.8.0): ↑↓ só movem o foco entre linhas, Enter abre, X marca onde há seleção; o destino sem dar a volta e a linha que recebe o Tab |
| `js/lateral-nucleo.js` | A lateral recolhida por escolha (v3.15.0): `CHAVE_LATERAL` (`ov-lateral`), `lerLateral`, `gravarLateral`, `alternarLateral`, `aplicarLateral` (o `data-lateral` da casca), `botaoDaLateral` (ícone, texto, rótulo e `aria-expanded`) e `ouvirLateral` (o evento `storage` de outra aba); armazenamento bloqueado não derruba nada (ver Casca) |
| `js/texto.js` | Plural (v3.20.0, C8): `plural(n, um, varios)` ("3 pessoas", "1.234 pessoas") e `palavra(n, um, varios)` (só a palavra); nunca "(s)" |
| `js/datas.js` | Data e hora no fuso de Brasília (v3.20.0, C18): `data`, `dataHora`, `dataHoraCurta`, `decorrido`, `diaRelativo`, `title` e `FUSO_DE_BRASILIA` |
| `js/teclas-das-abas.js` | O teclado das visões e das abas internas (v3.20.0, C19): `abaDeDestino` (←→ com volta, Home, End) |
| `js/teclas-da-lista.js` | O teclado da Lista de cards (v3.20.0, C10): `acaoDaTeclaNaLista` (↑↓ sem volta, Home, End, Enter, Esc de dentro do card) e `cardDoTab` |
| `js/menu-nucleo.js` | O teclado do Menu (v3.20.0, bloco D): `acaoDaTeclaNoMenu` (↑↓ com volta, Home, End, Esc devolve ao gatilho, Tab fecha sem prender) |
| `js/filtro-nucleo.js` | O "+ Filtro" (v3.20.0, bloco D): `menuDoFiltro` (os campos a oferecer, ou o aviso), `TODOS_EM_USO` e `NADA_PARA_FILTRAR` |

```js
import { abrir, digitar, teclar, anuncio } from 'onevessel-ui/js/paleta-nucleo.js'
import { FOCAVEIS, focoQueGira } from 'onevessel-ui/js/foco-preso.js'
import { filaVazia, acrescentar, pausar, retomar, vencer, toastDoCtrlZ } from 'onevessel-ui/js/toast-nucleo.js'
import { acaoDaTecla, ondeEstaOFoco, vizinho } from 'onevessel-ui/js/teclas-do-painel.js'
import { abrirCamada, camadasAbertas } from 'onevessel-ui/js/camada.js'
import { criarRegistroDeAlteracoes, DESCARTAR } from 'onevessel-ui/js/alteracoes-nucleo.js'
import { acaoDaTeclaNaLinha, linhaDeDestino, linhaDoTab } from 'onevessel-ui/js/teclas-da-tabela.js'
import { lerLateral, alternarLateral, aplicarLateral, botaoDaLateral, ouvirLateral } from 'onevessel-ui/js/lateral-nucleo.js'
import { plural, palavra } from 'onevessel-ui/js/texto.js'
import { data, dataHora, dataHoraCurta, decorrido, diaRelativo, title } from 'onevessel-ui/js/datas.js'
import { abaDeDestino } from 'onevessel-ui/js/teclas-das-abas.js'
import { acaoDaTeclaNaLista, cardDoTab } from 'onevessel-ui/js/teclas-da-lista.js'
import { acaoDaTeclaNoMenu } from 'onevessel-ui/js/menu-nucleo.js'
import { menuDoFiltro, TODOS_EM_USO, NADA_PARA_FILTRAR } from 'onevessel-ui/js/filtro-nucleo.js'
```

Desde a v3.20.0, os seis da rodada de UX (plural, datas e os quatro de teclado); o contrato e um exemplo de cada estão em **Texto, datas e teclado (v3.20.0)**.

`js/package.json` só tem `{"type": "module"}`: o pacote é CommonJS (o preset do Tailwind usa `module.exports`), e assim o Node carrega `js/` como ESM sem aviso.

O app fornece as fontes (os grupos, já montados por função) e desenha o componente; o núcleo só filtra, ordena e anda pela seleção. Os tipos (`GrupoDaPaleta`, `ItemDaPaleta`, `EstadoDaPaleta`…) saem do mesmo caminho.

Os quatro da v3.6.0 importam a Bordo e o Paradas (a adoção sai num PR por app). O que é de cada um fica no app:

- **`toast-nucleo.js`**: funções puras sobre a fila e um relógio que o app passa (`agora`, em ms). O app desenha a `.ov-toasts`, liga `mouseenter`/`mouseleave` e `focusin`/`focusout` a `pausar`/`retomar`, agenda o próximo `vencer` com `proximoVencimento` e chama `toastDoCtrlZ` no `keydown`, passando `camadasAbertas() > 0`.
- **`teclas-do-painel.js`**: o componente descreve a tecla e a situação (`ondeEstaOFoco` com o `document.activeElement` e o `body`), e `acaoDaTecla` diz `"anterior"`, `"proximo"`, `"fechar"` ou `null`. A troca de registro (`vizinho` na lista do app) e a pergunta antes de fechar com dado digitado são do componente.
- **`camada.js`**: `abrirCamada()` devolve quem fecha (a própria função, ou `fechar()`) e `estaNoTopo()`; a primeira camada trava a rolagem do `<html>` e a última devolve, e sem `document` (servidor, teste) só conta. **O gancho do React fica no app** (`useCamadaModal` na Bordo, `useCamada` no Paradas), como invólucro fino: abre no `useEffect` e fecha na limpeza.
- **`alteracoes-nucleo.js`**: `criarRegistroDeAlteracoes(pai?)` com `marcar(chave, sujo)`, `remover(chave)`, `ha()` e `filho()`; o filho conta no pai como uma chave só. `DESCARTAR` (congelado) tem `titulo`, `frase`, `continuar` e `descartar` do Diálogo. **Quem diz se houve digitação fica no app**: `retratoDosCampos` na Bordo (entradas de `FormData`), `retrato`, `mudou` e `reportSujo` no Paradas (estado do React).

Desde a v3.8.0, o `teclas-da-tabela.js` (V10 da v3.8.0; era `src/lib/teclas-da-tabela.ts` na Bordo e `src/lib/teclas-da-tabela.js` no Paradas, iguais linha a linha). A adoção sai no PR de cada app, com o resto da v3.8.0:

- **`teclas-da-tabela.js`**: a tabela descreve a tecla e onde está o foco dentro da linha (`'campo'`, `'linha'` ou `'outro-controle'`), e `acaoDaTeclaNaLinha` diz `"anterior"`, `"proximo"`, `"abrir"`, `"marcar"` (só com `comSelecao`) ou `null`; `linhaDeDestino` e `linhaDoTab` andam numa lista de ids que o app passa. **Quem classifica o foco (`alvoNaLinha`) fica no app**, porque muda de tabela para tabela (o checkbox do Embarcar da Bordo é "outro-controle"); os quatro de hoje usam o `ehCampo` do `teclas-do-painel.js`.

## Temas

O tema escuro é o padrão e vale sem nenhum atributo. Para o claro, ponha `data-theme="claro"` no `<html>`:

```js
document.documentElement.dataset.theme = 'claro'
```

Guarde a escolha da pessoa e aplique antes da primeira pintura, para a tela não piscar.

O `tokens.css` declara o `color-scheme` junto do tema (v3.10.1): `dark` na raiz e no `[data-theme="escuro"]`, `light` no `[data-theme="claro"]`. É o que faz o navegador pintar os controles nativos (o ícone do calendário e do relógio dos campos de data e hora, a barra de rolagem) para o tema certo. Os apps não repetem isso no CSS deles.

## Ícones de PWA

Um PWA só, o da OneVessel; módulos não instaláveis (v3.14.0). A plataforma é o único instalável e copia o manifesto e os ícones dela:

```
public/icones/              ← icons/plataforma/*
public/manifest.webmanifest ← manifestos/plataforma.webmanifest
```

Os módulos (Bordo, Paradas, Materiais) não têm manifesto nem PNG: copiam só o `icons/<app>/icone.svg`, como favicon, e apontam para o manifesto da OneVessel. A plataforma também copia o `icone.svg` de cada módulo para a escolha do módulo. Toda cópia tem teste de sha256 contra o pacote, como o logo dos relatórios.

**Por que a v3.14.0 é minor:** saíram os manifestos dos três módulos e os PNGs deles (192, 512, maskable, apple-touch-icon), que nenhum app usa desde que os módulos deixaram de ser instaláveis. Os 9 arquivos que ficam têm os mesmos bytes da v3.13.0, e nenhum CSS mudou: nenhum app perde arquivo que usa.

## Logo dos relatórios

`marca/bram-offshore-horizontal.png` (v3.10.0): o logo horizontal da BRAM Offshore, 2425×1073, fundo transparente, 33.494 bytes, sha256 `86070cbcbbc1bb3d70c699b1eb049dc62d5ac295f421f35aecee3457811e7a95`. Vai no `.rel-timbre` de todo relatório interno, com 10mm de altura no papel e 40px na tela, sempre sobre branco; nunca num formulário oficial.

**O app copia o arquivo, com teste de bytes**, como os ícones: copia para dentro de si (por exemplo, `public/marca/`) e tem um teste que compara o sha256 da cópia com o do pacote (`onevessel-ui/marca/bram-offshore-horizontal.png`, em `exports` como `./marca/*`). Ao subir de versão, o teste acusa se o logo mudou.

```
public/marca/bram-offshore-horizontal.png ← marca/bram-offshore-horizontal.png
```

## Mudar a design system

1. Altere `tokens/tokens.json`, `css/casca.css`, `css/janelas.css`, `css/telas.css`, `css/controles.css`, `css/relatorio.css`, `css/previa.css`, `css/onevessel.css` ou `css/impressao.css`. Classe de estrutura vai na casca, camada sobre a tela (Diálogo, Toast, Painel, folha) vai nas janelas, o que vai dentro da tela (tabela, indicadores, pendências, visões) vai nas telas, botões e campo vão nos controles; nenhum seletor fica em dois arquivos.
2. `npm run build` (regenera `css/tokens.css`).
3. `npm run conferir` e `npm run testar`.
4. Abra `exemplo/index.html` e confira nos dois temas, com a janela larga, entre 768 e 1023px e abaixo de 768px.
5. `npm run icones` só quando mudar cor da marca ou glifo (precisa do Playwright). `npm run icones -- paradas bordo` gera só essas pastas. Gera os PNGs só para a plataforma, o único instalável; os módulos ficam só com o `icone.svg` (v3.14.0).
6. Suba uma tag nova (`v3.12.1`) e avise os apps.

Decisão de design não nasce aqui: ela vem da conversa da design system, e este repositório só a publica.

## Regras que não mudam

- Nada de valor solto no código do app: cor, espaçamento e raio saem sempre de uma variável.
- Nada de `confirm()` nem `alert()`: use as classes `ov-dialogo` e `ov-toast` (em `janelas.css`).
- Este repositório é público e guarda só estilo. As diretrizes de uso, de permissão e de documento ficam no repositório privado `onevessel-docs`.

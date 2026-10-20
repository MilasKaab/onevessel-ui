# onevessel-ui

Identidade compartilhada dos apps OneVessel: **Materiais**, **Paradas** e **Bordo**, mais a plataforma.

Este repositório é a única fonte das cores, tipografia, espaçamentos, CSS de componentes, fontes e ícones de PWA. Os apps instalam por versão; nenhum app copia valores para dentro de si.

## O que tem aqui

| Pasta | O que é |
| --- | --- |
| `tokens/tokens.json` | Fonte de tudo: cores nos dois temas, tipografia, espaçamentos, raios, sombras, tamanhos e camadas |
| `css/tokens.css` | Gerado do arquivo acima. Variáveis CSS (`--ov-*`), tema escuro na raiz e claro em `[data-theme="claro"]` |
| `css/casca.css` | Só a estrutura das telas: barra lateral (240px; 56px recolhida abaixo de 1024px), barra superior, cabeçalho e barra inferior do celular (abaixo de 768px), seletor de embarcação, conta, sincronização, menu, paleta, folha móvel do "Mais", etiqueta, estado (`.ov-estado`), faixa e estados de tela. Importável sozinha: sem `body`, sem base de 14px, sem impressão |
| `css/janelas.css` | As camadas sobre a tela: Diálogo, Toast, Painel lateral, rodapé e alturas da folha móvel, e o `ov-btn-perigo`. Importável sozinho, como a casca (depende de `tokens.css` e `casca.css`) |
| `css/telas.css` | O que vai dentro da tela (v3.7.0; o miolo do item do Precisa de você e o cartão que estica na grade desde a v3.8.0): tipografia, cartão e indicadores (grade 4/2/1), Precisa de você, visões e filtros, contador, progresso, segmentado, checkbox, tabela (lista de linhas abaixo de 768px), barra de ações em massa e esqueleto. Importável sozinho, como a casca (depende de `tokens.css` e, para o movimento reduzido, de `casca.css`) |
| `css/onevessel.css` | A base de 14px e as classes dos componentes (`ov-btn`, `ov-campo`, timbre de relatório…). Começa importando `casca.css`, `janelas.css` e `telas.css` |
| `css/impressao.css` | O `@media print` e o `@page` dos relatórios internos. Só a página de impressão importa (F7) |
| `css/fontes.css` | IBM Plex Sans e Mono servidas pelo próprio app, sem Google Fonts. Só para o que é impresso: a interface usa a fonte do sistema |
| `fonts/` | Os `.woff2` do subconjunto latino (400, 500, 600) |
| `tailwind/preset.js` | Preset do Tailwind 3 que aponta para as mesmas variáveis |
| `icons/` | Ícones de PWA de cada app (192, 512, maskable, apple-touch-icon) e o SVG de origem |
| `manifestos/` | Modelos de `.webmanifest` dos quatro instaláveis (plataforma, Materiais, Paradas, Bordo) |
| `js/` | O comportamento que os apps repetiam linha a linha (D1): o núcleo da paleta de comandos, o foco preso dos diálogos e, desde a v3.6.0, o núcleo do Toast, o teclado do Painel lateral, a pilha de camadas modais e o registro de alterações, e, desde a v3.8.0, o teclado da linha da tabela. ESM puro, sem dependência (nem de React), com `.d.ts` |
| `exemplo/` | Página de conferência com tudo aplicado nos dois temas, inclusive a casca |
| `scripts/conferir.mjs` | `npm run conferir`: confere a divisão entre `casca.css`, `janelas.css`, `telas.css`, `onevessel.css` e `impressao.css` (e que todo CSS está em `exports`), que nenhum nome antigo de app sobrou e que `js/` só importa caminho relativo, tem um `.d.ts` por `.js` e está todo em `exports` |
| `test/` | `npm run testar`: os testes de `js/`, sem DOM, e os da divisão do CSS (`css.test.mjs`: o que saiu do `onevessel.css` na v3.5.0 mora no `janelas.css`, o `.ov-estado` da v3.6.0 no `casca.css` e as telas da v3.7.0 no `telas.css`, com os mesmos valores; na v3.8.0, toda regra do `telas.css` da v3.7.0 com os mesmos valores, mais o miolo do item e o cartão que estica; na v3.9.0, toda regra do `casca.css` e do `janelas.css` da v3.8.0 igual, fora a lista que ganhou o recuo lateral, e nela a fórmula da v3.8.0 com o recuo em 0; e o contraste dos estados novos nos dois temas, pelos tokens). Roda `node --test "test/*.test.mjs"`, com o glob do próprio Node: no Node 24, `node --test test/` não abre pasta |

## Cor e tipografia, em uma linha

Duas identidades, e nunca se misturam:

- **Interface dos apps** — paleta petrol/ciano da Bram Power sobre o navy `#040a12`: `--ov-acao` é o petrol `#0e7490`, igual nos dois temas; `--ov-acao-hover` e `--ov-foco` são o ciano `#22d3ee` no escuro e o petrol escurecido `#0a5f77` no claro. Tipografia é a **fonte do sistema** (`--font-sans`): a bordo a conexão cai e o app tem que abrir sem esperar download nenhum.
- **Tudo que é impresso** — timbre da BRAM: `--rel-*` (marinho `#0d4b88` e laranja `#ec6a3b`) e **IBM Plex** (`--font-rel-sans`, `--font-rel-mono`), servida em woff2 pelo próprio app. É o que as classes `.rel-*` usam.

Fora disso ficam os **formulários oficiais** (NORMAM-08/DPC, ANVISA): reproduzem o anexo do órgão e não recebem nada daqui.

## Instalar num app

```bash
npm i "onevessel-ui@github:MilasKaab/onevessel-ui#v3.9.0"
```

Use sempre uma **tag de versão**. Quando a design system mudar, sai uma tag nova e cada app atualiza quando quiser — nunca no meio de outra entrega.

### Qual CSS importar

| Arquivo | Quem importa |
| --- | --- |
| `tokens.css` | Todo app, sempre primeiro |
| `casca.css` | App que mantém a própria base (Bordo, Paradas): só as classes de estrutura (e, desde a v3.6.0, o `.ov-estado`), sem mexer no `body` nem na impressão |
| `janelas.css` | App que mantém a própria base (Bordo, Paradas), depois de `casca.css`: Diálogo, Toast, Painel lateral e folha |
| `telas.css` | App que mantém a própria base (Bordo, Paradas), depois de `janelas.css`: indicadores, Precisa de você, visões, tabela, barra de massa, esqueleto |
| `onevessel.css` | App que adota a base de 14px e todos os componentes (já traz `casca.css`, `janelas.css` e `telas.css`; não importe junto) |
| `impressao.css` | Só a página de impressão dos relatórios internos, depois do `onevessel.css` |
| `fontes.css` | Quem imprime relatório (IBM Plex) |

### Casca

```html
<div class="ov-casca">
  <nav class="ov-lateral">
    <div class="ov-lateral-marca">
      <svg …glifo do app…/>
      <div class="ov-lateral-marca-texto">
        <span class="ov-lateral-marca-nome">Bordo</span>
        <span class="ov-lateral-marca-sub">Conveses, embarque e despacho</span>
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
    <div class="ov-lateral-rodape">
      <button class="ov-conta" title="Ana Souza"><svg …circle-user…/><span class="ov-lateral-texto">Ana Souza</span></button>
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
    <main class="ov-tela">…</main>
    <nav class="ov-barra-inferior">                      <!-- só abaixo de 768px -->
      <a class="ov-barra-inferior-item" aria-current="page">…</a>   <!-- até 4 destinos -->
      <button class="ov-barra-inferior-item" aria-expanded="false">…Mais</button>
    </nav>
  </div>
</div>
```

- Tudo que é texto na lateral vai em `.ov-lateral-texto` (ou `.ov-lateral-marca-texto`): abaixo de 1024px a lateral recolhe para 56px, esse texto sai da tela (continua para o leitor de tela) e o `title` de cada item fica.
- O topo da lateral num app é o glifo solto de 20px em `currentColor`; `.ov-monograma` é só da plataforma.
- `.ov-seletor-embarcacao` desenha a própria seta. Com um navio só, use `data-fixo` num elemento que não é botão: sem seta, sem cursor.
- Em tela de toque (`pointer: coarse`), os itens da lateral passam a 48px.
- Margem da tela: 32px no computador, 24px de 768 a 1023px, 16px abaixo de 768px.
- Abaixo de 768px, `.ov-paleta` vira a tela "Buscar", inteira.
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
- **`ov-btn-perigo`** só existe dentro do Diálogo e traz **só as cores** (`--ov-erro` e `--ov-sobre-erro`). A base do botão (altura, padding, fonte) é do app; quem usa o `onevessel.css` junta com `ov-btn`.
- **Toast**: centro inferior no computador; com a barra de ações em massa na tela, o app põe `data-com-barra` na `.ov-toasts` e a pilha sobe para 96px. Abaixo de 768px, logo abaixo da barra superior (`--ov-barra-superior` + área segura + 12px), entrando de cima. Sem `data-tipo` (ou `"sucesso"`) o ícone vai em `--ov-toast-sucesso`; `data-tipo="erro"` usa `--ov-toast-erro` e o CSS esconde a barra de tempo. O máximo de 3 é do app.
- **Barra de tempo**: anda de 100% a 0 em `--ov-toast-duracao` (8s, em `tokens.css`; o app pode trocar a variável) e **pausa com `:hover` e `:focus-within`** no toast. O temporizador do núcleo do toast (`js/toast-nucleo.js` desde a v3.6.0) pausa e retoma **nos mesmos eventos** (`mouseenter`/`mouseleave`, `focusin`/`focusout` do toast), senão a barra e o fechamento se desencontram.
- **Painel lateral**: não é modal no computador. **Abaixo de 1024px vira Folha móvel de 90%** (`data-altura="cheia"` no painel dá a tela inteira) e passa a ser modal: **o app põe o `.ov-veu` antes dele e prende o foco** enquanto a folha estiver aberta.
- **Folha**: sem `data-altura`, a altura do conteúdo (o "Mais"). Na `"cheia"` some o raio e a alça, e entra a área segura de cima. Os botões do `.ov-folha-rodape` têm 48px e a mesma largura.
- **Movimento reduzido** (`janelas.css` e `casca.css`): as entradas não sobem nem escalam, só aparecem; a barra de tempo continua, porque diz quanto falta.

### Telas

Desde a v3.7.0 (D1 da F5). O CSS que ficava só no `onevessel.css` (e que a Bordo e o Paradas não importam por causa da base) mora no `telas.css`, com os mesmos valores, e o que faltava nasceu lá. As regras de uso estão em `componentes.md`, no `onevessel-docs`.

```html
<!-- Precisa de você: até 5 itens (regra do app); sem item, o vazio -->
<section class="ov-cartao ov-pendencias" aria-labelledby="pv">
  <div class="ov-pendencias-cab">
    <h2 class="ov-titulo-3" id="pv">Precisa de você</h2>
    <span class="ov-contador-destaque">3</span>
    <a class="ov-pendencias-ver-tudo" href="…">Ver tudo</a>
  </div>
  <ul class="ov-pendencias-lista">
    <li>
      <a class="ov-pendencia" href="…">
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

<!-- Indicadores: 4 colunas, 2 de 768 a 1023px, 1 no celular -->
<div class="ov-indicadores">
  <a class="ov-cartao ov-indicador" href="…">…</a>
</div>

<!-- Tabela: a célula do nome leva .nome; abaixo de 768px vira lista de linhas -->
<table class="ov-tabela">
  <thead><tr><th></th><th>Nome</th><th>Função</th><th>Estado</th></tr></thead>
  <tbody><tr><td><input class="ov-check" type="checkbox" aria-label="…"></td><td class="nome">João Pereira</td><td>Mecânico</td><td><span class="ov-estado" data-tom="sucesso">A bordo</span></td></tr></tbody>
</table>

<!-- Barra de ações em massa: data-flutuante dá a posição e a entrada -->
<div class="ov-acoes-massa" data-flutuante role="toolbar" aria-label="3 selecionadas">…</div>

<!-- Esqueleto: no formato da tela, sem spinner -->
<div aria-busy="true"><div aria-hidden="true">
  <div class="ov-esqueleto-linha"><span class="ov-esqueleto-texto"></span><span class="ov-esqueleto-texto"></span></div>
  <span class="ov-esqueleto" style="height: 120px"></span>
</div></div>
```

- **Lista do celular**: abaixo de 768px, **a `.ov-tabela` que tem uma `td.nome`** vira lista de linhas de 64px ou mais, com o nome em cima em 16px e as outras células numa linha de `legenda`, separadas por "·", e divisor `ov-borda`. O cabeçalho sai da tela e continua para o leitor de tela; a célula com `.ov-check` fica à esquerda. O app não troca de classe. Tabela sem `td.nome` (as da plataforma até a v3.6) continua como estava, rolando de lado, e navegador sem `:has()` também.
- **Miolo do item** (v3.8.0): o `.ov-pendencia-estado` vai ao lado do `.ov-estado`, numa coluna de 88px (as palavras alinham); título (`.ov-pendencia-titulo`, 600, com elipse) e contexto (`.ov-pendencia-contexto`, 12px/16px) em duas linhas; o identificador (`.ov-pendencia-id`, mono 12px/16px) antes do título; a seta (`.ov-pendencia-seta`) no fim. Identificador, contexto e seta em `ov-texto-terciario`. **Item sem link** é `div.ov-pendencia`, sem a seta e sem CSS próprio: o realce e o anel de foco são só do `a`. O título da caixa é do app.
- **Indicadores**: a grade é a `.ov-indicadores`, em `div` ou `ul`; o máximo de 4 é do app. Em `ul`, desde a v3.8.0 o `li` é flex e o cartão ocupa a altura dele: os cartões de uma linha ficam da mesma altura nas duas formas. A grade continua 4/2/1 (1 coluna até 767px).
- **Barra de ações em massa**: `data-flutuante` põe a `.ov-acoes-massa` fixa, centrada, 24px acima do rodapé e da área segura (no celular, acima da `.ov-barra-inferior`), em `--ov-z-flutuante` e `--ov-fundo-barra` sem desfoque, entrando de 12px em 180ms. Sem o atributo, a caixa é a da v3.6. Com ela na tela, a `.ov-toasts` leva `data-com-barra`. Esc e ✕ limpam a seleção no app.
- **Esqueleto**: `.ov-esqueleto` é o bloco (o app dá a altura; 48px sem ela), `.ov-esqueleto-texto` uma linha de texto (o app dá a largura) e `.ov-esqueleto-linha` uma linha de tabela (44px; 64px no celular). Também serve uma `<tr>` da `.ov-tabela` com um `.ov-esqueleto-texto` por célula. Pulsa só na opacidade.
- **Movimento reduzido** (`telas.css`): a barra de massa só aparece, já no lugar (`ovFade`, da casca), e o esqueleto não pulsa.
- **Teclado da tabela** (↑↓, Enter, X): o núcleo é o `js/teclas-da-tabela.js` desde a v3.8.0 (ver `js/`); quem diz onde está o foco dentro da linha é a tabela, no app.

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

```js
import { abrir, digitar, teclar, anuncio } from 'onevessel-ui/js/paleta-nucleo.js'
import { FOCAVEIS, focoQueGira } from 'onevessel-ui/js/foco-preso.js'
import { filaVazia, acrescentar, pausar, retomar, vencer, toastDoCtrlZ } from 'onevessel-ui/js/toast-nucleo.js'
import { acaoDaTecla, ondeEstaOFoco, vizinho } from 'onevessel-ui/js/teclas-do-painel.js'
import { abrirCamada, camadasAbertas } from 'onevessel-ui/js/camada.js'
import { criarRegistroDeAlteracoes, DESCARTAR } from 'onevessel-ui/js/alteracoes-nucleo.js'
import { acaoDaTeclaNaLinha, linhaDeDestino, linhaDoTab } from 'onevessel-ui/js/teclas-da-tabela.js'
```

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

## Ícones de PWA

Copie a pasta do app para dentro do seu `public/` e use o manifesto correspondente:

```
public/icones/            ← icons/materiais/*
public/manifest.webmanifest ← manifestos/materiais.webmanifest
```

Os caminhos dentro do manifesto já apontam para o escopo do app (`/materiais/`). Ajuste se o endereço do app for outro.

## Mudar a design system

1. Altere `tokens/tokens.json`, `css/casca.css`, `css/janelas.css`, `css/telas.css`, `css/onevessel.css` ou `css/impressao.css`. Classe de estrutura vai na casca, camada sobre a tela (Diálogo, Toast, Painel, folha) vai nas janelas, o que vai dentro da tela (tabela, indicadores, pendências, visões) vai nas telas; nenhum seletor fica em dois arquivos.
2. `npm run build` (regenera `css/tokens.css`).
3. `npm run conferir` e `npm run testar`.
4. Abra `exemplo/index.html` e confira nos dois temas, com a janela larga, entre 768 e 1023px e abaixo de 768px.
5. `npm run icones` só quando mudar cor da marca ou glifo (precisa do Playwright). `npm run icones -- paradas bordo` gera só essas pastas.
6. Suba uma tag nova (`v3.8.1`) e avise os apps.

Decisão de design não nasce aqui: ela vem da conversa da design system, e este repositório só a publica.

## Regras que não mudam

- Nada de valor solto no código do app: cor, espaçamento e raio saem sempre de uma variável.
- Nada de `confirm()` nem `alert()`: use as classes `ov-dialogo` e `ov-toast` (em `janelas.css`).
- Este repositório é público e guarda só estilo. As diretrizes de uso, de permissão e de documento ficam no repositório privado `onevessel-docs`.

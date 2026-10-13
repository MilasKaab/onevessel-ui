# onevessel-ui

Identidade compartilhada dos apps OneVessel: **Materiais**, **Paradas** e **Bordo**, mais a plataforma.

Este repositório é a única fonte das cores, tipografia, espaçamentos, CSS de componentes, fontes e ícones de PWA. Os apps instalam por versão; nenhum app copia valores para dentro de si.

## O que tem aqui

| Pasta | O que é |
| --- | --- |
| `tokens/tokens.json` | Fonte de tudo: cores nos dois temas, tipografia, espaçamentos, raios, sombras, tamanhos e camadas |
| `css/tokens.css` | Gerado do arquivo acima. Variáveis CSS (`--ov-*`), tema escuro na raiz e claro em `[data-theme="claro"]` |
| `css/casca.css` | Só a estrutura das telas: barra lateral (240px; 56px recolhida abaixo de 1024px), barra superior, cabeçalho e barra inferior do celular (abaixo de 768px), seletor de embarcação, conta, sincronização, menu, paleta, folha móvel do "Mais", etiqueta, faixa e estados de tela. Importável sozinha: sem `body`, sem base de 14px, sem impressão |
| `css/onevessel.css` | A base de 14px e as classes dos componentes (`ov-btn`, `ov-campo`, `ov-tabela`, `ov-dialogo`, `ov-toast`, timbre de relatório…). Começa importando `casca.css` |
| `css/impressao.css` | O `@media print` e o `@page` dos relatórios internos. Só a página de impressão importa (F7) |
| `css/fontes.css` | IBM Plex Sans e Mono servidas pelo próprio app, sem Google Fonts. Só para o que é impresso: a interface usa a fonte do sistema |
| `fonts/` | Os `.woff2` do subconjunto latino (400, 500, 600) |
| `tailwind/preset.js` | Preset do Tailwind 3 que aponta para as mesmas variáveis |
| `icons/` | Ícones de PWA de cada app (192, 512, maskable, apple-touch-icon) e o SVG de origem |
| `manifestos/` | Modelos de `.webmanifest` dos quatro instaláveis (plataforma, Materiais, Paradas, Bordo) |
| `js/` | O comportamento que os apps repetiam linha a linha (D1): o núcleo da paleta de comandos e o foco preso dos diálogos. ESM puro, sem dependência, com `.d.ts` |
| `exemplo/` | Página de conferência com tudo aplicado nos dois temas, inclusive a casca |
| `scripts/conferir.mjs` | `npm run conferir`: confere a divisão entre `casca.css`, `onevessel.css` e `impressao.css`, que nenhum nome antigo de app sobrou e que `js/` só importa caminho relativo, tem um `.d.ts` por `.js` e está todo em `exports` |
| `test/` | `npm run testar`: os testes de `js/`, sem DOM. Roda `node --test "test/*.test.mjs"`, com o glob do próprio Node: no Node 24, `node --test test/` não abre pasta |

## Cor e tipografia, em uma linha

Duas identidades, e nunca se misturam:

- **Interface dos apps** — paleta petrol/ciano da Bram Power sobre o navy `#040a12`: `--ov-acao` é o petrol `#0e7490`, igual nos dois temas; `--ov-acao-hover` e `--ov-foco` são o ciano `#22d3ee` no escuro e o petrol escurecido `#0a5f77` no claro. Tipografia é a **fonte do sistema** (`--font-sans`): a bordo a conexão cai e o app tem que abrir sem esperar download nenhum.
- **Tudo que é impresso** — timbre da BRAM: `--rel-*` (marinho `#0d4b88` e laranja `#ec6a3b`) e **IBM Plex** (`--font-rel-sans`, `--font-rel-mono`), servida em woff2 pelo próprio app. É o que as classes `.rel-*` usam.

Fora disso ficam os **formulários oficiais** (NORMAM-08/DPC, ANVISA): reproduzem o anexo do órgão e não recebem nada daqui.

## Instalar num app

```bash
npm i "onevessel-ui@github:MilasKaab/onevessel-ui#v3.4.0"
```

Use sempre uma **tag de versão**. Quando a design system mudar, sai uma tag nova e cada app atualiza quando quiser — nunca no meio de outra entrega.

### Qual CSS importar

| Arquivo | Quem importa |
| --- | --- |
| `tokens.css` | Todo app, sempre primeiro |
| `casca.css` | App que mantém a própria base (Bordo, Paradas): só as classes de estrutura, sem mexer no `body` nem na impressão |
| `onevessel.css` | App que adota a base de 14px e todos os componentes (já traz `casca.css`; não importe os dois) |
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

```js
import { abrir, digitar, teclar, anuncio } from 'onevessel-ui/js/paleta-nucleo.js'
import { FOCAVEIS, focoQueGira } from 'onevessel-ui/js/foco-preso.js'
```

`js/package.json` só tem `{"type": "module"}`: o pacote é CommonJS (o preset do Tailwind usa `module.exports`), e assim o Node carrega `js/` como ESM sem aviso.

O app fornece as fontes (os grupos, já montados por função) e desenha o componente; o núcleo só filtra, ordena e anda pela seleção. Os tipos (`GrupoDaPaleta`, `ItemDaPaleta`, `EstadoDaPaleta`…) saem do mesmo caminho.

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

1. Altere `tokens/tokens.json`, `css/casca.css`, `css/onevessel.css` ou `css/impressao.css`. Classe de estrutura vai na casca; nenhum seletor fica nos dois arquivos.
2. `npm run build` (regenera `css/tokens.css`).
3. `npm run conferir` e, se mexeu em `js/`, `npm run testar`.
4. Abra `exemplo/index.html` e confira nos dois temas, com a janela larga, entre 768 e 1023px e abaixo de 768px.
5. `npm run icones` só quando mudar cor da marca ou glifo (precisa do Playwright). `npm run icones -- paradas bordo` gera só essas pastas.
6. Suba uma tag nova (`v3.4.1`) e avise os apps.

Decisão de design não nasce aqui: ela vem da conversa da design system, e este repositório só a publica.

## Regras que não mudam

- Nada de valor solto no código do app: cor, espaçamento e raio saem sempre de uma variável.
- Nada de `confirm()` nem `alert()`: use as classes `ov-dialogo` e `ov-toast`.
- Este repositório é público e guarda só estilo. As diretrizes de uso, de permissão e de documento ficam no repositório privado `onevessel-docs`.

# onevessel-ui

Identidade compartilhada dos apps OneVessel: **Controle de Materiais**, **Status TT** e **Gestão de Bordo**, mais a plataforma.

Este repositório é a única fonte das cores, tipografia, espaçamentos, CSS de componentes, fontes e ícones de PWA. Os apps instalam por versão; nenhum app copia valores para dentro de si.

## O que tem aqui

| Pasta | O que é |
| --- | --- |
| `tokens/tokens.json` | Fonte de tudo: cores nos dois temas, tipografia, espaçamentos, raios, sombras, tamanhos e camadas |
| `css/tokens.css` | Gerado do arquivo acima. Variáveis CSS (`--ov-*`), tema escuro na raiz e claro em `[data-theme="claro"]` |
| `css/onevessel.css` | Classes dos componentes (`ov-btn`, `ov-campo`, `ov-tabela`, `ov-dialogo`, `ov-toast`, timbre de relatório…) |
| `css/fontes.css` | IBM Plex Sans e Mono servidas pelo próprio app, sem Google Fonts |
| `fonts/` | Os `.woff2` do subconjunto latino (400, 500, 600) |
| `tailwind/preset.js` | Preset do Tailwind 3 que aponta para as mesmas variáveis |
| `icons/` | Ícones de PWA de cada app (192, 512, maskable, apple-touch-icon) e o SVG de origem |
| `manifestos/` | Modelos de `.webmanifest` dos quatro instaláveis |
| `exemplo/` | Página de conferência com tudo aplicado nos dois temas |

## Instalar num app

```bash
npm i "onevessel-ui@github:<org>/onevessel-ui#v2.0.0"
```

Use sempre uma **tag de versão**. Quando a design system mudar, sai uma tag nova e cada app atualiza quando quiser — nunca no meio de outra entrega.

### App com CSS próprio (Controle de Materiais)

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

### App com Tailwind 3 (Status TT)

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
import 'onevessel-ui/css/onevessel.css'
import './index.css' // onde ficam as diretivas do Tailwind
```

Depois disso, `bg-fundo`, `text-texto`, `bg-acao`, `rounded-lg`, `shadow-1`, `h-campo` e `text-titulo-1` já saem com os valores da OneVessel.

### App com Tailwind 4 (Gestão de Bordo)

O Tailwind 4 não usa preset. Importe os tokens e repasse as variáveis no `@theme`:

```css
@import 'tailwindcss';
@import 'onevessel-ui/css/fontes.css';
@import 'onevessel-ui/css/tokens.css';
@import 'onevessel-ui/css/onevessel.css';

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
  /* sem var(--font-sans) aqui: o nome seria igual ao da variável e viraria um laço */
  --font-sans: 'IBM Plex Sans', 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, Consolas, monospace;
}
```

Os utilitários próprios do app (`bg-painel`, `text-texto`) continuam funcionando enquanto você troca um por um.

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

1. Altere `tokens/tokens.json` ou `css/onevessel.css`.
2. `npm run build` (regenera `css/tokens.css`).
3. Abra `exemplo/index.html` e confira nos dois temas.
4. `npm run icones` só quando mudar cor da marca ou glifo (precisa do Playwright).
5. Suba uma tag nova (`v2.1.0`) e avise os apps.

Decisão de design não nasce aqui: ela vem da conversa da design system, e este repositório só a publica.

## Regras que não mudam

- Nada de valor solto no código do app: cor, espaçamento e raio saem sempre de uma variável.
- Nada de `confirm()` nem `alert()`: use as classes `ov-dialogo` e `ov-toast`.
- Este repositório é público e guarda só estilo. As diretrizes de uso, de permissão e de documento ficam no repositório privado `onevessel-docs`.

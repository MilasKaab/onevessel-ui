// Preset do Tailwind da OneVessel.
// Mapeia as classes do Tailwind para as variáveis de css/tokens.css,
// para que o tema escuro e o claro funcionem sem `dark:` espalhado no código.
//
// Desde a v3.3.0 o preset não declara `spacing` nem `darkMode`:
// - a escala padrão do Tailwind (em rem) já coincide com --ov-esp-* com raiz
//   de 16px, e cresce junto quando a pessoa aumenta a fonte do navegador;
// - os tokens trocam de tema por variável ([data-theme]); se o app usa `dark:`,
//   ele declara o próprio `darkMode`.
//
// tailwind.config.js do app:
//   module.exports = {
//     presets: [require('onevessel-ui/tailwind/preset.js')],
//     content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
//   }
//
// Vale para o Tailwind 3. No Tailwind 4, use @import 'onevessel-ui/css/tokens.css'
// e @theme com as mesmas variáveis (veja o README).

const fs = require('node:fs')
const path = require('node:path')

const tokens = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'tokens', 'tokens.json'), 'utf8')
)

const va = (nome) => `var(--${nome})`

const deTokens = (lista) =>
  Object.fromEntries(lista.map((t) => [t.name.replace(/^ov-/, ''), va(t.name)]))

// esp-1 → 1, raio-md → md
const semPrefixo = (lista, prefixo) =>
  Object.fromEntries(
    lista
      .filter((t) => t.name.startsWith(prefixo))
      .map((t) => [t.name.slice(prefixo.length), va(t.name)])
  )

const fontSize = {}
for (const grupo of tokens.type.groups) {
  for (const e of grupo.styles) {
    fontSize[e.name] = [
      e.fontSize,
      { lineHeight: e.lineHeight, fontWeight: String(e.fontWeight), letterSpacing: e.letterSpacing },
    ]
  }
}

module.exports = {
  theme: {
    extend: {
      colors: deTokens(tokens.color.tokens),
      borderRadius: semPrefixo(tokens.radius.tokens, 'ov-raio-'),
      boxShadow: semPrefixo(tokens.shadow.tokens, 'ov-sombra-'),
      zIndex: semPrefixo(tokens.zIndex.tokens, 'ov-z-'),
      // Sai do tokens.json para não divergir dele: interface na fonte do
      // sistema, `font-rel-sans`/`font-rel-mono` (IBM Plex) no que é impresso.
      fontFamily: Object.fromEntries(
        Object.entries(tokens.type.families).map(([nome, pilha]) => [
          nome,
          pilha.split(',').map((f) => f.trim().replace(/^["']|["']$/g, '')),
        ])
      ),
      fontSize,
      height: semPrefixo(tokens.tamanho.tokens, 'ov-altura-'),
      minHeight: semPrefixo(tokens.tamanho.tokens, 'ov-altura-'),
      width: {
        lateral: va('ov-barra-lateral'),
        'lateral-recolhida': va('ov-barra-lateral-recolhida'),
        painel: va('ov-painel-lateral'),
        'painel-abas': va('ov-painel-lateral-abas'),
        dialogo: va('ov-dialogo'),
        'dialogo-formulario': va('ov-dialogo-formulario'),
      },
      maxWidth: { conteudo: va('ov-conteudo-max') },
    },
  },
}

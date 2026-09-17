#!/usr/bin/env node
// Gera css/tokens.css a partir de tokens/tokens.json.
// Sem dependências: node scripts/gerar-tokens.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const t = JSON.parse(readFileSync(resolve(raiz, 'tokens/tokens.json'), 'utf8'))

const TEMA_PADRAO = 'escuro'

// "{ov-acao}" vira "var(--ov-acao)"; o resto passa direto.
const valor = (v) =>
  typeof v === 'string' ? v.replace(/\{([a-z0-9-]+)\}/gi, 'var(--$1)') : v

const linha = (nome, v) => `  --${nome}: ${valor(v)};`

// Valor do token no tema pedido. Token de valor único (marca, relatório)
// entra só no tema padrão, para não repetir.
function porTema(token, tema) {
  const v = token.value
  if (typeof v === 'string') return tema === TEMA_PADRAO ? v : null
  return v[tema] ?? null
}

function blocoTema(tema, seletor) {
  const linhas = []
  for (const c of t.color.tokens) {
    const v = porTema(c, tema)
    if (v !== null) linhas.push(linha(c.name, v))
  }
  for (const s of t.shadow.tokens) {
    const v = porTema(s, tema)
    if (v !== null) linhas.push(linha(s.name, v))
  }
  return `${seletor} {\n${linhas.join('\n')}\n}`
}

const fixos = []
for (const grupo of ['spacing', 'radius', 'tamanho', 'zIndex']) {
  for (const tk of t[grupo].tokens) fixos.push(linha(tk.name, tk.value))
}
for (const [nome, familia] of Object.entries(t.type.families)) {
  fixos.push(linha(`font-${nome}`, familia))
}

// Cada estilo de texto vira uma variável de atalho (--ov-fonte-titulo-1),
// usável em `font: var(--ov-fonte-titulo-1)`. As classes .ov-titulo-1 etc.
// ficam em css/onevessel.css; aqui só saem variáveis.
for (const grupo of t.type.groups) {
  for (const e of grupo.styles) {
    fixos.push(
      linha(
        `ov-fonte-${e.name}`,
        `${e.fontWeight} ${e.fontSize}/${e.lineHeight} var(--font-${grupo.family})`
      )
    )
  }
}

const css = `/* Gerado por scripts/gerar-tokens.mjs a partir de tokens/tokens.json.
   OneVessel ${t.version ?? ''} — não edite à mão. */

:root,
[data-theme="escuro"] {
${t.color.tokens
  .map((c) => porTema(c, 'escuro') !== null && linha(c.name, porTema(c, 'escuro')))
  .filter(Boolean)
  .join('\n')}
${t.shadow.tokens
  .map((s) => porTema(s, 'escuro') !== null && linha(s.name, porTema(s, 'escuro')))
  .filter(Boolean)
  .join('\n')}
}

${blocoTema('claro', '[data-theme="claro"]')}

:root {
${fixos.join('\n')}
}
`

writeFileSync(resolve(raiz, 'css/tokens.css'), css)
console.log('css/tokens.css gerado:', css.length, 'bytes')

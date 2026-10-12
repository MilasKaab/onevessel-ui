#!/usr/bin/env node
// Confere as regras de divisão do CSS e os nomes antigos. Sem dependências:
//   npm run conferir
//
// Falha se:
// - casca.css tiver regra de html, body, tamanho de fonte fora de classe ou
//   @media print / @page (a casca é importável sozinha);
// - algum seletor estiver em casca.css e em onevessel.css ao mesmo tempo;
// - onevessel.css ainda tiver @media print ou @page (moram em impressao.css);
// - sobrar o nome antigo do Paradas em qualquer arquivo ou pasta do pacote.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ler = (p) => readFileSync(resolve(raiz, p), 'utf8')
const erros = []

// Regras de um CSS: { seletores, corpo }, entrando em @media e afins.
function regras(css) {
  const texto = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const saida = []
  let i = 0
  const percorrer = (fim) => {
    while (i < fim) {
      const abre = texto.indexOf('{', i)
      const fecha = texto.indexOf('}', i)
      if (abre === -1 || (fecha !== -1 && fecha < abre)) { i = fecha === -1 ? fim : fecha + 1; return }
      const cabeca = texto.slice(i, abre).replace(/^[\s\S]*;/, '').trim()
      i = abre + 1
      if (cabeca.startsWith('@media') || cabeca.startsWith('@supports')) {
        percorrer(fim)
      } else if (cabeca.startsWith('@')) {
        // @keyframes, @page: pula o bloco inteiro.
        let nivel = 1
        while (nivel && i < fim) { if (texto[i] === '{') nivel++; else if (texto[i] === '}') nivel--; i++ }
        saida.push({ seletores: [cabeca], corpo: '' })
      } else {
        const f = texto.indexOf('}', i)
        saida.push({ seletores: separar(cabeca), corpo: texto.slice(i, f) })
        i = f + 1
      }
    }
  }
  percorrer(texto.length)
  return saida
}

// Divide "a, b:is(c, d)" por vírgulas fora de parênteses.
function separar(lista) {
  const partes = []
  let nivel = 0, atual = ''
  for (const c of lista) {
    if (c === '(') nivel++
    if (c === ')') nivel--
    if (c === ',' && nivel === 0) { partes.push(atual); atual = '' } else atual += c
  }
  partes.push(atual)
  return partes.map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

const semComentario = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const casca = semComentario(ler('css/casca.css'))
const onevessel = semComentario(ler('css/onevessel.css'))
const regrasCasca = regras(casca)
const regrasOnevessel = regras(onevessel)

// 1. casca.css sem base nem impressão.
if (/@media\s+print/.test(casca)) erros.push('casca.css tem @media print')
if (/@page/.test(casca)) erros.push('casca.css tem @page')
for (const { seletores, corpo } of regrasCasca) {
  for (const s of seletores) {
    if (s.startsWith('@')) continue
    if (/(^|[\s>+~(,])(html|body)\b/.test(s) || /^:root\b/.test(s)) {
      erros.push(`casca.css tem regra de base: ${s}`)
    }
    if (/(^|;|\s)font(-size)?\s*:/.test(corpo) && !s.includes('.')) {
      erros.push(`casca.css define fonte fora de classe: ${s}`)
    }
  }
}

// 2. Nenhum seletor nos dois arquivos.
const daCasca = new Set(regrasCasca.flatMap((r) => r.seletores))
for (const s of new Set(regrasOnevessel.flatMap((r) => r.seletores))) {
  if (daCasca.has(s)) erros.push(`seletor em casca.css e onevessel.css: ${s}`)
}

// 3. onevessel.css sem impressão, e importando a casca.
if (/@media\s+print/.test(onevessel)) erros.push('onevessel.css ainda tem @media print')
if (/@page/.test(onevessel)) erros.push('onevessel.css ainda tem @page')
if (!/@import\s+url\(["']\.\/casca\.css["']\)/.test(onevessel)) erros.push('onevessel.css não importa ./casca.css')
if (/impressao\.css/.test(onevessel)) erros.push('onevessel.css importa impressao.css')

// 4. Nome antigo do Paradas em arquivo ou pasta. A expressão é montada aos
//    pedaços para este arquivo não acusar a si mesmo.
const antigo = new RegExp(['status', 'tt'].join('[-_ ]?'), 'i')
const ignorar = new Set(['.git', 'node_modules'])
const binario = new Set(['.png', '.woff2', '.ico'])
function varrer(dir) {
  for (const nome of readdirSync(dir)) {
    if (ignorar.has(nome)) continue
    const caminho = resolve(dir, nome)
    const rel = relative(raiz, caminho)
    if (antigo.test(nome)) erros.push(`nome antigo no caminho: ${rel}`)
    if (statSync(caminho).isDirectory()) { varrer(caminho); continue }
    if (binario.has(extname(nome))) continue
    readFileSync(caminho, 'utf8').split('\n').forEach((linha, n) => {
      if (antigo.test(linha)) erros.push(`nome antigo em ${rel}:${n + 1}`)
    })
  }
}
varrer(raiz)

if (erros.length) {
  console.error(`conferir: ${erros.length} problema(s)\n- ` + erros.join('\n- '))
  process.exit(1)
}
console.log(`conferir: ok (${daCasca.size} seletores em casca.css, nenhum repetido em onevessel.css)`)

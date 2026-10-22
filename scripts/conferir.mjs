#!/usr/bin/env node
// Confere as regras de divisão do CSS e os nomes antigos. Sem dependências:
//   npm run conferir
//
// Falha se:
// - casca.css, janelas.css, telas.css, controles.css ou relatorio.css tiver
//   regra de html, body, :root, *, a ou button soltos, tamanho de fonte fora
//   de classe ou @media print / @page (os cinco são importáveis sozinhos), ou casca.css,
//   janelas.css ou telas.css não tiver prefers-reduced-motion;
// - relatorio.css tiver regra que não seja .rel-*, ou não importar previa.css;
// - previa.css tiver regra que não seja a barra (.rel-barra, .rel-barra-titulo
//   e .rel-area), @page, base, ou impressão que não seja esconder a barra e
//   tirar o fundo da área;
// - impressao.css tiver @page sem nome, visibility, position: absolute ou
//   regra que não seja .rel-*;
// - algum seletor estiver em dois de casca.css, janelas.css, telas.css,
//   controles.css, relatorio.css, previa.css e onevessel.css;
// - onevessel.css ainda tiver @media print, @page ou .rel-* (moram em
//   impressao.css e relatorio.css), ou não importar casca.css, janelas.css,
//   telas.css, relatorio.css e controles.css;
// - algum CSS de css/ faltar em exports;
// - sobrar o nome antigo do Paradas em qualquer arquivo ou pasta do pacote;
// - algum arquivo de js/ importar pacote (só caminho relativo), algum .js de
//   js/ não tiver o seu .d.ts ou algum arquivo de js/ faltar em exports;
// - algum CSS de css/ tiver outline: none (ou 0), sem exceção (v3.12.0; a
//   do .ov-campo valeu de U17-13 até a v3.12.0): o foco perde o anel do livro.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { problemasDeBase, regras, semComentario, seletores } from './css-regras.mjs'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ler = (p) => readFileSync(resolve(raiz, p), 'utf8')
const erros = []

const semComentarioJs = (js) => semComentario(js).replace(/^\s*\/\/.*$/gm, '')
const casca = ler('css/casca.css')
const janelas = ler('css/janelas.css')
const telas = ler('css/telas.css')
const controles = ler('css/controles.css')
const relatorio = ler('css/relatorio.css')
const previa = ler('css/previa.css')
const impressao = semComentario(ler('css/impressao.css'))
const onevessel = semComentario(ler('css/onevessel.css'))

// 1. casca.css, janelas.css, telas.css, controles.css e relatorio.css sem
//    base nem impressão; relatorio.css só com .rel-*.
erros.push(...problemasDeBase('casca.css', casca), ...problemasDeBase('janelas.css', janelas), ...problemasDeBase('telas.css', telas), ...problemasDeBase('controles.css', controles), ...problemasDeBase('relatorio.css', relatorio))
for (const s of seletores(relatorio)) if (!s.startsWith('.rel-')) erros.push(`relatorio.css tem regra fora de .rel-*: ${s}`)
if (!/@import\s+url\(["']\.\/previa\.css["']\)/.test(semComentario(relatorio))) erros.push('relatorio.css não importa ./previa.css')

// 1a. previa.css: só a barra e a área, sem @page nem base; no papel, só
//     esconde a barra e tira o fundo da área. Os oficiais o importam.
const DA_PREVIA = ['.rel-barra', '.rel-barra-titulo', '.rel-area']
erros.push(...problemasDeBase('previa.css', previa).filter((p) => p !== 'previa.css tem @media print'))
for (const { seletores: ss, corpo, media } of regras(previa)) {
  for (const s of ss) {
    if (!DA_PREVIA.includes(s)) erros.push(`previa.css tem regra fora da barra: ${media} ${s}`)
    if (/print/.test(media) && !/^\s*(display:\s*none|padding:\s*0;\s*background:\s*none)\s*;?\s*$/.test(corpo)) erros.push(`previa.css muda o papel além de esconder a barra: ${s}`)
  }
}

// 1b. impressao.css sem seletor global: só .rel-* e @page com nome.
for (const s of seletores(impressao)) {
  if (s.startsWith('@page')) { if (!/^@page\s+[\w-]+$/.test(s)) erros.push(`impressao.css tem @page sem nome: ${s}`); continue }
  if (!s.startsWith('.rel-')) erros.push(`impressao.css tem regra fora de .rel-*: ${s}`)
}
if (/@page\s*\{/.test(impressao)) erros.push('impressao.css tem @page sem nome')
if (/visibility\s*:/.test(impressao)) erros.push('impressao.css tem visibility')
if (/position\s*:\s*absolute/.test(impressao)) erros.push('impressao.css tem position: absolute')

// 2. Nenhum seletor em dois arquivos.
const arquivos = { 'casca.css': seletores(casca), 'janelas.css': seletores(janelas), 'telas.css': seletores(telas), 'controles.css': seletores(controles), 'relatorio.css': seletores(relatorio), 'previa.css': seletores(previa), 'onevessel.css': seletores(onevessel) }
const nomes = Object.keys(arquivos)
for (const [n, a] of nomes.entries()) {
  for (const b of nomes.slice(n + 1)) {
    for (const s of arquivos[a]) if (arquivos[b].has(s)) erros.push(`seletor em ${a} e ${b}: ${s}`)
  }
}

// 3. onevessel.css sem impressão nem .rel-*, e importando a casca, as janelas,
//    as telas, o relatório e os controles.
if (/@media\s+print/.test(onevessel)) erros.push('onevessel.css ainda tem @media print')
if (/@page/.test(onevessel)) erros.push('onevessel.css ainda tem @page')
if (!/@import\s+url\(["']\.\/casca\.css["']\)/.test(onevessel)) erros.push('onevessel.css não importa ./casca.css')
if (!/@import\s+url\(["']\.\/janelas\.css["']\)/.test(onevessel)) erros.push('onevessel.css não importa ./janelas.css')
if (!/@import\s+url\(["']\.\/telas\.css["']\)/.test(onevessel)) erros.push('onevessel.css não importa ./telas.css')
if (!/@import\s+url\(["']\.\/relatorio\.css["']\)/.test(onevessel)) erros.push('onevessel.css não importa ./relatorio.css')
if (!/@import\s+url\(["']\.\/controles\.css["']\)/.test(onevessel)) erros.push('onevessel.css não importa ./controles.css')
for (const s of arquivos['onevessel.css']) if (s.startsWith('.rel-')) erros.push(`onevessel.css ainda tem ${s} (mora em relatorio.css)`)
if (/impressao\.css/.test(onevessel)) erros.push('onevessel.css importa impressao.css')
for (const nome of ['casca.css', 'janelas.css', 'telas.css']) {
  if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(ler(`css/${nome}`))) erros.push(`${nome} sem prefers-reduced-motion`)
}

// 3b. Nenhum outline: none, em CSS nenhum. O .ov-campo, a última exceção,
//     passou ao anel do livro na v3.12.0 (BV-4).
for (const nome of readdirSync(resolve(raiz, 'css')).filter((n) => n.endsWith('.css'))) {
  for (const { seletores: ss, corpo, media } of regras(ler(`css/${nome}`))) {
    if (!/(^|;|\s)outline\s*:\s*(none|0)\s*(;|$)/.test(corpo)) continue
    for (const s of ss) erros.push(`${nome} tem outline: none em ${media ? media + ' ' : ''}${s}`)
  }
}

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

// 5. js/: só import relativo, cada .js com o seu .d.ts e tudo em exports. O
//    js/package.json só marca a pasta como ESM; não é módulo.
const pacote = JSON.parse(ler('package.json'))
const deJs = readdirSync(resolve(raiz, 'js')).filter((n) => n !== 'package.json')
const deImport = /(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g
for (const nome of deJs) {
  if (!/\.(d\.ts|js)$/.test(nome)) { erros.push(`arquivo fora do padrão em js/: ${nome}`); continue }
  for (const [, alvo] of semComentarioJs(ler(`js/${nome}`)).matchAll(deImport)) {
    if (!alvo.startsWith('./') && !alvo.startsWith('../')) erros.push(`js/${nome} importa pacote: ${alvo}`)
  }
  if (nome.endsWith('.d.ts')) continue
  const tipos = nome.replace(/\.js$/, '.d.ts')
  if (!deJs.includes(tipos)) erros.push(`js/${nome} sem js/${tipos}`)
  const entrada = pacote.exports?.[`./js/${nome}`]
  if (entrada?.default !== `./js/${nome}`) erros.push(`js/${nome} fora de exports (default)`)
  if (entrada?.types !== `./js/${tipos}`) erros.push(`js/${tipos} fora de exports (types)`)
}
for (const chave of Object.keys(pacote.exports ?? {})) {
  if (chave.startsWith('./js/') && !deJs.includes(chave.slice(5))) erros.push(`exports aponta para arquivo que não existe: ${chave}`)
}
if (!pacote.files?.includes('js')) erros.push('"js" fora de files no package.json')
for (const nome of readdirSync(resolve(raiz, 'css')).filter((n) => n.endsWith('.css'))) {
  if (pacote.exports?.[`./css/${nome}`] !== `./css/${nome}`) erros.push(`css/${nome} fora de exports`)
}

if (erros.length) {
  console.error(`conferir: ${erros.length} problema(s)\n- ` + erros.join('\n- '))
  process.exit(1)
}
console.log(`conferir: ok (${arquivos['casca.css'].size} seletores em casca.css, ${arquivos['janelas.css'].size} em janelas.css, ${arquivos['telas.css'].size} em telas.css, ${arquivos['controles.css'].size} em controles.css e ${arquivos['relatorio.css'].size} em relatorio.css, nenhum repetido; ${deJs.length} arquivos em js/)`)

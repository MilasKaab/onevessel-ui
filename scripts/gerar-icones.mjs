#!/usr/bin/env node
// Gera os ícones de PWA de cada app a partir dos glifos abaixo.
// Saída: icons/<app>/icone-192.png, icone-512.png, mascaravel-512.png,
//        apple-touch-icon-180.png e icone.svg.
//
//   npm i -D playwright && npx playwright install chromium
//   node scripts/gerar-icones.mjs
//
// Regra (docs/README.md): quadrado ov-marca-azul, glifo branco estilo Lucide
// e faixa ov-marca-laranja na base. O glifo diferencia o app; a cor, não.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const AZUL = '#0d4b88'
const LARANJA = '#ec6a3b'

// Glifos Lucide em viewBox 24×24, só traço.
const APPS = [
  { pasta: 'plataforma', nome: 'OneVessel', glifo: 'âncora',
    d: ['M12 22V8M5 12H2a10 10 0 0 0 20 0h-3'], circulos: [[12, 5, 3]] },
  { pasta: 'materiais', nome: 'Materiais', glifo: 'caixa',
    d: ['M21 16V8l-9-5-9 5v8l9 5 9-5Z', 'm3.3 7 8.7 5 8.7-5M12 22V12'] },
  { pasta: 'status-tt', nome: 'Status TT', glifo: 'pulso',
    d: ['M22 12h-4l-3 9L9 3l-3 9H2'] },
  { pasta: 'bordo', nome: 'Bordo', glifo: 'cama',
    d: ['M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9'] },
]

// lado: tamanho do PNG. escalaGlifo: 1 = padrão; 0.8 = versão maskable.
function svg(app, lado, escalaGlifo = 1) {
  const faixa = lado * 0.0625 // mesma proporção de .ov-icone-app (4px em 64)
  const tamGlifo = lado * 0.42 * escalaGlifo
  const esc = tamGlifo / 24
  const desloc = (lado - tamGlifo) / 2
  const formas =
    app.d.map((d) => `<path d="${d}"/>`).join('') +
    (app.circulos ?? []).map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">
  <rect width="${lado}" height="${lado}" fill="${AZUL}"/>
  <rect x="0" y="${lado - faixa}" width="${lado}" height="${faixa}" fill="${LARANJA}"/>
  <g transform="translate(${desloc} ${desloc - faixa / 2}) scale(${esc})" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${formas}</g>
</svg>
`
}

const navegador = await chromium.launch()
for (const app of APPS) {
  const pasta = resolve(raiz, 'icons', app.pasta)
  mkdirSync(pasta, { recursive: true })
  const saidas = [
    ['icone-192.png', 192, 1],
    ['icone-512.png', 512, 1],
    ['mascaravel-512.png', 512, 0.8],
    ['apple-touch-icon-180.png', 180, 1],
  ]
  writeFileSync(resolve(pasta, 'icone.svg'), svg(app, 512, 1))
  for (const [arquivo, lado, escala] of saidas) {
    const pagina = await navegador.newPage({ viewport: { width: lado, height: lado } })
    await pagina.setContent(
      `<!doctype html><html><body style="margin:0">${svg(app, lado, escala)}</body></html>`
    )
    await pagina.screenshot({ path: resolve(pasta, arquivo), omitBackground: false })
    await pagina.close()
  }
  console.log(`icons/${app.pasta}: ${app.nome} (${app.glifo})`)
}
await navegador.close()

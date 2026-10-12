#!/usr/bin/env node
// Gera os ícones de PWA de cada app a partir dos glifos abaixo.
// Saída: icons/<app>/icone-192.png, icone-512.png, mascaravel-512.png,
//        apple-touch-icon-180.png e icone.svg.
//
//   npm i -D playwright && npx playwright install chromium
//   node scripts/gerar-icones.mjs              (todos)
//   node scripts/gerar-icones.mjs paradas bordo (só essas pastas)
//
// Regra (livro da marca, Iconografia): quadrado ov-marca-azul, glifo branco
// estilo Lucide e faixa ov-marca-laranja na base. O glifo diferencia o app;
// a cor, não. Exceção única: as três luzes do semáforo do Paradas têm cor fixa.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const AZUL = '#0d4b88'
const LARANJA = '#ec6a3b'

// Glifos em viewBox 24×24, traço 2. `d` e `circulos` herdam o traço branco;
// `extras` é SVG cru, para o que tem cor própria.
const APPS = [
  { pasta: 'plataforma', nome: 'OneVessel', glifo: 'âncora',
    d: ['M12 22V8M5 12H2a10 10 0 0 0 20 0h-3'], circulos: [[12, 5, 3]] },
  { pasta: 'materiais', nome: 'Materiais', glifo: 'caixa',
    d: ['M21 16V8l-9-5-9 5v8l9 5 9-5Z', 'm3.3 7 8.7 5 8.7-5M12 22V12'] },
  // Semáforo: geometria exata do livro da marca. Cápsula branca de traço 2;
  // luzes de raio 2 com as cores do report. Folga de 1,4 entre tudo.
  { pasta: 'paradas', nome: 'Paradas', glifo: 'semáforo',
    d: [],
    extras:
      '<rect x="7.6" y="2.2" width="8.8" height="19.6" rx="3.4"/>' +
      '<circle cx="12" cy="6.6" r="2" fill="#E5484D" stroke="none"/>' +
      '<circle cx="12" cy="12" r="2" fill="#F2C744" stroke="none"/>' +
      '<circle cx="12" cy="17.4" r="2" fill="#3DBE72" stroke="none"/>' },
  // Lucide `ship` (lucide-react 0.383).
  { pasta: 'bordo', nome: 'Bordo', glifo: 'ship',
    d: [
      'M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      'M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76',
      'M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6',
      'M12 10v4',
      'M12 2v3',
    ] },
]

const pedidas = process.argv.slice(2)
const desconhecidas = pedidas.filter((p) => !APPS.some((a) => a.pasta === p))
if (desconhecidas.length) {
  console.error('Pasta desconhecida:', desconhecidas.join(', '))
  process.exit(1)
}
const alvo = pedidas.length ? APPS.filter((a) => pedidas.includes(a.pasta)) : APPS

// lado: tamanho do PNG. escalaGlifo: 1 = padrão; 0.8 = versão maskable.
function svg(app, lado, escalaGlifo = 1) {
  const faixa = lado * 0.0625 // mesma proporção de .ov-icone-app (4px em 64)
  const tamGlifo = lado * 0.42 * escalaGlifo
  const esc = tamGlifo / 24
  const desloc = (lado - tamGlifo) / 2
  const formas =
    app.d.map((d) => `<path d="${d}"/>`).join('') +
    (app.circulos ?? []).map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('') +
    (app.extras ?? '')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">
  <rect width="${lado}" height="${lado}" fill="${AZUL}"/>
  <rect x="0" y="${lado - faixa}" width="${lado}" height="${faixa}" fill="${LARANJA}"/>
  <g transform="translate(${desloc} ${desloc - faixa / 2}) scale(${esc})" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${formas}</g>
</svg>
`
}

const navegador = await chromium.launch()
for (const app of alvo) {
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

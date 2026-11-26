// v3.30.0 (livro da marca, 26/11): o título de seção da Gaveta e da Folha,
// .ov-titulo-secao, no janelas.css; a única caixa alta fora das siglas,
// escrita em caixa normal no HTML. Minor: a fixture da v3.29.0
// (`test/fixtures/janelas-v3.29.0.css`, da tag, fixa) fica igual regra a
// regra; nasce só a classe, e nada muda de valor nem de seletor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize } from 'node:path';

import { problemasDeBase, regras, semComentario } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');
const exemplo = ler('exemplo/index.html');

const ATUAL = ler('css/janelas.css');
const ANTES = ler('test/fixtures/janelas-v3.29.0.css');

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

const TS = '.ov-titulo-secao';

test('janelas.css, minor: toda regra da v3.29.0 igual; nasce só o .ov-titulo-secao, logo depois da Gaveta; as velhas na mesma ordem', () => {
  for (const r of regras(ANTES)) {
    for (const s of r.seletores) assert.deepEqual(declaracoesEm(ATUAL, r.media, s), declaracoesEm(ANTES, r.media, s), `${r.media}|${s}`);
  }
  const velhas = chaves(ANTES);
  const agora = chaves(ATUAL);
  assert.deepEqual(agora.filter((c) => !velhas.includes(c)), [`|${TS}`], 'o que nasce');
  assert.deepEqual(agora.filter((c) => velhas.includes(c)), velhas, 'a ordem das velhas');
  assert.equal(agora[agora.indexOf(`|${TS}`) - 1], '|@keyframes ovEntraDaDireita', 'ao lado da Gaveta');
});

test('.ov-titulo-secao: 11/16 peso 700 na fonte do sistema, .12em, uppercase, secundário, 8px embaixo pelo token', () => {
  assert.deepEqual(declaracoesEm(ATUAL, '', TS), [
    'margin: 0 0 var(--ov-esp-2)',
    'font: 700 11px/16px var(--font-sans)',
    'letter-spacing: .12em',
    'text-transform: uppercase',
    'color: var(--ov-texto-secundario)',
  ]);
  // Só no computador e em qualquer largura: nenhuma regra dele num @media.
  for (const r of regras(ATUAL).filter((x) => x.seletores.some((s) => s.includes('ov-titulo-secao')))) assert.equal(r.media, '');
  // O token de 8px existe e vale 8px; não há token de 11px.
  const tokens = ler('css/tokens.css');
  assert.match(tokens, /--ov-esp-2: 8px;/);
  assert.doesNotMatch(tokens, /:\s*[^;]*\b11px\b/);
});

test('janelas.css importável sozinho, sem outline: none nem !important novo; o título em nenhum outro CSS', () => {
  const importantes = (t) => (semComentario(t).match(/!important/g) ?? []).length;
  assert.deepEqual(problemasDeBase('janelas.css', ATUAL), []);
  assert.doesNotMatch(ATUAL, /outline:\s*(none|0)\b/);
  assert.equal(importantes(ATUAL), importantes(ANTES));
  for (const nome of ['casca', 'telas', 'controles', 'onevessel', 'relatorio', 'previa', 'impressao']) {
    assert.doesNotMatch(semComentario(ler(`css/${nome}.css`)), /ov-titulo-secao/, nome);
  }
});

// ---------- Contraste (tokens.css) ----------

const tokens = ler('css/tokens.css');
const bloco = (cabeca) => {
  const i = tokens.indexOf(cabeca);
  const corpo = tokens.slice(tokens.indexOf('{', i) + 1, tokens.indexOf('}', i));
  return Object.fromEntries([...corpo.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};
const escuro = bloco(':root,\n[data-theme="escuro"]');
const TEMAS = { escuro, claro: { ...escuro, ...bloco('[data-theme="claro"] {') } };
const cor = (v) => [0, 2, 4].map((i) => parseInt(v.match(/^#([0-9a-f]{6})$/i)[1].slice(i, i + 2), 16));
const luminancia = (c) => {
  const [r, g, b] = c.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [luminancia(cor(a)), luminancia(cor(b))].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

test('contraste: o secundário sobre o fundo da Gaveta e da Folha (a elevada), 4,5:1 ou mais nos dois temas', () => {
  // O fundo das duas é a elevada (a Gaveta no janelas.css, a Folha na casca).
  assert.ok(declaracoesEm(ATUAL, '', '.ov-gaveta').includes('background: var(--ov-superficie-elevada)'));
  assert.ok(declaracoesEm(ler('css/casca.css'), '', '.ov-folha').includes('background: var(--ov-superficie-elevada)'));
  const ESPERADO = { escuro: 6.58, claro: 7.28 };
  for (const [tema, t] of Object.entries(TEMAS)) {
    const c = contraste(t['ov-texto-secundario'], t['ov-superficie-elevada']);
    assert.ok(c >= 4.5, `${tema}: ${c}`);
    assert.equal(+c.toFixed(2), ESPERADO[tema], tema);
  }
});

// ---------- Os outros arquivos, o exemplo e a versão ----------

const DA_V3290 = {
  'css/casca.css': 'dec8032af2c2ca28e82bdfe576d867610c546bb768a9fdc0a1728e24ae0be338',
  'css/controles.css': '9a08e7397838c3242b88ec4b8c8e06566fad3f31f2fcfd485dece6c553487b1e',
  'css/fontes.css': '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
  'css/impressao.css': 'caa847f2a4f114828ac12e95ddbc68e47b89ec6b616bf5014121d0f28c52deaf',
  'css/onevessel.css': 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
  'css/previa.css': '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
  'css/relatorio.css': '4e541be44ca429a6f113b4fe29478477f9c914af709fddcd2f4556cf22ac50b1',
  'css/telas.css': 'aca9e4153479af32f7a1170dc146e40e41705a5b9ba244994e56be27a6f6e177',
  'css/tokens.css': '5c4b6eec97edf1d5a498e754e1506db51d2979c73c9ef328b4660b79014d5470',
  'tailwind/preset.js': '9adaa96a15e4741e0aa5c9386bc87dd894159e7e04774ae854a5b0c04eb4af0a',
};
test('os outros CSS, os tokens e o preset com os bytes da v3.29.0; a fixture da tag', () => {
  for (const [arquivo, sha] of Object.entries(DA_V3290)) assert.equal(sha256(arquivo), sha, arquivo);
  const css = readdirSync(url('css')).filter((n) => n.endsWith('.css')).map((n) => `css/${n}`).sort();
  assert.deepEqual(css, [...Object.keys(DA_V3290).filter((a) => a.startsWith('css/')), 'css/janelas.css'].sort(), 'nenhum CSS nasce nem some');
  assert.equal(sha256('test/fixtures/janelas-v3.29.0.css'), 'a29143557a341d047f2e8797d17f22db6d7486be92d2828f9cf709a8bd9cbab3');
});

test('exemplo: o título de seção dentro de uma Gaveta, nos dois temas, escrito em caixa normal', () => {
  const i = exemplo.indexOf('<section class="gaveta-ex titulo-secao-ex">');
  assert.ok(i > 0);
  const secao = exemplo.slice(i, exemplo.indexOf('</section>', i));
  for (const tema of ['escuro', 'claro']) {
    const j = secao.indexOf(`<div class="moldura" data-theme="${tema}">`);
    assert.ok(j > 0, tema);
    const gaveta = secao.slice(secao.indexOf('<div class="ov-gaveta"', j));
    assert.match(gaveta, new RegExp(`^<div class="ov-gaveta" data-altura="detalhe" role="dialog" aria-modal="true" aria-labelledby="ts-${tema}">`));
    assert.match(gaveta, /^[^]*?<h3 class="ov-titulo-secao">Informações principais<\/h3>/);
  }
  const titulos = [...secao.matchAll(/class="ov-titulo-secao">([^<]+)</g)].map((m) => m[1]);
  assert.equal(titulos.length, 4);
  for (const t of titulos) assert.notEqual(t, t.toUpperCase(), `"${t}" em caixa normal no HTML`);
  // Fora do exemplo da seção, a classe não aparece (só na legenda, em código).
  assert.equal((exemplo.match(/class="ov-titulo-secao">/g) ?? []).length, 4);
  assert.doesNotMatch(secao, /@[a-z0-9-]+\.[a-z]/i, 'nenhum e-mail');
});

test('package.json 3.30.0 sem export novo; README com a tag, a seção, o exemplo em Janelas e a regra da caixa normal', () => {
  assert.equal(pacote.version, '3.30.0');
  assert.equal(Object.keys(pacote.exports).length, 32);
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.30\.0"/);
  assert.match(leiame, /### Título de seção da Gaveta e da Folha \(v3\.30\.0\)/);
  assert.match(leiame, /\*\*Alteradas pelo nome:\*\* nenhuma regra muda de valor nem de seletor; nenhum token muda/);
  assert.match(leiame, /\*\*Por que a v3\.30\.0 é minor:\*\*/);
  assert.match(leiame, /6,58:1 no escuro, 7,28:1 no claro/);
  const janelas = leiame.slice(leiame.indexOf('### Janelas'), leiame.indexOf('### Controles'));
  assert.match(janelas, /<h3 class="ov-titulo-secao">Informações principais<\/h3>/);
  assert.match(janelas, /- \*\*Título de seção\*\* \(v3\.30\.0/);
  assert.match(janelas, /\*\*O texto vai em caixa normal no HTML\*\*/);
  assert.match(janelas, /Vale para \*\*qualquer elemento\*\* \(h2, h3, div\)/);
});

// ---------- Medida no navegador ----------

let chromium = null;
let motivo = '';
try {
  ({ chromium } = await import('playwright'));
  const navegador = await chromium.launch();
  await navegador.close();
} catch (erro) {
  chromium = null;
  motivo = `sem o Chromium do Playwright (npx playwright install chromium): ${erro.message.split('\n')[0]}`;
}

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const TIPOS = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const servir = () => new Promise((resolve) => {
  const servidor = createServer((pedido, resposta) => {
    const caminho = normalize(join(RAIZ, decodeURIComponent(new URL(pedido.url, 'http://x').pathname)));
    if (!caminho.startsWith(RAIZ) || !existsSync(caminho)) { resposta.writeHead(404); resposta.end(); return; }
    resposta.writeHead(200, { 'content-type': TIPOS[extname(caminho)] ?? 'application/octet-stream' });
    resposta.end(readFileSync(caminho));
  });
  servidor.listen(0, '127.0.0.1', () => resolve(servidor));
});

test('título de seção medido: 11/16, 700, 1,32px de espaço, maiúsculas pelo CSS, a cor secundária de cada tema; o texto do DOM em caixa normal', { skip: chromium ? false : motivo }, async () => {
  const servidor = await servir();
  const navegador = await chromium.launch();
  try {
    const pagina = await (await navegador.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })).newPage();
    await pagina.goto(`http://127.0.0.1:${servidor.address().port}/exemplo/index.html`);
    const medidas = await pagina.evaluate(() => [...document.querySelectorAll('.ov-titulo-secao')].map((e) => {
      const cs = getComputedStyle(e);
      const ref = document.createElement('span');
      ref.style.color = 'var(--ov-texto-secundario)';
      e.after(ref);
      const secundario = getComputedStyle(ref).color;
      ref.remove();
      return { tema: e.closest('[data-theme]').dataset.theme, texto: e.textContent, visivel: e.innerText, fonte: [cs.fontSize, cs.lineHeight, cs.fontWeight, cs.letterSpacing, cs.textTransform], cor: cs.color, secundario, margem: [cs.marginTop, cs.marginBottom] };
    }));
    assert.equal(medidas.length, 4);
    assert.deepEqual([...new Set(medidas.map((m) => m.tema))].sort(), ['claro', 'escuro']);
    for (const m of medidas) {
      assert.deepEqual(m.fonte, ['11px', '16px', '700', '1.32px', 'uppercase'], m.texto);
      assert.equal(m.cor, m.secundario, `${m.tema}: a cor secundária`);
      assert.deepEqual(m.margem, ['0px', '8px']);
      assert.notEqual(m.texto, m.texto.toUpperCase(), 'o DOM em caixa normal');
      assert.equal(m.visivel, m.texto.toUpperCase(), 'na tela, em maiúsculas');
    }
  } finally {
    await navegador.close();
    servidor.close();
  }
});

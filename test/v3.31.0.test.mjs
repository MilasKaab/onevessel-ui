// v3.31.0 (janelas-e-avisos.md, regra 6, "Toast com ação, onde fica a ação",
// decidido em 26/11): a ação fica ao lado do texto quando ele cabe em até
// duas linhas com ela ao lado; passou de duas, desce para baixo do texto,
// alinhada à direita. No janelas.css, o .ov-toast-texto (quebra em qualquer
// ponto) e a linha com data-acao="embaixo"; em js/, a medida que põe a marca
// (toast-acao.js, com DOM). O X de dispensar (data-dispensar) fica no alto
// (decidido pelo Salim em 26/11, na sessão deste PR). Minor: a fixture da
// v3.30.0 (`test/fixtures/janelas-v3.30.0.css`, da tag, fixa) fica igual
// regra a regra; nascem só as regras novas, e o toast-nucleo.js não muda.
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
const ANTES = ler('test/fixtures/janelas-v3.30.0.css');

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

const TEXTO = '.ov-toast-texto';
const EMBAIXO = '.ov-toast-linha[data-acao="embaixo"]';
const NASCEM = [
  `|${TEXTO}`,
  `|${EMBAIXO}`,
  `|${EMBAIXO}::before`,
  `|${EMBAIXO} > ${TEXTO}`,
  `|${EMBAIXO} > .ov-toast-acao:not([data-dispensar])`,
];

test('janelas.css, minor: toda regra da v3.30.0 igual; nascem só o texto e a linha com a ação embaixo, logo depois do foco da ação; as velhas na mesma ordem', () => {
  for (const r of regras(ANTES)) {
    for (const s of r.seletores) assert.deepEqual(declaracoesEm(ATUAL, r.media, s), declaracoesEm(ANTES, r.media, s), `${r.media}|${s}`);
  }
  const velhas = chaves(ANTES);
  const agora = chaves(ATUAL);
  assert.deepEqual(agora.filter((c) => !velhas.includes(c)), NASCEM, 'o que nasce, nesta ordem');
  assert.deepEqual(agora.filter((c) => velhas.includes(c)), velhas, 'a ordem das velhas');
  const i = agora.indexOf(NASCEM[0]);
  assert.equal(agora[i - 1], '|.ov-toast-acao:focus-visible', 'ao lado da ação');
  assert.deepEqual(agora.slice(i, i + NASCEM.length), NASCEM, 'juntas');
});

test('as declarações novas: o texto quebra em qualquer ponto; com a marca, a linha dobra, o texto cresce e as ações (fora o X) descem à direita', () => {
  assert.deepEqual(declaracoesEm(ATUAL, '', TEXTO), ['min-width: 0', 'overflow-wrap: anywhere']);
  assert.deepEqual(declaracoesEm(ATUAL, '', EMBAIXO), ['flex-wrap: wrap', 'row-gap: 0', 'justify-content: flex-end']);
  assert.deepEqual(declaracoesEm(ATUAL, '', `${EMBAIXO}::before`), ['content: ""', 'order: 1', 'flex-basis: 100%']);
  assert.deepEqual(declaracoesEm(ATUAL, '', `${EMBAIXO} > ${TEXTO}`), ['flex: 1 1 0', 'padding: 6px 0']);
  assert.deepEqual(declaracoesEm(ATUAL, '', `${EMBAIXO} > .ov-toast-acao:not([data-dispensar])`), ['order: 2', 'margin-left: 0']);
  // Nenhuma num @media: vale em qualquer largura, porque quem decide é a medida.
  for (const r of regras(ATUAL).filter((x) => x.seletores.some((s) => s.includes('ov-toast-texto') || s.includes('data-acao')))) assert.equal(r.media, '');
});

test('janelas.css importável sozinho, sem outline: none nem !important novo; as classes novas em nenhum outro CSS', () => {
  const importantes = (t) => (semComentario(t).match(/!important/g) ?? []).length;
  assert.deepEqual(problemasDeBase('janelas.css', ATUAL), []);
  assert.doesNotMatch(ATUAL, /outline:\s*(none|0)\b/);
  assert.equal(importantes(ATUAL), importantes(ANTES));
  for (const nome of ['casca', 'telas', 'controles', 'onevessel', 'relatorio', 'previa', 'impressao']) {
    assert.doesNotMatch(semComentario(ler(`css/${nome}.css`)), /ov-toast-texto|data-acao|data-dispensar/, nome);
  }
});

// ---------- Os outros arquivos e o toast-nucleo.js ----------

const DA_V3300 = {
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
  'js/toast-nucleo.js': 'e647098ae7813e085e5094afd28775442ec1241e75a7106c43a0c8fb23226dce',
  'js/toast-nucleo.d.ts': '3a017e3c0e3c2d2a14787aa0d3074b1f1ff57f747cb9595800e691a186e5448d',
};
test('os outros CSS, os tokens, o preset e o toast-nucleo.js com os bytes da v3.30.0; a fixture da tag', () => {
  for (const [arquivo, sha] of Object.entries(DA_V3300)) assert.equal(sha256(arquivo), sha, arquivo);
  const css = readdirSync(url('css')).filter((n) => n.endsWith('.css')).map((n) => `css/${n}`).sort();
  assert.deepEqual(css, [...Object.keys(DA_V3300).filter((a) => a.startsWith('css/')), 'css/janelas.css'].sort(), 'nenhum CSS nasce nem some');
  assert.equal(sha256('test/fixtures/janelas-v3.30.0.css'), '0af652e164674733506cc3810de058a0ccb269ef8b5a716007bb83dccf122462');
});

test('toast-nucleo.js continua puro: sem DOM e sem a medida', () => {
  const nucleo = ler('js/toast-nucleo.js');
  assert.doesNotMatch(nucleo, /ResizeObserver|MutationObserver|getComputedStyle|toast-acao/);
});

// ---------- js/toast-acao.js ----------

const modulo = await import('../js/toast-acao.js');

test('toast-acao.js exporta exatamente o que o .d.ts declara, sem import, e está em exports', () => {
  assert.deepEqual(Object.keys(modulo).sort(), ['EMBAIXO', 'MARCA', 'medirAcaoDoToast', 'passaDeDuasLinhas']);
  const tipos = ler('js/toast-acao.d.ts');
  for (const nome of Object.keys(modulo)) assert.match(tipos, new RegExp(`export declare (const|function) ${nome}\\b`), nome);
  assert.equal((tipos.match(/export declare/g) ?? []).length, 4);
  assert.doesNotMatch(semComentario(ler('js/toast-acao.js')), /^\s*import\b/m);
  assert.deepEqual(pacote.exports['./js/toast-acao.js'], { types: './js/toast-acao.d.ts', default: './js/toast-acao.js' });
  assert.equal(modulo.MARCA, 'data-acao');
  assert.equal(modulo.EMBAIXO, 'embaixo');
});

test('passaDeDuasLinhas: mais de 2 × line-height, com 1 px de folga', () => {
  const { passaDeDuasLinhas } = modulo;
  assert.equal(passaDeDuasLinhas(20, 20), false);
  assert.equal(passaDeDuasLinhas(40, 20), false);
  assert.equal(passaDeDuasLinhas(41, 20), false, 'a folga');
  assert.equal(passaDeDuasLinhas(41.5, 20), true);
  assert.equal(passaDeDuasLinhas(60, 20), true);
});

test('medirAcaoDoToast sem linha, ou sem ação, ou sem texto: não faz nada e devolve uma limpeza', () => {
  const { medirAcaoDoToast } = modulo;
  for (const nada of [null, undefined, {}]) {
    const limpar = medirAcaoDoToast(nada);
    assert.equal(typeof limpar, 'function');
    limpar();
  }
  // Uma linha falsa, sem DOM: só o X (data-dispensar) não é ação.
  const mexeu = [];
  const linha = (tem) => ({
    querySelector: (s) => (tem.some((t) => s.includes(t)) ? {} : null),
    setAttribute: (...a) => mexeu.push(a),
    removeAttribute: (...a) => mexeu.push(a),
  });
  medirAcaoDoToast(linha(['.ov-toast-texto']))();
  medirAcaoDoToast(linha(['.ov-toast-acao']))();
  assert.deepEqual(mexeu, []);
});

// ---------- package.json, README e exemplo ----------

test('package.json 3.31.0 com o export novo depois do barra-nucleo; README com a tag, a seção, a marcação, a função e o React', () => {
  assert.equal(pacote.version, '3.31.0');
  const lista = Object.keys(pacote.exports);
  assert.equal(lista.length, 33);
  assert.equal(lista[lista.indexOf('./js/toast-acao.js') - 1], './js/barra-nucleo.js');
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.31\.0"/);
  assert.match(leiame, /### Toast com a ação embaixo \(v3\.31\.0\)/);
  assert.match(leiame, /\*\*Alteradas pelo nome:\*\* nenhuma regra muda de valor nem de seletor; nenhum token muda/);
  assert.match(leiame, /\*\*Por que a v3\.31\.0 é minor:\*\*/);
  assert.match(leiame, /<span class="ov-toast-texto">/);
  assert.match(leiame, /data-dispensar/);
  assert.match(leiame, /useLayoutEffect\(\(\) => medirAcaoDoToast\(linha\.current\)/);
  assert.match(leiame, /\| `js\/toast-acao\.js` \|/);
  assert.match(leiame, /import \{ medirAcaoDoToast \} from 'onevessel-ui\/js\/toast-acao\.js'/);
  for (const arquivo of ['src/janelas/Toast.jsx', 'src/components/janelas/toast.tsx', 'src/components/janelas/Toast.jsx', 'src/Toasts.jsx']) {
    assert.ok(leiame.includes(`\`${arquivo}\``), arquivo);
  }
});

test('exemplo: dois temas × três larguras × quatro toasts, todos com o .ov-toast-texto; o X com data-dispensar; a medida ligada', () => {
  const i = exemplo.indexOf('<section class="toast-acao-ex">');
  assert.ok(i > 0);
  const secao = exemplo.slice(i, exemplo.indexOf('</section>', i));
  for (const tema of ['escuro', 'claro']) assert.ok(secao.includes(`<div class="controles-moldura" data-theme="${tema}">`), tema);
  for (const largura of ['320', '415', 'computador']) assert.equal(secao.split(`data-largura="${largura}"`).length - 1, 2, largura);
  assert.equal((secao.match(/class="ov-toast-linha"/g) ?? []).length, 24);
  assert.equal((secao.match(/class="ov-toast-texto"/g) ?? []).length, 24);
  assert.equal((secao.match(/data-dispensar aria-label="Dispensar"/g) ?? []).length, 6);
  assert.match(exemplo, /import\('\.\.\/js\/toast-acao\.js'\)\.then\(\(\{ medirAcaoDoToast \}\)/);
  assert.doesNotMatch(secao, /@[a-z0-9-]+\.[a-z]/i, 'nenhum e-mail');
});

// ---------- No navegador ----------

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

const CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
const CARRINHO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 2h2l2.7 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.9-1.6L22 7H5"/></svg>';
const X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
const PEDIDO = 'Pedido gerado: Pedido_BRAM_POWER_2026-11-26.xlsx (5 itens).';

// A página do teste: a pilha de verdade (fixa, com a largura da tela), a
// medida ligada em cada linha e o histórico da marca de cada uma, gravado
// depois de cada medida (o valor final, sem os passos de dentro dela).
const PAGINA = (css) => `<!doctype html><html lang="pt-BR" data-theme="escuro"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${css.map((c) => `<link rel="stylesheet" href="/${c}">`).join('\n')}
<style>body { margin: 0; background: var(--ov-fundo); font: var(--ov-fonte-corpo); }</style></head><body>
<div class="ov-toasts">
  <div class="ov-toast" role="status"><div class="ov-toast-linha" id="curto">${CHECK}<span class="ov-toast-texto">Item removido do carrinho.</span><button type="button" class="ov-toast-acao">Desfazer</button></div></div>
  <div class="ov-toast" role="status"><div class="ov-toast-linha" id="pedido">${CHECK}<span class="ov-toast-texto">${PEDIDO}</span><button type="button" class="ov-toast-acao">${CARRINHO}Tirar do carrinho</button></div></div>
  <div class="ov-toast" data-tipo="erro" role="alert"><div class="ov-toast-linha" id="erro">${CHECK}<span class="ov-toast-texto">Não consegui gerar o arquivo do pedido.</span><button type="button" class="ov-toast-acao">Tentar novamente</button><button type="button" class="ov-toast-acao" data-dispensar aria-label="Dispensar">${X}</button></div></div>
  <div class="ov-toast" data-tipo="erro" role="alert"><div class="ov-toast-linha" id="so-x">${CHECK}<span class="ov-toast-texto">Seu acesso mudou. A tela vai recarregar no estado de agora, sem as alterações que não foram salvas.</span><button type="button" class="ov-toast-acao" data-dispensar aria-label="Dispensar">${X}</button></div></div>
  <div class="ov-toast" role="status"><div class="ov-toast-linha" id="antigo">${CHECK}<span>${PEDIDO}</span><button type="button" class="ov-toast-acao">Desfazer</button></div></div>
</div>
<script type="module">
  import { medirAcaoDoToast } from '/js/toast-acao.js';
  window.historico = {};
  window.limpezas = {};
  for (const linha of document.querySelectorAll('.ov-toast-linha')) {
    const h = (window.historico[linha.id] = [linha.getAttribute('data-acao')]);
    new MutationObserver(() => {
      const agora = linha.getAttribute('data-acao');
      if (h[h.length - 1] !== agora) h.push(agora);
    }).observe(linha, { attributes: true, attributeFilter: ['data-acao'] });
    window.limpezas[linha.id] = medirAcaoDoToast(linha);
    const agora = linha.getAttribute('data-acao');
    if (h[h.length - 1] !== agora) h.push(agora);
  }
  await document.fonts.ready;
  window.pronta = true;
</script></body></html>`;

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const TIPOS = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const PAGINAS = {
  '/toast.html': PAGINA(['css/fontes.css', 'css/tokens.css', 'css/onevessel.css']),
  // A marcação da v3.30.0 (sem a marca), com o CSS de hoje e com o da tag.
  '/agora.html': PAGINA(['css/fontes.css', 'css/tokens.css', 'css/casca.css', 'css/controles.css', 'css/janelas.css']).replace(/<script type="module">[^]*<\/script>/, ''),
  '/antes.html': PAGINA(['css/fontes.css', 'css/tokens.css', 'css/casca.css', 'css/controles.css', 'test/fixtures/janelas-v3.30.0.css']).replace(/<script type="module">[^]*<\/script>/, ''),
};
const servir = () => new Promise((resolve) => {
  const servidor = createServer((pedido, resposta) => {
    const nome = decodeURIComponent(new URL(pedido.url, 'http://x').pathname);
    if (PAGINAS[nome]) { resposta.writeHead(200, { 'content-type': 'text/html' }); resposta.end(PAGINAS[nome]); return; }
    const caminho = normalize(join(RAIZ, nome));
    if (!caminho.startsWith(RAIZ) || !existsSync(caminho)) { resposta.writeHead(404); resposta.end(); return; }
    resposta.writeHead(200, { 'content-type': TIPOS[extname(caminho)] ?? 'application/octet-stream' });
    resposta.end(readFileSync(caminho));
  });
  servidor.listen(0, '127.0.0.1', () => resolve(servidor));
});

const quadros = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const geometria = (id) => {
  const linha = document.getElementById(id);
  const caixa = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, d: r.right, b: r.bottom, w: r.width, h: r.height }; };
  const texto = linha.querySelector('.ov-toast-texto');
  const lh = parseFloat(getComputedStyle(texto).lineHeight);
  return {
    marca: linha.getAttribute('data-acao'),
    linha: caixa(linha),
    icone: caixa(linha.querySelector('svg')),
    texto: caixa(texto),
    linhas: Math.round((texto.offsetHeight - parseFloat(getComputedStyle(texto).paddingTop) - parseFloat(getComputedStyle(texto).paddingBottom)) / lh),
    vaza: texto.scrollWidth > texto.clientWidth,
    acoes: [...linha.querySelectorAll('.ov-toast-acao:not([data-dispensar])')].map(caixa),
    x: linha.querySelector('[data-dispensar]') ? caixa(linha.querySelector('[data-dispensar]')) : null,
  };
};

const comNavegador = async (largura, corpo, movimento = 'reduce') => {
  const servidor = await servir();
  const navegador = await chromium.launch();
  try {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: 800 }, reducedMotion: movimento });
    const pagina = await contexto.newPage();
    const erros = [];
    pagina.on('pageerror', (e) => erros.push(e.message));
    pagina.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
    const base = `http://127.0.0.1:${servidor.address().port}`;
    await pagina.goto(`${base}/toast.html`);
    await pagina.waitForFunction(() => window.pronta === true);
    await pagina.evaluate(quadros);
    await corpo(pagina, base);
    assert.deepEqual(erros, [], 'nenhum erro no console (nem o "ResizeObserver loop")');
  } finally {
    await navegador.close();
    servidor.close();
  }
};
const medir = (pagina, id) => pagina.evaluate(geometria, id);
const historico = (pagina, id) => pagina.evaluate((i) => window.historico[i], id);

const opcoes = { skip: chromium ? false : motivo };

for (const movimento of ['reduce', 'no-preference']) {
  test(`a 320 px: "Item removido do carrinho." + "Desfazer" fica ao lado; o "Pedido gerado …xlsx (5 itens)." + "Tirar do carrinho" desce, à direita (movimento ${movimento})`, opcoes, async () => {
    await comNavegador(320, async (pagina) => {
      const curto = await medir(pagina, 'curto');
      assert.equal(curto.marca, null);
      assert.ok(curto.linhas <= 2, `${curto.linhas} linhas`);
      assert.ok(curto.acoes[0].y < curto.texto.b && curto.acoes[0].b > curto.texto.y, 'a ação na linha do texto');

      const pedido = await medir(pagina, 'pedido');
      assert.equal(pedido.marca, 'embaixo');
      assert.equal(pedido.vaza, false, 'o nome do arquivo não vaza');
      // O texto ocupa a largura toda depois do ícone (12 de vão, 8 de recuo à direita).
      assert.ok(Math.abs(pedido.texto.x - (pedido.icone.d + 12)) < 1, 'o texto logo depois do ícone');
      assert.ok(Math.abs(pedido.texto.d - (pedido.linha.d - 8)) < 1, 'até a borda da linha');
      assert.ok(pedido.linhas <= 3, `${pedido.linhas} linhas, não 5`);
      // A ação embaixo do texto, encostada à direita.
      assert.ok(pedido.acoes[0].y >= pedido.texto.b - 0.5, 'a ação embaixo');
      assert.ok(Math.abs(pedido.acoes[0].d - (pedido.linha.d - 8)) < 1, 'à direita');
      assert.ok(pedido.linha.d <= 320 - 16 + 0.5, 'dentro da tela');

      // O erro com "Tentar novamente" e o X: a ação desce, o X fica no alto, à direita do texto.
      const erro = await medir(pagina, 'erro');
      assert.equal(erro.marca, 'embaixo');
      assert.ok(erro.acoes[0].y >= erro.texto.b - 0.5, 'a ação embaixo');
      assert.ok(Math.abs(erro.acoes[0].d - (erro.linha.d - 8)) < 1, 'a ação à direita');
      assert.ok(erro.x.y < erro.texto.b && erro.x.b > erro.texto.y, 'o X na linha do texto');
      assert.ok(Math.abs(erro.x.d - (erro.linha.d - 8)) < 1, 'o X à direita');
      assert.ok(Math.abs(erro.texto.d + 12 - erro.x.x) < 1, 'o texto até o X');

      // Só o X: não é ação, nada muda; a linha sem o .ov-toast-texto, também não.
      assert.deepEqual(await historico(pagina, 'so-x'), [null]);
      assert.deepEqual(await historico(pagina, 'antigo'), [null]);
    }, movimento);
  });
}

for (const movimento of ['reduce', 'no-preference']) {
  test(`ao alargar para 1280: o erro de duas linhas volta para o lado; o "Pedido gerado" não cabe em duas (3 com a ação ao lado, no Toast de 440) e fica embaixo, sem trocar (movimento ${movimento})`, opcoes, async () => {
    await comNavegador(320, async (pagina) => {
      assert.deepEqual(await historico(pagina, 'pedido'), [null, 'embaixo']);
      assert.deepEqual(await historico(pagina, 'erro'), [null, 'embaixo']);
      await pagina.setViewportSize({ width: 1280, height: 800 });
      await pagina.evaluate(quadros);

      const erro = await medir(pagina, 'erro');
      assert.equal(erro.marca, null, 'o erro volta para o lado');
      assert.equal(erro.linhas, 2, 'duas linhas com a ação e o X ao lado');
      assert.ok(erro.acoes[0].y < erro.texto.b && erro.acoes[0].b > erro.texto.y, 'a ação ao lado');
      assert.deepEqual(await historico(pagina, 'erro'), [null, 'embaixo', null], 'uma troca no redimensionamento');

      // O "Pedido gerado": a medida sem a marca dá 3 linhas a 1280.
      const pedido = await medir(pagina, 'pedido');
      assert.equal(pedido.marca, 'embaixo');
      const aoLado = await pagina.evaluate(() => {
        const linha = document.getElementById('pedido');
        linha.removeAttribute('data-acao');
        const t = linha.querySelector('.ov-toast-texto');
        const cs = getComputedStyle(t);
        const n = Math.round((t.offsetHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / parseFloat(cs.lineHeight));
        linha.setAttribute('data-acao', 'embaixo');
        return n;
      });
      assert.equal(aoLado, 3, 'três linhas com a ação ao lado');
      assert.deepEqual((await historico(pagina, 'pedido')).slice(0, 2), [null, 'embaixo'], 'sem troca no redimensionamento');
      assert.deepEqual(await historico(pagina, 'curto'), [null], 'o curto nunca troca');
    }, movimento);
  });
}

for (const movimento of ['reduce', 'no-preference']) {
  test(`nenhuma oscilação: de 320 a 1280 e de volta, de 4 em 4 px, a marca troca no máximo uma vez em cada sentido e para no limite (movimento ${movimento})`, opcoes, async () => {
    await comNavegador(320, async (pagina) => {
      const IDS = ['curto', 'pedido', 'erro'];
      const todos = async () => Object.fromEntries(await Promise.all(IDS.map(async (id) => [id, await historico(pagina, id)])));
      const varrer = async (de, ate, passo) => {
        for (let w = de; passo > 0 ? w <= ate : w >= ate; w += passo) {
          await pagina.setViewportSize({ width: w, height: 800 });
          await pagina.evaluate(quadros);
        }
      };
      const inicio = await todos();
      await varrer(320, 1280, 4);
      const ida = await todos();
      for (const id of IDS) assert.ok(ida[id].length - inicio[id].length <= 1, `${id}: ${ida[id]}`);
      assert.equal(ida.erro.length - inicio.erro.length, 1, 'o erro troca uma vez na ida');
      await varrer(1280, 320, -4);
      const volta = await todos();
      for (const id of IDS) assert.ok(volta[id].length - ida[id].length <= 1, `${id}: ${volta[id]}`);
      assert.equal(volta.erro.at(-1), 'embaixo', 'de volta a 320');
      // No limite do erro: parado ali, nada mais troca.
      let limite = 0;
      for (let w = 320; w <= 1280; w += 1) {
        await pagina.setViewportSize({ width: w, height: 800 });
        await pagina.evaluate(quadros);
        if ((await medir(pagina, 'erro')).marca === null) { limite = w; break; }
      }
      assert.ok(limite > 320, 'achou o limite');
      for (const w of [limite - 1, limite]) {
        await pagina.setViewportSize({ width: w, height: 800 });
        await pagina.evaluate(quadros);
        const antes = (await historico(pagina, 'erro')).length;
        for (let i = 0; i < 10; i++) await pagina.evaluate(quadros);
        assert.equal((await historico(pagina, 'erro')).length, antes, `parado a ${w}px`);
      }
    }, movimento);
  });
}

for (const movimento of ['reduce', 'no-preference']) {
  test(`o texto que muda faz a medida de novo; depois da limpeza, não (movimento ${movimento})`, opcoes, async () => {
    await comNavegador(320, async (pagina) => {
      const trocar = (id, texto) => pagina.evaluate(([i, t]) => { document.querySelector(`#${i} .ov-toast-texto`).textContent = t; }, [id, texto]);
      await trocar('curto', PEDIDO);
      await pagina.evaluate(quadros);
      assert.equal((await medir(pagina, 'curto')).marca, 'embaixo', 'texto longo: desce');
      await trocar('curto', 'Item removido.');
      await pagina.evaluate(quadros);
      assert.equal((await medir(pagina, 'curto')).marca, null, 'texto curto: volta');
      // Ação que some: a marca sai. Ação que volta não religa (o app chama de novo).
      await pagina.evaluate(() => document.querySelector('#pedido .ov-toast-acao').remove());
      await pagina.evaluate(quadros);
      assert.equal((await medir(pagina, 'pedido')).marca, null, 'sem ação, sem marca');
      await pagina.evaluate(() => window.limpezas.curto());
      await trocar('curto', PEDIDO);
      await pagina.evaluate(quadros);
      assert.equal((await medir(pagina, 'curto')).marca, null, 'desligada');
    }, movimento);
  });
}

test('sem a marca, nada muda em relação à v3.30.0: a marcação de antes desenha igual com o CSS de hoje e o da tag', opcoes, async () => {
  for (const largura of [320, 415, 1280]) {
    const servidor = await servir();
    const navegador = await chromium.launch();
    try {
      const contexto = await navegador.newContext({ viewport: { width: largura, height: 800 }, reducedMotion: 'reduce' });
      const pagina = await contexto.newPage();
      const base = `http://127.0.0.1:${servidor.address().port}`;
      const desenho = async (nome) => {
        await pagina.goto(`${base}/${nome}.html`);
        await pagina.evaluate(() => document.fonts.ready);
        // A marcação da v3.30.0: o texto num span sem classe.
        return pagina.evaluate(() => {
          for (const t of document.querySelectorAll('.ov-toast-texto')) t.removeAttribute('class');
          return [...document.querySelectorAll('.ov-toasts *')].map((e) => { const r = e.getBoundingClientRect(); return [e.tagName, r.left, r.top, r.width, r.height].join(' '); });
        });
      };
      assert.deepEqual(await desenho('agora'), await desenho('antes'), `${largura}px`);
    } finally {
      await navegador.close();
      servidor.close();
    }
  }
});

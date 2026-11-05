// v3.24.0 (CV6 e TP4, decididos pelo Salim em 04/11): a dataHoraCurta sem
// vírgula ("27/10 20:00"); o botão na linha de campos (.ov-campo-com-botao),
// com a altura do campo; e o "Salvando" (aria-busy) esmaecido a .6 sem
// disabled, com o anel do foco inteiro. Minor: as fixtures da v3.23.0
// (`test/fixtures/*-v3.23.0.*`, da tag, fixas) ficam iguais regra a regra,
// fora a alterada pelo nome (a dataHoraCurta, que muda de valor). Desde a
// v3.24.1, as janelas daqui são a fixture da v3.24.0 (fixture com fixture),
// e a versão e a tag ficam com o teste da versão mais nova. Desde a v3.24.2,
// o controles daqui é a fixture da v3.24.1 (os mesmos bytes da v3.24.0).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { problemasDeBase, regras, seletores, semComentario } from '../scripts/css-regras.mjs';
import { dataHora, dataHoraCurta } from '../js/datas.js';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');
const exemplo = ler('exemplo/index.html');
// A fixture do datas.js importa o './texto.js' do lado dela; carregada como
// texto, com o import apontado para o js/texto.js (que não muda), sem editar
// a fixture.
const datasAntes = await import(`data:text/javascript,${encodeURIComponent(ler('test/fixtures/datas-v3.23.0.js').replace("from './texto.js'", `from '${url('js/texto.js').href}'`))}`);

const NOMES = ['controles', 'janelas'];
const fonte = (n) => (n === 'janelas' ? 'test/fixtures/janelas-v3.24.0.css' : 'test/fixtures/controles-v3.24.1.css');
const ATUAL = Object.fromEntries(NOMES.map((n) => [n, ler(fonte(n))]));
const ANTES = Object.fromEntries(NOMES.map((n) => [n, ler(`test/fixtures/${n}-v3.23.0.css`)]));

const TOQUE = '@media (pointer: coarse)';
const BUSY = '[aria-busy="true"]:not(:disabled)';
const LINHA = ':has(> .ov-campo[data-densidade="linha"])';

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- minor: tudo da v3.23.0 igual, fora a alterada pelo nome ----------

// Nenhuma regra de CSS muda de valor: o .ov-btn[aria-busy="true"] de antes
// fica com o cursor: progress, e o esmaecido nasce em regras novas.
const ALTERADAS_CSS = {};
// A única alterada pelo nome: a dataHoraCurta, de "27/10, 20:00" para
// "27/10 20:00" (o Paradas já a usa).
const ALTERADAS_JS = { datas: ['dataHoraCurta'] };

const NOVAS = {
  controles: [
    `|.ov-btn${BUSY}`, `|.ov-btn${BUSY}::before`,
    `|.ov-btn-primario${BUSY}`, `|.ov-btn-primario${BUSY}:hover`, `|.ov-btn-primario${BUSY}::before`,
    `|.ov-btn-secundario${BUSY}`, `|.ov-btn-secundario${BUSY}:hover`, `|.ov-btn-secundario${BUSY}::before`,
    `|.ov-btn-fantasma${BUSY}:hover`,
    '|.ov-campo-com-botao', '|.ov-campo-com-botao > .ov-campo', '|.ov-campo-com-botao > .ov-btn', '|.ov-campo-com-botao > .ov-btn-icone',
    `|.ov-campo-com-botao${LINHA} > .ov-btn`, `|.ov-campo-com-botao${LINHA} > .ov-btn-icone`,
    `${TOQUE}|.ov-campo-com-botao > .ov-btn`, `${TOQUE}|.ov-campo-com-botao${LINHA} > .ov-btn`,
    `${TOQUE}|.ov-campo-com-botao > .ov-btn-icone`, `${TOQUE}|.ov-campo-com-botao${LINHA} > .ov-btn-icone`,
  ],
  janelas: [`|.ov-btn-perigo${BUSY}`, `|.ov-btn-perigo${BUSY}::before`],
};

for (const nome of NOMES) {
  test(`minor: toda regra do ${nome}.css da v3.23.0 igual (nenhuma alterada)`, () => {
    const lista = ALTERADAS_CSS[nome] ?? {};
    assert.deepEqual(lista, {});
    for (const r of regras(ANTES[nome])) {
      for (const s of r.seletores) {
        if (s.startsWith('@')) { assert.ok(seletores(ATUAL[nome]).has(s), `sumiu: ${s}`); continue; }
        assert.deepEqual(declaracoesEm(ATUAL[nome], r.media, s), declaracoesEm(ANTES[nome], r.media, s), `${r.media}|${s}`);
      }
    }
  });

  test(`${nome}.css: o que nasceu na v3.24.0 é exatamente a lista, e a ordem das velhas não muda`, () => {
    const velhas = new Set(chaves(ANTES[nome]));
    assert.deepEqual(chaves(ATUAL[nome]).filter((c) => !velhas.has(c)), NOVAS[nome]);
    const fica = (c) => !NOVAS[nome].includes(c);
    assert.deepEqual(chaves(ATUAL[nome]).filter(fica), chaves(ANTES[nome]).filter(fica));
  });
}

test('os outros CSS, o tokens.json e os outros js com os bytes da v3.23.0; as fixtures da tag', () => {
  const CSS = {
    casca: 'dec8032af2c2ca28e82bdfe576d867610c546bb768a9fdc0a1728e24ae0be338',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    telas: '1c98875ecc5f9cab5a28332d87b9089153465b9c74884f8f505fdae09c0c83c4',
    tokens: 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92',
  };
  assert.deepEqual(readdirSync(url('css')).filter((n) => n.endsWith('.css')).sort(), [...Object.keys(CSS), ...NOMES].map((n) => `${n}.css`).sort(), 'nenhum CSS nasce nem some');
  for (const [nome, sha] of Object.entries(CSS)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
  assert.equal(sha256('tokens/tokens.json'), '00e88f37d561d821f96fa505b1cd794326d70bb5df6453a531e24cf667463b1d');
  const JS = {
    'alteracoes-nucleo': '3275de25a16812f027b05c60b8de52ea78eb9bce2143166437241c4a5b62cc71',
    camada: '45a04d3a63f1ccf2910e6cc347ebc01efe64182bcf30489921f4fb93e8a66c69',
    'filtro-nucleo': 'e261b28b16cf397aa957baef59e7cec2e1fdfa5c02d3e87c01d6a64dbb302ad5',
    'foco-preso': 'f9e36b7575c949c5d97ec1286f76cc9e5c84f73647201372dc646cfe35e7052c',
    'lateral-nucleo': '7dba92ae5496d8c33f1a9503f8c6157827bf8e7358aabd22710d22d8ca6e7323',
    'menu-nucleo': '794ddaefa8f7f130e732fa3f26dfa36389179de70f99c840f826336c3350f0da',
    'paleta-nucleo': '79882b9d8f636c4daec672b2475474ee999f56d0240cc0b525d30dad4fbfc7fc',
    'teclas-da-lista': 'e8c4ea0a969926a1c21c487ff6d358c07b44734323f6abc5894570c7c2bc3e79',
    'teclas-da-tabela': 'fb950d7d9178a5ec6a0cc9e25eb17c6c5548838483f720474beee2e56d4dd9dd',
    'teclas-das-abas': '92daaf05a306d2f767ec2348d333ad0763a42d00105fa75f01e9e4962e1d9964',
    'teclas-do-painel': '890e36d9f5d26cdb9f6af6d16961bccc1b53ad4b910aea1536d63f9e71714c6d',
    texto: '95f98b2d6ba6e3215deb415ceaf8d22b65a7126b45ded877d3b7028dc3e2205d',
    'toast-nucleo': 'e647098ae7813e085e5094afd28775442ec1241e75a7106c43a0c8fb23226dce',
  };
  for (const [nome, sha] of Object.entries(JS)) assert.equal(sha256(`js/${nome}.js`), sha, nome);
  const js = readdirSync(url('js')).filter((n) => n.endsWith('.js')).map((n) => n.slice(0, -3)).sort();
  assert.deepEqual(js, [...Object.keys(JS), 'datas'].sort(), 'nenhum js nasce nem some; só o datas muda');
  const FIXTURES = {
    'controles-v3.23.0.css': 'c56d3e940bd8045e11217414606972c15c5740ceefa906c4c658590e6f95da92',
    'janelas-v3.23.0.css': 'c5f04f85a5c1c313affd658e7689485b10f2ae66b174a05bb88292359459b45b',
    'datas-v3.23.0.js': '72d30b9aa1d5e87567df5bc1c336b7d27d03140e29849dc7cd96f82ac626d30f',
    'datas-v3.23.0.d.ts': '0e976eaec026ab3d95a5d9a82d68d88a1577973433e28a4ded94d9543d729f85',
  };
  for (const [nome, sha] of Object.entries(FIXTURES)) assert.equal(sha256(`test/fixtures/${nome}`), sha, nome);
});

test('controles.css e janelas.css continuam importáveis sozinhos, sem outline: none nem color-mix novo', () => {
  for (const nome of NOMES) {
    assert.deepEqual(problemasDeBase(`${nome}.css`, ATUAL[nome]), []);
    assert.doesNotMatch(ATUAL[nome], /outline:\s*(none|0)\b/);
  }
  assert.doesNotMatch(semComentario(ATUAL.controles), /color-mix/);
  assert.equal((semComentario(ATUAL.janelas).match(/color-mix/g) ?? []).length, (semComentario(ANTES.janelas).match(/color-mix/g) ?? []).length);
});

// ---------- Salvando esmaecido ----------

test('Salvando: .6 só num ::before com o fundo e a borda da variante; o botão e o conteúdo sem opacity; o disabled fica de fora', () => {
  const c = ATUAL.controles;
  assert.deepEqual(declaracoesEm(c, '', '.ov-btn[aria-busy="true"]'), ['cursor: progress']);
  assert.deepEqual(declaracoesEm(c, '', `.ov-btn${BUSY}`), ['position: relative', 'isolation: isolate']);
  assert.deepEqual(declaracoesEm(c, '', `.ov-btn${BUSY}::before`), ['content: ""', 'position: absolute', 'inset: -1px', 'z-index: -1', 'border: 1px solid transparent', 'border-radius: inherit', 'opacity: .6', 'pointer-events: none']);
  assert.deepEqual(declaracoesEm(c, '', `.ov-btn-primario${BUSY}:hover`), ['background: transparent', 'color: var(--ov-sobre-acao)']);
  assert.deepEqual(declaracoesEm(c, '', `.ov-btn-primario${BUSY}::before`), ['background: var(--ov-acao)']);
  assert.deepEqual(declaracoesEm(c, '', `.ov-btn-secundario${BUSY}:hover`), ['background: transparent', 'border-color: transparent']);
  assert.deepEqual(declaracoesEm(c, '', `.ov-btn-secundario${BUSY}::before`), ['background: var(--ov-superficie-elevada)', 'border-color: var(--ov-borda-forte)']);
  assert.deepEqual(declaracoesEm(c, '', `.ov-btn-fantasma${BUSY}:hover`), ['background: transparent', 'color: var(--ov-texto-secundario)']);
  assert.deepEqual(declaracoesEm(ATUAL.janelas, '', `.ov-btn-perigo${BUSY}`), ['background: transparent']);
  assert.deepEqual(declaracoesEm(ATUAL.janelas, '', `.ov-btn-perigo${BUSY}::before`), ['background: var(--ov-erro)']);
  // Só o ::before tem opacity: nem o botão (o anel cairia junto) nem o
  // conteúdo (o texto esmaeceria duas vezes); nenhuma mexe em largura,
  // altura ou padding.
  for (const nome of NOMES) {
    for (const r of regras(ATUAL[nome])) for (const s of r.seletores) {
      if (!s.includes('aria-busy')) continue;
      const corpo = declaracoes(r.corpo);
      if (!s.endsWith('::before')) assert.ok(!corpo.some((d) => d.startsWith('opacity')), s);
      assert.ok(!corpo.some((d) => /^(width|height|padding|min-width)\b/.test(d)), s);
    }
  }
  // As reticências e o movimento reduzido continuam como estavam.
  for (const s of ['.ov-reticencias', '.ov-reticencias > span', '.ov-reticencias > span:nth-child(2)', '.ov-reticencias > span:nth-child(3)']) {
    assert.deepEqual(declaracoesEm(c, '', s), declaracoesEm(ANTES.controles, '', s), s);
  }
  assert.deepEqual(declaracoesEm(c, '@media (prefers-reduced-motion: reduce)', '.ov-reticencias > span'), ['animation: none', 'opacity: 1']);
});

// ---------- Botão na linha de campos ----------

test('linha de campos: flex, topo com topo, 8px; o botão com a altura do campo (44, 36 no de linha, 48 no toque); o de ícone quadrado', () => {
  const c = ATUAL.controles;
  assert.deepEqual(declaracoesEm(c, '', '.ov-campo-com-botao'), ['display: flex', 'align-items: flex-start', 'gap: 8px']);
  assert.deepEqual(declaracoesEm(c, '', '.ov-campo-com-botao > .ov-campo'), ['flex: 1 1 auto', 'min-width: 0']);
  assert.deepEqual(declaracoesEm(c, '', '.ov-campo-com-botao > .ov-btn'), ['flex: none', 'height: var(--ov-altura-campo)']);
  assert.deepEqual(declaracoesEm(c, '', '.ov-campo-com-botao > .ov-btn-icone'), ['width: var(--ov-altura-campo)']);
  assert.deepEqual(declaracoesEm(c, '', `.ov-campo-com-botao${LINHA} > .ov-btn`), ['height: var(--ov-altura-controle)']);
  assert.deepEqual(declaracoesEm(c, '', `.ov-campo-com-botao${LINHA} > .ov-btn-icone`), ['width: var(--ov-altura-controle)']);
  assert.deepEqual(declaracoesEm(c, TOQUE, '.ov-campo-com-botao > .ov-btn'), ['height: var(--ov-altura-toque)']);
  assert.deepEqual(declaracoesEm(c, TOQUE, `.ov-campo-com-botao${LINHA} > .ov-btn-icone`), ['width: var(--ov-altura-toque)']);
  // Nenhuma margem: o alinhamento é do contêiner, não da altura do rótulo.
  for (const r of regras(c)) if (r.seletores.some((s) => s.includes('ov-campo-com-botao'))) assert.doesNotMatch(r.corpo, /margin|align-self|stretch/);
  // O .ov-btn fora do contêiner não muda.
  assert.deepEqual(declaracoesEm(c, '', '.ov-btn'), declaracoesEm(ANTES.controles, '', '.ov-btn'));
  assert.deepEqual(declaracoesEm(c, TOQUE, '.ov-btn'), declaracoesEm(ANTES.controles, TOQUE, '.ov-btn'));
});

// ---------- Data sem vírgula ----------

test('dataHoraCurta sem vírgula no ano corrente ("27/10 20:00", a dataHora sem o ano); de outro ano, igual à de antes', () => {
  const agora = new Date('2026-10-31T15:00:00Z');
  assert.equal(datasAntes.dataHoraCurta('2026-10-27T23:00:00Z', agora), '27/10, 20:00');
  assert.equal(dataHoraCurta('2026-10-27T23:00:00Z', agora), '27/10 20:00');
  assert.equal(dataHoraCurta('2026-10-27T23:00:00Z', agora), dataHora('2026-10-27T23:00:00Z').replace('/2026', ''));
  for (const [i, a] of [['2025-10-27T23:00:00Z', agora], ['2027-03-01T12:00:00Z', agora], ['2026-12-31T20:00:00Z', '2027-01-01T03:00:00Z'], ['', agora], [null, agora]]) {
    assert.equal(dataHoraCurta(i, a), datasAntes.dataHoraCurta(i, a), String(i));
  }
});

test('datas.js: o resto do módulo igual à v3.23.0 (os mesmos exports, as mesmas saídas)', async () => {
  const agora = await import('../js/datas.js');
  assert.deepEqual(Object.keys(agora).sort(), Object.keys(datasAntes).sort());
  const ins = ['2026-10-27T02:30:00Z', '2026-10-26', 1793815598386, new Date('2027-01-01T02:59:00Z'), '', 'x'];
  for (const nome of ['data', 'dataHora', 'title']) for (const i of ins) assert.equal(agora[nome](i), datasAntes[nome](i), `${nome}(${i})`);
  for (const i of ins) assert.equal(agora.diaRelativo(i, '2026-10-27T12:00:00Z'), datasAntes.diaRelativo(i, '2026-10-27T12:00:00Z'));
  for (const ms of [0, 59999, 60000, 3 * 3600000 + 5 * 60000, 2 * 86400000, -1]) {
    assert.equal(agora.duracao(ms), datasAntes.duracao(ms));
    assert.equal(agora.decorrido(ms), datasAntes.decorrido(ms));
  }
  assert.equal(agora.FUSO_DE_BRASILIA, datasAntes.FUSO_DE_BRASILIA);
  // O código só muda na linha da curta; o resto do diff é comentário.
  const codigo = (t) => t.replace(/\/\*\*?[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').split('\n').map((l) => l.trim()).filter(Boolean);
  const [a, d] = [codigo(ler('test/fixtures/datas-v3.23.0.js')), codigo(ler('js/datas.js'))];
  assert.equal(a.length, d.length);
  const diferentes = a.map((l, k) => [l, d[k]]).filter(([x, y]) => x !== y);
  assert.deepEqual(diferentes, [['return `${p.dia}/${p.mes}, ${p.hora}:${p.minuto}`', 'return `${p.dia}/${p.mes} ${p.hora}:${p.minuto}`']]);
  assert.match(ler('js/datas.d.ts'), /\/\*\* "27\/10 20:00" no ano de `agora`/);
  assert.doesNotMatch(ler('js/datas.d.ts'), /27\/10, 20:00"/);
});

test('nenhum outro js/ produz ou espera a vírgula entre data e hora', () => {
  for (const nome of readdirSync(url('js')).filter((n) => /\.(js|d\.ts)$/.test(n))) {
    const t = ler(`js/${nome}`);
    if (nome.startsWith('datas.')) continue;
    assert.doesNotMatch(t, /dataHoraCurta|\d{2}\/\d{2}, \d{2}:\d{2}|\\d\{2\}\/\\d\{2\},/, nome);
  }
});

// ---------- Versão, README e exemplo ----------

test('package.json sem export novo; README com a seção, a alterada pelo nome e os contratos', () => {
  assert.equal(Object.keys(pacote.exports).length, 29);
  assert.match(leiame, /### Data sem vírgula, botão na linha de campos e Salvando esmaecido \(v3\.24\.0\)/);
  assert.match(leiame, /\*\*Alterada pelo nome\*\*[^\n]*`dataHoraCurta`/);
  assert.match(leiame, /\*\*Por que a v3\.24\.0 é minor:\*\*/);
  assert.match(leiame, /dataHoraCurta\(i\) {17}\/\/ "27\/10 20:00"/);
  assert.match(leiame, /<time datetime="2026-10-27T23:00:00Z" title="27\/10\/2026 20:00">27\/10 20:00<\/time>/);
  assert.doesNotMatch(leiame, /27\/10, 20:00<\/time>/);
  assert.match(leiame, /<div class="ov-campo-com-botao">/);
  assert.match(leiame, /ignora todo clique e Enter/);
});

const SALVANDO = /aria-busy="true"><span>Salvando<span class="ov-reticencias" aria-hidden="true"><span>\.<\/span><span>\.<\/span><span>\.<\/span><\/span><\/span><\/button>/g;

test('exemplo: a seção da linha de campos nos dois temas, com os seis casos e o Salvando primário e secundário', () => {
  const ini = exemplo.indexOf('<section class="linha-campos">');
  assert.ok(ini > 0);
  const secao = exemplo.slice(ini, exemplo.indexOf('</section>', ini));
  const ms = secao.split('<div class="controles-moldura" ').slice(1);
  assert.deepEqual(ms.map((m) => m.slice(0, m.indexOf('>'))), ['data-theme="escuro"', 'data-theme="claro"']);
  for (const m of ms) {
    assert.ok((m.match(/<div class="ov-campo-com-botao">/g) ?? []).length >= 7);
    assert.match(m, /<input class="ov-campo"[^>]*>\n\s*<button class="ov-btn ov-btn-primario" type="button">Salvar<\/button>/, 'campo + botão com texto');
    assert.match(m, /<button class="ov-btn ov-btn-secundario ov-btn-icone"[^>]*aria-label="Ajuda"/, 'campo + botão de ícone');
    assert.match(m, /aria-invalid="true"[\s\S]*?<span class="ov-erro-campo"/, 'erro embaixo');
    assert.match(m, /data-densidade="linha"[^>]*><button class="ov-btn ov-btn-secundario"/, 'campo de linha + botão');
    assert.match(m, /<textarea class="ov-campo"[^>]*>[^<]*<\/textarea>\n\s*<button class="ov-btn/, 'textarea + botão');
    assert.match(m, /<small>\(opcional\)<\/small><\/label>/, 'rótulo de duas linhas');
    assert.match(m, /<button class="ov-btn ov-btn-primario" type="button" aria-busy="true">/);
    assert.match(m, /<button class="ov-btn ov-btn-secundario" type="button" aria-busy="true">/);
    assert.ok((m.match(SALVANDO) ?? []).length >= 3);
  }
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

const abrir = async (opcoes, fn) => {
  const servidor = await servir();
  const navegador = await chromium.launch();
  try {
    const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', ...opcoes });
    const pagina = await contexto.newPage();
    await pagina.goto(`http://127.0.0.1:${servidor.address().port}/exemplo/index.html`);
    await pagina.waitForFunction(() => document.querySelector('.linha-campos svg') !== null);
    return await fn(pagina);
  } finally {
    await navegador.close();
    servidor.close();
  }
};

// Campo e botões de cada .ov-campo-com-botao da seção, por tema.
const linhas = (p) => p.evaluate(() => [...document.querySelectorAll('.linha-campos .controles-moldura')].map((m) => ({
  tema: m.dataset.theme,
  linhas: [...m.querySelectorAll('.ov-campo-com-botao')].map((l) => {
    const campo = l.querySelector('.ov-campo');
    const c = campo.getBoundingClientRect();
    return {
      tipo: campo.tagName === 'TEXTAREA' ? 'textarea' : campo.dataset.densidade === 'linha' ? 'linha' : 'campo',
      campo: { topo: c.top, base: c.bottom, altura: c.height },
      botoes: [...l.querySelectorAll('.ov-btn')].map((b) => { const r = b.getBoundingClientRect(); return { icone: b.classList.contains('ov-btn-icone'), topo: r.top, base: r.bottom, largura: r.width, altura: r.height }; }),
    };
  }),
})));

const conferirLinhas = (medidas, alturaCampo, alturaLinha) => {
  for (const { tema, linhas: ls } of medidas) {
    assert.ok(ls.length >= 7, tema);
    for (const l of ls) for (const b of l.botoes) {
      const altura = l.tipo === 'linha' ? alturaLinha : alturaCampo;
      assert.equal(b.altura, altura, `${tema} ${l.tipo}`);
      if (b.icone) assert.equal(b.largura, altura, `${tema} ícone quadrado`);
      assert.equal(b.topo, l.campo.topo, `${tema} ${l.tipo}: topo com topo`);
      if (l.tipo === 'textarea') assert.ok(l.campo.altura > altura, `${tema} textarea maior que o botão`);
      else assert.equal(b.base, l.campo.base, `${tema} ${l.tipo}: base com base`);
    }
  }
};

test('medida, no computador: 44 ao lado do campo, 36 ao lado do de linha, topo e base com o campo; o .ov-btn de fora com 36', { skip: chromium ? false : motivo }, async () => {
  await abrir({}, async (p) => {
    conferirLinhas(await linhas(p), 44, 36);
    const fora = await p.evaluate(() => document.querySelector('.linha-campos .controles-moldura > .linha .ov-btn').getBoundingClientRect().height);
    assert.equal(fora, 36);
  });
});

test('medida, no toque (pointer: coarse): 48 ao lado de todo campo, o de ícone 48×48', { skip: chromium ? false : motivo }, async () => {
  await abrir({ viewport: { width: 390, height: 900 }, hasTouch: true, isMobile: true }, async (p) => {
    assert.equal(await p.evaluate(() => matchMedia('(pointer: coarse)').matches), true);
    conferirLinhas(await linhas(p), 48, 48);
    // A tabela do exemplo vira a lista do celular: nada vaza do cartão.
    const vaza = await p.evaluate(() => [...document.querySelectorAll('.linha-campos .tabela-rolagem')].map((c) => {
      const r = c.getBoundingClientRect();
      return { rola: c.scrollWidth > c.clientWidth, fora: [...c.querySelectorAll('.ov-campo, .ov-btn')].some((e) => e.getBoundingClientRect().right > r.right) };
    }));
    assert.deepEqual(vaza, [{ rola: false, fora: false }, { rola: false, fora: false }]);
  });
});

test('medida: o erro que aparece embaixo e o rótulo de duas linhas não movem o botão do campo', { skip: chromium ? false : motivo }, async () => {
  await abrir({}, async (p) => {
    const r = await p.evaluate(async () => {
      const grupo = document.querySelector('#lc-template-escuro').closest('.ov-campo-grupo');
      const medir = () => { const c = grupo.querySelector('.ov-campo').getBoundingClientRect(); const b = grupo.querySelector('.ov-btn').getBoundingClientRect(); return [b.top - c.top, b.bottom - c.bottom, c.top - grupo.getBoundingClientRect().top]; };
      const antes = medir();
      grupo.insertAdjacentHTML('beforeend', '<span class="ov-erro-campo">Já existe um template com esse nome. Escolha outro nome para salvar.</span>');
      const comErro = medir();
      const longo = document.querySelector('#lc-longo-escuro').closest('.ov-campo-grupo');
      const c = longo.querySelector('.ov-campo').getBoundingClientRect(); const b = longo.querySelector('.ov-btn').getBoundingClientRect();
      return { antes, comErro, rotuloLinhas: Math.round(longo.querySelector('.ov-label').getBoundingClientRect().height / 20), longo: [b.top - c.top, b.bottom - c.bottom] };
    });
    assert.deepEqual(r.comErro, r.antes);
    assert.deepEqual(r.antes.slice(0, 2), [0, 0]);
    assert.ok(r.rotuloLinhas >= 2, 'o rótulo quebra em duas linhas');
    assert.deepEqual(r.longo, [0, 0]);
  });
});

// Contraste (WCAG), das cores lidas do navegador.
const luminancia = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const contraste = (a, b) => { const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

test('medida: Salvando focado pelo teclado nos dois temas, com o botão e o conteúdo a 1, só o fundo a .6 e o anel inteiro (≥ 3:1)', { skip: chromium ? false : motivo }, async () => {
  await abrir({}, async (p) => {
    for (const tema of ['escuro', 'claro']) {
      for (const variante of ['primario', 'secundario']) {
        const botao = p.locator(`.linha-campos .controles-moldura[data-theme="${tema}"] > .linha .ov-btn-${variante}[aria-busy="true"]`);
        await botao.scrollIntoViewIfNeeded();
        const info = await botao.evaluate((b) => {
          b.focus({ focusVisible: true });
          const cs = getComputedStyle(b), antes = getComputedStyle(b, '::before'), r = b.getBoundingClientRect();
          return { focado: document.activeElement === b, visivel: b.matches(':focus-visible'), disabled: b.disabled, opacidade: cs.opacity, conteudo: getComputedStyle(b.firstElementChild).opacity, fundo: antes.opacity, outline: cs.outlineStyle, x: r.left + 12, y: r.top };
        });
        assert.deepEqual([info.focado, info.visivel, info.disabled, info.opacidade, info.conteudo, info.fundo, info.outline], [true, true, false, '1', '1', '0.6', 'solid'], `${tema} ${variante}`);
        // Uma coluna de pixels acima do botão: o anel (2px, a 2px da borda) e a superfície.
        const png = await p.screenshot({ clip: { x: info.x, y: info.y - 10, width: 1, height: 10 } });
        const px = await p.evaluate(async (b64) => { const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return [...x.getImageData(0, 0, 1, img.height).data]; }, png.toString('base64'));
        const cor = (k) => px.slice(k * 4, k * 4 + 3);
        assert.ok(contraste(cor(7), cor(1)) >= 3, `${tema} ${variante}: anel ${contraste(cor(7), cor(1)).toFixed(2)}:1`);
      }
    }
  });
});

test('medida: disabled e aria-busy juntos ficam só com o .6 do disabled (sem ::before nem conteúdo a .6; o cursor de antes)', { skip: chromium ? false : motivo }, async () => {
  await abrir({}, async (p) => {
    const r = await p.evaluate(() => {
      const linha = document.querySelector('.linha-campos .controles-moldura > .linha');
      linha.insertAdjacentHTML('beforeend', '<button class="ov-btn ov-btn-secundario" type="button" disabled aria-busy="true"><span>Carregando</span></button>');
      const b = linha.lastElementChild;
      return { botao: getComputedStyle(b).opacity, conteudo: getComputedStyle(b.firstElementChild).opacity, antes: getComputedStyle(b, '::before').content, cursor: getComputedStyle(b).cursor };
    });
    assert.deepEqual(r, { botao: '0.6', conteudo: '1', antes: 'none', cursor: 'progress' });
  });
});

// v3.24.1 (achado do Salim nas capturas da Bordo, decidido em 04/11): no
// modo foco, parado, o painel começa na altura do topo da lista; só grudado
// ao rolar fica a 8px da barra superior (o top do sticky). Patch: a fixture
// da v3.24.0 (`test/fixtures/janelas-v3.24.0.css`, da tag, fixa) fica igual
// regra a regra, fora a alterada pelo nome (a margem do painel do modo foco).
// Desde a v3.24.2, o controles daqui é a fixture da v3.24.1 (conferida pelo
// hash), e a versão e a tag ficam com o teste da versão mais nova. Desde a
// v3.24.3, as janelas daqui são a fixture da v3.24.2 (os mesmos bytes da
// v3.24.1), conferida pelo hash.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { problemasDeBase, regras, seletores, semComentario } from '../scripts/css-regras.mjs';

// Desde a v3.25.0, estes arquivos são lidos pelas fixtures da v3.24.3 (os
// bytes da tag, fixos): teste de versão passada compara fixture com fixture.
const DA_V3243 = {
  'css/impressao.css': 'test/fixtures/impressao-v3.24.3.css',
  'css/relatorio.css': 'test/fixtures/relatorio-v3.24.3.css',
  'css/telas.css': 'test/fixtures/telas-v3.24.3.css',
  'css/janelas.css': 'test/fixtures/janelas-v3.24.3.css',
  'tokens/tokens.json': 'test/fixtures/tokens-v3.24.3.json',
};
const url = (p) => new URL(`../${DA_V3243[p] ?? p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');

const janelas = ler('test/fixtures/janelas-v3.24.2.css');
const antes = ler('test/fixtures/janelas-v3.24.0.css');

const COMPUTADOR = '@media (min-width: 1024px)';
const PAINEL = '[data-painel="foco"]:has(> .ov-painel) > .ov-painel';

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- patch: tudo da v3.24.0 igual, fora a alterada pelo nome ----------

const ALTERADAS = {
  [`${COMPUTADOR}|${PAINEL}`]: ['position: sticky', 'top: calc(var(--ov-barra-superior) + 8px)', 'flex: 1 1 0', 'width: auto', 'min-width: 520px',
    'height: calc(100vh - var(--ov-barra-superior) - 16px)', 'height: calc(100dvh - var(--ov-barra-superior) - 16px)', 'margin: 0 8px 8px 0',
    'background: var(--ov-superficie-elevada)', 'border: 1px solid var(--ov-borda-forte)', 'border-radius: var(--ov-raio-lg)', 'box-shadow: var(--ov-sombra-2)'],
};

test('patch: toda regra do janelas.css da v3.24.0 igual, fora a margem do painel do modo foco', () => {
  for (const r of regras(antes)) {
    for (const s of r.seletores) {
      const chave = `${r.media}|${s}`;
      if (s.startsWith('@')) { assert.ok(seletores(janelas).has(s), `sumiu: ${s}`); continue; }
      if (chave in ALTERADAS) continue;
      assert.deepEqual(declaracoesEm(janelas, r.media, s), declaracoesEm(antes, r.media, s), chave);
    }
  }
  // Nada nasce nem some, e a ordem é a mesma.
  assert.deepEqual(chaves(janelas), chaves(antes));
});

test('a alterada pelo nome: só a margem de cima vai a 0; o top e a altura do sticky ficam', () => {
  const [chave] = Object.keys(ALTERADAS);
  const agora = declaracoesEm(janelas, COMPUTADOR, PAINEL);
  assert.deepEqual(agora, ALTERADAS[chave]);
  const era = declaracoesEm(antes, COMPUTADOR, PAINEL);
  assert.deepEqual(era.filter((d, i) => d !== agora[i]), ['margin: 8px 8px 8px 0']);
  assert.deepEqual(agora.filter((d, i) => d !== era[i]), ['margin: 0 8px 8px 0']);
});

test('janelas.css continua importável sozinho, sem outline: none nem !important novo', () => {
  assert.deepEqual(problemasDeBase('janelas.css', janelas), []);
  assert.doesNotMatch(janelas, /outline:\s*(none|0)\b/);
  const importantes = (t) => (semComentario(t).match(/!important/g) ?? []).length;
  assert.equal(importantes(janelas), importantes(antes));
});

test('os outros CSS, o tokens.json e os js com os bytes da v3.24.0; a fixture da tag', () => {
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
  assert.deepEqual(readdirSync(url('css')).filter((n) => n.endsWith('.css')).sort(), [...Object.keys(CSS), 'controles', 'janelas'].map((n) => `${n}.css`).sort(), 'nenhum CSS nasce nem some');
  for (const [nome, sha] of Object.entries(CSS)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
  assert.equal(sha256('tokens/tokens.json'), '00e88f37d561d821f96fa505b1cd794326d70bb5df6453a531e24cf667463b1d');
  const JS = {
    'alteracoes-nucleo': '3275de25a16812f027b05c60b8de52ea78eb9bce2143166437241c4a5b62cc71',
    camada: '45a04d3a63f1ccf2910e6cc347ebc01efe64182bcf30489921f4fb93e8a66c69',
    datas: '553a02c5a53509b091d31b5b05f22d3957bd81b1bfba26f0c29a907cc4d15eea',
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
  assert.deepEqual(readdirSync(url('js')).filter((n) => n.endsWith('.js')).map((n) => n.slice(0, -3)).sort(), Object.keys(JS).sort(), 'nenhum js nasce nem some');
  for (const [nome, sha] of Object.entries(JS)) assert.equal(sha256(`js/${nome}.js`), sha, nome);
  assert.equal(sha256('test/fixtures/janelas-v3.24.0.css'), 'ca9b305c456142c5fbca4c9d6d04f44d38ebcdb116251f99d7f1593ef5acc8e3');
  assert.equal(sha256('test/fixtures/janelas-v3.24.2.css'), 'b58dbd1036562b661422456fb185117d0286470ea02ec74494bb636e4d16fdae');
  assert.equal(sha256('test/fixtures/controles-v3.24.1.css'), '0ae47b7685f1f6be95e2836f917e0b35692fded9908a21b9016880b8d855b12b');
});

// ---------- Versão e README ----------

test('package.json sem export novo; README com a seção, a alterada pelo nome e o que muda na tela', () => {
  assert.equal(Object.keys(pacote.exports).length, 29);
  assert.match(leiame, /### Painel do modo foco alinhado ao topo da lista \(v3\.24\.1\)/);
  assert.match(leiame, /\*\*Alterada pelo nome\*\*[^\n]*`margin: 8px 8px 8px 0` → `margin: 0 8px 8px 0`/);
  assert.match(leiame, /\*\*Por que a v3\.24\.1 é patch:\*\*/);
  assert.match(leiame, /\*\*O que muda na tela dos apps ao adotar:\*\* em todo modo foco — Pessoas, Convites e Templates da Bordo, Histórico do Paradas —, o painel parado alinha ao topo da lista/);
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

// As molduras do modo foco com o painel aberto (escuro e claro). A lista é
// alongada só na página medida (o exemplo não muda), para a área ser mais
// alta que o painel e o sticky grudar ao rolar, como numa lista real.
const medirFoco = async (largura) => {
  const servidor = await servir();
  const navegador = await chromium.launch();
  try {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: 'reduce' });
    const pagina = await contexto.newPage();
    await pagina.goto(`http://127.0.0.1:${servidor.address().port}/exemplo/index.html`);
    await pagina.waitForFunction(() => document.querySelector('.foco svg') !== null);
    const medir = () => [...document.querySelectorAll('.foco .moldura')].filter((m) => m.querySelector('[data-painel="foco"] > .ov-painel')).map((m) => {
      const area = m.querySelector('[data-painel="foco"]');
      const p = area.querySelector(':scope > .ov-painel').getBoundingClientRect();
      const l = area.querySelector(':scope > :not(.ov-painel)').getBoundingClientRect();
      const b = m.querySelector('.ov-superior').getBoundingClientRect();
      return { tema: m.dataset.theme, painelMenosLista: p.top - l.top, painelMenosBarra: p.top - b.bottom, fundoNaJanela: innerHeight - (b.height + 8 + p.height) };
    });
    await pagina.evaluate(() => {
      for (const tbody of document.querySelectorAll('.foco [data-painel="foco"] tbody')) {
        const linhas = [...tbody.rows];
        for (let i = 0; i < 5; i++) for (const l of linhas) { const c = l.cloneNode(true); c.removeAttribute('aria-selected'); tbody.append(c); }
      }
    });
    const parado = await pagina.evaluate(medir);
    await pagina.evaluate(() => { for (const c of document.querySelectorAll('.foco .moldura .ov-conteudo')) c.scrollTop = 600; });
    const rolado = await pagina.evaluate(medir);
    return { parado, rolado };
  } finally {
    await navegador.close();
    servidor.close();
  }
};

for (const largura of [1024, 1440]) {
  test(`medida, a ${largura}, nos dois temas: parado, o painel no topo da lista (0); rolado, a 8 da barra e a 8 do pé da janela`, { skip: chromium ? false : motivo }, async () => {
    const { parado, rolado } = await medirFoco(largura);
    assert.deepEqual(parado.map((m) => m.tema), ['escuro', 'claro']);
    assert.deepEqual(rolado.map((m) => m.tema), ['escuro', 'claro']);
    for (const m of parado) assert.equal(m.painelMenosLista, 0, `${m.tema} parado`);
    for (const m of rolado) {
      assert.equal(m.painelMenosBarra, 8, `${m.tema} rolado`);
      // A altura (100dvh - barra - 16) deixa 8 embaixo quando grudado.
      assert.equal(m.fundoNaJanela, 8, `${m.tema} pé`);
    }
  });
}

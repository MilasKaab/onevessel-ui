// v3.23.0 (AJ8, opção a, decidida pelo Salim em 03/11): entre 1024 e 1279px
// de janela, a lateral se recolhe sozinha com o painel aberto no modo foco e
// volta ao estado de antes ao fechar. Minor: uma função e duas constantes
// novas no fim do js/lateral-nucleo.js (lateralNoFoco, FOCO_DE, FOCO_ATE);
// o que já estava no arquivo fica com os bytes da v3.22.0 (a fixture, da
// tag). Nenhum CSS nem token muda. O comportamento da função está no
// test/lateral-nucleo.test.mjs; aqui, os bytes, o README e o exemplo. Desde
// a v3.24.0, os controles, as janelas e o datas.js daqui são as fixtures da
// v3.23.0 (fixture com fixture), e a versão e a tag ficam com o teste da
// versão mais nova.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');
const exemplo = ler('exemplo/index.html');

// ---------- minor: nada de antes muda ----------

test('os CSS, o tokens.json e os outros js com os bytes da v3.22.0', () => {
  const CSS = {
    casca: 'dec8032af2c2ca28e82bdfe576d867610c546bb768a9fdc0a1728e24ae0be338',
    controles: 'c56d3e940bd8045e11217414606972c15c5740ceefa906c4c658590e6f95da92',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    janelas: 'c5f04f85a5c1c313affd658e7689485b10f2ae66b174a05bb88292359459b45b',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    telas: '1c98875ecc5f9cab5a28332d87b9089153465b9c74884f8f505fdae09c0c83c4',
    tokens: 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92',
  };
  assert.deepEqual(readdirSync(url('css')).filter((n) => n.endsWith('.css')).sort(), Object.keys(CSS).map((n) => `${n}.css`).sort(), 'nenhum CSS nasce nem some');
  const fonteCss = (nome) => (['controles', 'janelas'].includes(nome) ? `test/fixtures/${nome}-v3.23.0.css` : `css/${nome}.css`);
  for (const [nome, sha] of Object.entries(CSS)) assert.equal(sha256(fonteCss(nome)), sha, nome);
  assert.equal(sha256('tokens/tokens.json'), '00e88f37d561d821f96fa505b1cd794326d70bb5df6453a531e24cf667463b1d');
  const JS = {
    'alteracoes-nucleo': '3275de25a16812f027b05c60b8de52ea78eb9bce2143166437241c4a5b62cc71',
    camada: '45a04d3a63f1ccf2910e6cc347ebc01efe64182bcf30489921f4fb93e8a66c69',
    datas: '72d30b9aa1d5e87567df5bc1c336b7d27d03140e29849dc7cd96f82ac626d30f',
    'filtro-nucleo': 'e261b28b16cf397aa957baef59e7cec2e1fdfa5c02d3e87c01d6a64dbb302ad5',
    'foco-preso': 'f9e36b7575c949c5d97ec1286f76cc9e5c84f73647201372dc646cfe35e7052c',
    'menu-nucleo': '794ddaefa8f7f130e732fa3f26dfa36389179de70f99c840f826336c3350f0da',
    'paleta-nucleo': '79882b9d8f636c4daec672b2475474ee999f56d0240cc0b525d30dad4fbfc7fc',
    'teclas-da-lista': 'e8c4ea0a969926a1c21c487ff6d358c07b44734323f6abc5894570c7c2bc3e79',
    'teclas-da-tabela': 'fb950d7d9178a5ec6a0cc9e25eb17c6c5548838483f720474beee2e56d4dd9dd',
    'teclas-das-abas': '92daaf05a306d2f767ec2348d333ad0763a42d00105fa75f01e9e4962e1d9964',
    'teclas-do-painel': '890e36d9f5d26cdb9f6af6d16961bccc1b53ad4b910aea1536d63f9e71714c6d',
    texto: '95f98b2d6ba6e3215deb415ceaf8d22b65a7126b45ded877d3b7028dc3e2205d',
    'toast-nucleo': 'e647098ae7813e085e5094afd28775442ec1241e75a7106c43a0c8fb23226dce',
  };
  const fonteJs = (nome) => (nome === 'datas' ? `test/fixtures/${nome}-v3.23.0.js` : `js/${nome}.js`);
  for (const [nome, sha] of Object.entries(JS)) assert.equal(sha256(fonteJs(nome)), sha, nome);
  const js = readdirSync(url('js')).filter((n) => n.endsWith('.js')).map((n) => n.slice(0, -3)).sort();
  assert.deepEqual(js, [...Object.keys(JS), 'lateral-nucleo'].sort(), 'nenhum js nasce nem some; só o lateral-nucleo muda');
});

test('lateral-nucleo: o .js e o .d.ts da v3.22.0 inteiros no começo (só acrescenta); as fixtures da tag', () => {
  assert.equal(sha256('test/fixtures/lateral-nucleo-v3.22.0.js'), 'b0b7ac1a063ee91e83420b10cbab0e6950bf61fa0aff7e4a9ad25eacfa325a01');
  assert.equal(sha256('test/fixtures/lateral-nucleo-v3.22.0.d.ts'), '0a3bf73f6eba696ea75d1850d62fc8d4f8c9c8763926369d82eaee61b3c5509e');
  for (const ext of ['js', 'd.ts']) {
    const antes = ler(`test/fixtures/lateral-nucleo-v3.22.0.${ext}`);
    const agora = ler(`js/lateral-nucleo.${ext}`);
    assert.ok(agora.length > antes.length, ext);
    assert.equal(agora.slice(0, antes.length), antes, ext);
  }
});

// O que o .d.ts declara para o tempo de execução (função e constante).
const declarados = (dts) => [...dts.matchAll(/^export declare (?:function|const) (\w+)/gm)].map((m) => m[1]).sort();

test('lateral-nucleo exporta exatamente o que o .d.ts declara, com lateralNoFoco, FOCO_DE e FOCO_ATE', async () => {
  const modulo = await import('../js/lateral-nucleo.js');
  const dts = ler('js/lateral-nucleo.d.ts');
  assert.deepEqual(Object.keys(modulo).sort(), declarados(dts));
  for (const nome of ['lateralNoFoco', 'FOCO_DE', 'FOCO_ATE']) assert.ok(nome in modulo, nome);
  assert.match(dts, /export declare function lateralNoFoco\(situacao: LateralNoFoco\): EstadoDaLateral;/);
  assert.match(dts, /mexeuComPainelAberto\?: boolean;/);
  // A função não toca no armazenamento.
  const corpo = ler('js/lateral-nucleo.js').slice(ler('test/fixtures/lateral-nucleo-v3.22.0.js').length);
  assert.doesNotMatch(corpo.replace(/\/\*\*[\s\S]*?\*\//g, ''), /storage|setItem|getItem|gravarLateral|alternarLateral/);
});

// ---------- Versão, README e exemplo ----------

test('package.json sem export novo; README com a seção da versão e o contrato', () => {
  assert.deepEqual(pacote.exports['./js/lateral-nucleo.js'], { types: './js/lateral-nucleo.d.ts', default: './js/lateral-nucleo.js' });
  assert.match(leiame, /### Lateral com o painel no modo foco \(v3\.23\.0\)/);
  assert.match(leiame, /\*\*Por que a v3\.23\.0 é minor:\*\*/);
  assert.match(leiame, /import \{ lerLateral, alternarLateral, aplicarLateral, botaoDaLateral, ouvirLateral, lateralNoFoco \} from 'onevessel-ui\/js\/lateral-nucleo\.js'/);
  assert.match(leiame, /lateralNoFoco\(\{ largura: window\.innerWidth, painelAberto, lateralDaPessoa, mexeuComPainelAberto \}\)/);
  assert.match(leiame, /`js\/lateral-nucleo\.js` \|[^\n]*`lateralNoFoco` desde a v3\.23\.0/);
});

test('exemplo: o núcleo com lateralNoFoco, por casca, e o painel do modo foco que fecha e abre nos dois temas', () => {
  assert.match(exemplo, /import\('\.\.\/js\/lateral-nucleo\.js'\)\.then\(\(\{[^}]*lateralNoFoco[^}]*\}\)/);
  assert.match(exemplo, /lateralNoFoco\(\{ largura: window\.innerWidth, painelAberto: painelAberto\(casca\), lateralDaPessoa: daPessoa, mexeuComPainelAberto: mexeu\.has\(casca\) \}\)/);
  assert.match(exemplo, /window\.addEventListener\('resize', \(\) => mostrar\(\)\)/);
  const ini = exemplo.indexOf('<section class="foco">');
  const secao = exemplo.slice(ini, exemplo.indexOf('</section>', ini));
  for (const tema of ['escuro', 'claro']) assert.match(secao, new RegExp(`Modo foco · tema ${tema} · painel aberto`), tema);
  assert.match(secao, /lateralNoFoco<\/code>, v3\.23\.0/);
});

// ---------- Medida no navegador (o exemplo servido, para o import do js) ----------

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

// O import dinâmico não roda em file://: um servidor só de leitura, na raiz.
const servir = () => new Promise((resolve) => {
  const servidor = createServer((pedido, resposta) => {
    const caminho = normalize(join(RAIZ, decodeURIComponent(new URL(pedido.url, 'http://x').pathname)));
    if (!caminho.startsWith(RAIZ) || !existsSync(caminho)) { resposta.writeHead(404); resposta.end(); return; }
    resposta.writeHead(200, { 'content-type': TIPOS[extname(caminho)] ?? 'application/octet-stream' });
    resposta.end(readFileSync(caminho));
  });
  servidor.listen(0, '127.0.0.1', () => resolve(servidor));
});

const abrir = async (largura, fn, guardado) => {
  const servidor = await servir();
  const navegador = await chromium.launch();
  try {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: 'reduce' });
    if (guardado) await contexto.addInitScript((v) => localStorage.setItem('ov-lateral', v), guardado);
    const pagina = await contexto.newPage();
    await pagina.goto(`http://127.0.0.1:${servidor.address().port}/exemplo/index.html`);
    await pagina.waitForFunction(() => document.querySelector('.ov-casca[data-lateral]') !== null);
    return await fn(pagina);
  } finally {
    await navegador.close();
    servidor.close();
  }
};

// A primeira moldura do modo foco (tema escuro, painel aberto).
// Com movimento reduzido, o onevessel.css dá a tudo uma transição de .01ms:
// a largura chega depois de uns quadros (50ms, como na v3.17.0).
const estado = (p) => p.evaluate(async () => {
  await new Promise((r) => setTimeout(r, 50));
  const moldura = document.querySelector('.foco .moldura');
  const casca = moldura.querySelector('.ov-casca');
  const botao = casca.querySelector('.ov-lateral-alternar');
  return {
    lateral: casca.dataset.lateral,
    largura: casca.querySelector('.ov-lateral').getBoundingClientRect().width,
    painel: moldura.querySelector('[data-painel="foco"] > .ov-painel') !== null,
    expandido: botao.getAttribute('aria-expanded'),
    guardado: localStorage.getItem('ov-lateral'),
  };
});
const clicar = (p, seletor) => p.locator('.foco .moldura').first().locator(seletor).first().click();

test('medida: a 1024 e a 1279, painel aberto recolhe (56px); trocar não mexe; reabrir vale até fechar; fechar volta; nada gravado pelo automático', { skip: chromium ? false : motivo }, async () => {
  for (const largura of [1024, 1279]) {
    const r = await abrir(largura, async (p) => {
      const passos = { aberto: await estado(p) };
      await clicar(p, '[aria-label="Próxima pessoa"]');
      passos.trocou = await estado(p);
      await clicar(p, '.ov-lateral-alternar');
      passos.reabriu = await estado(p);
      await clicar(p, '[aria-label="Próxima pessoa"]');
      passos.trocouDeNovo = await estado(p);
      await clicar(p, '[aria-label="Fechar"]');
      passos.fechou = await estado(p);
      await clicar(p, 'tbody tr:nth-child(3)');
      passos.abriuDeNovo = await estado(p);
      return passos;
    });
    assert.deepEqual(r.aberto, { lateral: 'recolhida', largura: 56, painel: true, expandido: 'false', guardado: null }, `${largura}`);
    assert.equal(r.trocou.lateral, 'recolhida', `${largura}`);
    assert.equal(r.reabriu.lateral, 'aberta', `${largura}`);
    assert.equal(r.reabriu.largura, 240, `${largura}`);
    assert.equal(r.trocouDeNovo.lateral, 'aberta', `${largura}`);
    assert.deepEqual(r.fechou, { lateral: 'aberta', largura: 240, painel: false, expandido: 'true', guardado: 'aberta' }, `${largura}`);
    assert.equal(r.abriuDeNovo.lateral, 'recolhida', `${largura}`);
    assert.equal(r.abriuDeNovo.guardado, 'aberta', `${largura}`);
  }
});

test('medida: a 1280 e a 1023 o painel não mexe na lateral', { skip: chromium ? false : motivo }, async () => {
  for (const largura of [1280, 1023]) {
    const r = await abrir(largura, async (p) => {
      const aberto = await estado(p);
      await clicar(p, '[aria-label="Fechar"]');
      return { aberto, fechado: await estado(p) };
    });
    assert.equal(r.aberto.lateral, 'aberta', `${largura}`);
    assert.equal(r.fechado.lateral, 'aberta', `${largura}`);
    assert.equal(r.aberto.guardado, null, `${largura}`);
    if (largura === 1280) assert.equal(r.aberto.largura, 240);
  }
});

test('medida: a 1100 com a lateral recolhida pela pessoa, abrir e fechar não mudam nada', { skip: chromium ? false : motivo }, async () => {
  const r = await abrir(1100, async (p) => {
    const aberto = await estado(p);
    await clicar(p, '[aria-label="Fechar"]');
    return { aberto, fechado: await estado(p) };
  }, 'recolhida');
  assert.equal(r.aberto.lateral, 'recolhida');
  assert.equal(r.fechado.lateral, 'recolhida');
  assert.equal(r.fechado.guardado, 'recolhida');
});

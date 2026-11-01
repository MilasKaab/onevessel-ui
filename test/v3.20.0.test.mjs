// v3.20.0 (os js/ da rodada de UX: C8, C18, C19, C10 e o bloco D): plural,
// data e hora, teclado das abas, teclado da Lista de cards, núcleo do Menu e
// núcleo do "+ Filtro". Minor: só arquivos novos em js/; nenhum CSS, token
// ou js de antes muda (os bytes da v3.19.0, abaixo). O comportamento de cada
// núcleo está no teste dele (`test/<núcleo>.test.mjs`). Desde a v3.21.0, as
// janelas e as telas daqui são as fixtures da v3.20.0 (fixture com fixture),
// e a versão e a tag ficam com o teste da versão mais nova.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');
const exemplo = ler('exemplo/index.html');

const NOVOS = ['texto', 'datas', 'teclas-das-abas', 'teclas-da-lista', 'menu-nucleo', 'filtro-nucleo'];

test('os CSS, o tokens.json e os js de antes com os bytes da v3.19.0', () => {
  const CSS = {
    casca: 'ff7ed72dda28e8729a7151b0cbdc7a7cea8f63453528f5852c0b4cfc8a54f1dd',
    controles: 'c56d3e940bd8045e11217414606972c15c5740ceefa906c4c658590e6f95da92',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    janelas: '5ffa2125214366a593af8ee7c05be11aee555981b99f35c25f106b0413c44622',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    telas: 'b511610c2f0995607ae0aba8cbbd26f5ebe3e75489e58b245a9561c4b817f4ba',
    tokens: 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92',
  };
  assert.deepEqual(readdirSync(url('css')).filter((n) => n.endsWith('.css')).sort(), Object.keys(CSS).map((n) => `${n}.css`).sort(), 'nenhum CSS nasce nem some');
  const V3200 = ['janelas', 'telas'];
  for (const [nome, sha] of Object.entries(CSS)) assert.equal(sha256(V3200.includes(nome) ? `test/fixtures/${nome}-v3.20.0.css` : `css/${nome}.css`), sha, nome);
  const JS = {
    'alteracoes-nucleo': '3275de25a16812f027b05c60b8de52ea78eb9bce2143166437241c4a5b62cc71',
    camada: '45a04d3a63f1ccf2910e6cc347ebc01efe64182bcf30489921f4fb93e8a66c69',
    'foco-preso': 'f9e36b7575c949c5d97ec1286f76cc9e5c84f73647201372dc646cfe35e7052c',
    'lateral-nucleo': 'b0b7ac1a063ee91e83420b10cbab0e6950bf61fa0aff7e4a9ad25eacfa325a01',
    'paleta-nucleo': '79882b9d8f636c4daec672b2475474ee999f56d0240cc0b525d30dad4fbfc7fc',
    'teclas-da-tabela': 'fb950d7d9178a5ec6a0cc9e25eb17c6c5548838483f720474beee2e56d4dd9dd',
    'teclas-do-painel': '890e36d9f5d26cdb9f6af6d16961bccc1b53ad4b910aea1536d63f9e71714c6d',
    'toast-nucleo': 'e647098ae7813e085e5094afd28775442ec1241e75a7106c43a0c8fb23226dce',
  };
  for (const [nome, sha] of Object.entries(JS)) assert.equal(sha256(`js/${nome}.js`), sha, nome);
  const js = readdirSync(url('js')).filter((n) => n.endsWith('.js')).map((n) => n.slice(0, -3)).sort();
  assert.deepEqual(js, [...Object.keys(JS), ...NOVOS].sort(), 'os js são os de antes e os seis novos');
});

// O que o .d.ts declara para o tempo de execução (função e constante); tipo e
// interface não existem no módulo.
const declarados = (dts) => [...dts.matchAll(/^export declare (?:function|const) (\w+)/gm)].map((m) => m[1]).sort();

for (const nome of NOVOS) {
  test(`js/${nome}.js exporta exatamente o que o .d.ts declara, e está em exports`, async () => {
    const modulo = await import(`../js/${nome}.js`);
    assert.deepEqual(Object.keys(modulo).sort(), declarados(ler(`js/${nome}.d.ts`)));
    assert.deepEqual(pacote.exports[`./js/${nome}.js`], { types: `./js/${nome}.d.ts`, default: `./js/${nome}.js` });
  });
}

test('README com a seção da versão e um exemplo de cada núcleo', () => {
  assert.match(leiame, /### Texto, datas e teclado \(v3\.20\.0\)/);
  assert.match(leiame, /\*\*Por que a v3\.20\.0 é minor:\*\*/);
  for (const nome of NOVOS) {
    assert.match(leiame, new RegExp(`\\| \`js/${nome}\\.js\` \\|`), `${nome} na tabela do js/`);
    assert.match(leiame, new RegExp(`from 'onevessel-ui/js/${nome}\\.js'`), `${nome} com exemplo de uso`);
  }
  assert.match(leiame, /tabindex="-1"/, 'como o app tira os controles dos outros cards do Tab');
});

test('exemplo: as abas da página pelo núcleo das abas', () => {
  assert.match(exemplo, /import\('\.\.\/js\/teclas-das-abas\.js'\)/);
});

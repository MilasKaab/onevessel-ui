// v3.26.0 (MC17, decidido pelo Salim em 21/11): os núcleos do tema, do
// cookie do navio e da barra inferior, que a Bordo e o Paradas tinham iguais.
// Minor: só três arquivos novos em js/ (cada um com o .d.ts e a entrada em
// exports); nenhum CSS, token, preset nem js/ de antes muda (os bytes da
// v3.25.0, abaixo). O comportamento de cada núcleo está no teste dele
// (`test/<núcleo>.test.mjs`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');

const NOVOS = ['tema-nucleo', 'embarcacao-nucleo', 'barra-nucleo'];

const DA_V3250 = {
  'css/casca.css': 'dec8032af2c2ca28e82bdfe576d867610c546bb768a9fdc0a1728e24ae0be338',
  'css/controles.css': 'af238d42d9e6a8393bd92ab8a3e24f7146932e3dd101c800b4303edb552ae4c5',
  'css/fontes.css': '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
  'css/impressao.css': 'caa847f2a4f114828ac12e95ddbc68e47b89ec6b616bf5014121d0f28c52deaf',
  'css/janelas.css': '29fd0d108082adc91176bb2858d7faa0d57a8e4daf056954928102d7e1ea38b7',
  'css/onevessel.css': 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
  'css/previa.css': '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
  'css/relatorio.css': '4e541be44ca429a6f113b4fe29478477f9c914af709fddcd2f4556cf22ac50b1',
  'css/telas.css': 'aca9e4153479af32f7a1170dc146e40e41705a5b9ba244994e56be27a6f6e177',
  'css/tokens.css': 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92',
  'js/alteracoes-nucleo.js': '3275de25a16812f027b05c60b8de52ea78eb9bce2143166437241c4a5b62cc71',
  'js/camada.js': '45a04d3a63f1ccf2910e6cc347ebc01efe64182bcf30489921f4fb93e8a66c69',
  'js/datas.js': '553a02c5a53509b091d31b5b05f22d3957bd81b1bfba26f0c29a907cc4d15eea',
  'js/filtro-nucleo.js': 'e261b28b16cf397aa957baef59e7cec2e1fdfa5c02d3e87c01d6a64dbb302ad5',
  'js/foco-preso.js': 'f9e36b7575c949c5d97ec1286f76cc9e5c84f73647201372dc646cfe35e7052c',
  'js/lateral-nucleo.js': '7dba92ae5496d8c33f1a9503f8c6157827bf8e7358aabd22710d22d8ca6e7323',
  'js/menu-nucleo.js': '794ddaefa8f7f130e732fa3f26dfa36389179de70f99c840f826336c3350f0da',
  'js/paleta-nucleo.js': '79882b9d8f636c4daec672b2475474ee999f56d0240cc0b525d30dad4fbfc7fc',
  'js/teclas-da-lista.js': 'e8c4ea0a969926a1c21c487ff6d358c07b44734323f6abc5894570c7c2bc3e79',
  'js/teclas-da-tabela.js': 'fb950d7d9178a5ec6a0cc9e25eb17c6c5548838483f720474beee2e56d4dd9dd',
  'js/teclas-das-abas.js': '92daaf05a306d2f767ec2348d333ad0763a42d00105fa75f01e9e4962e1d9964',
  'js/teclas-do-painel.js': '890e36d9f5d26cdb9f6af6d16961bccc1b53ad4b910aea1536d63f9e71714c6d',
  'js/texto.js': '95f98b2d6ba6e3215deb415ceaf8d22b65a7126b45ded877d3b7028dc3e2205d',
  'js/toast-nucleo.js': 'e647098ae7813e085e5094afd28775442ec1241e75a7106c43a0c8fb23226dce',
  'js/alteracoes-nucleo.d.ts': 'b802858cef25fd528dcf1ef15eb2165eb4aa73d8376a7c4f55044046c5c89c7a',
  'js/camada.d.ts': '6bdde06e7102cdd9f324d54b3eee2bb78be3cb9c5b158378c4cab09277682cb2',
  'js/datas.d.ts': 'f03e597347ab9f6153cdee5c0d8134ee444b19bcfd7c194805f0b66eed14b181',
  'js/filtro-nucleo.d.ts': 'eea598afc57ba2c33fa7f73c45a998e07ae0dc466a6e30613e94506d64a8c3c2',
  'js/foco-preso.d.ts': '4f4282234d45a8c9402ea2a5e71f568d6ec5b79d3f5579cd36f3b50209254821',
  'js/lateral-nucleo.d.ts': '22ba640a788d8bab28d97b1109b66b6fdde1aab9e001b422ba1c5f8dcf234485',
  'js/menu-nucleo.d.ts': 'c5d69017f5d9b5a1827f1ee5175f697dcbcbf49d356d7b692fd3e6fc87a16cc8',
  'js/paleta-nucleo.d.ts': 'a0117772ce0439bfbf044397e11e4d61db38afa831a7d82e4ea7be82ba1b9450',
  'js/teclas-da-lista.d.ts': 'efb47465a1bde7f5dbd65b1a5296955d4ecd2d74e18b675099e87c8d136a03e4',
  'js/teclas-da-tabela.d.ts': '7c7c3f334d54ecb0810939914e819a1929afb7447ebfe8aa2a8f4497934da7f3',
  'js/teclas-das-abas.d.ts': '0ab8a7a0bc0fbdb435bca3a844403bf6fb492000e8d4c26dd40f43c11b304c6c',
  'js/teclas-do-painel.d.ts': '5ea8b24465c5f75a452affc2cfbc858e0cbdc33c458b548b1b02dd93cb8751fc',
  'js/texto.d.ts': '3ab09a6ceeaefea03a0e60b0aa423b3a4ea80f5b70f094eea03e4a1e294b1b09',
  'js/toast-nucleo.d.ts': '3a017e3c0e3c2d2a14787aa0d3074b1f1ff57f747cb9595800e691a186e5448d',
  'tokens/tokens.json': '9b3a76c02c3e729ea9a653a9bd47da59d774098084050bb627a1b244e126198e',
  'tailwind/preset.js': '9adaa96a15e4741e0aa5c9386bc87dd894159e7e04774ae854a5b0c04eb4af0a',
};

test('os CSS, o tokens.json, o preset e os js/ de antes com os bytes da v3.25.0; só os três nascem', () => {
  for (const [arquivo, sha] of Object.entries(DA_V3250)) assert.equal(sha256(arquivo), sha, arquivo);
  const css = readdirSync(url('css')).filter((n) => n.endsWith('.css')).map((n) => `css/${n}`).sort();
  assert.deepEqual(css, Object.keys(DA_V3250).filter((a) => a.startsWith('css/')).sort(), 'nenhum CSS nasce nem some');
  const js = readdirSync(url('js')).filter((n) => /\.(js|d\.ts)$/.test(n)).map((n) => `js/${n}`).sort();
  const esperados = [...Object.keys(DA_V3250).filter((a) => a.startsWith('js/')), ...NOVOS.flatMap((n) => [`js/${n}.js`, `js/${n}.d.ts`])].sort();
  assert.deepEqual(js, esperados, 'os js/ são os de antes e os três novos');
});

// O que o .d.ts declara para o tempo de execução (função e constante); tipo e
// interface não existem no módulo.
const declarados = (dts) => [...dts.matchAll(/^export declare (?:function|const) (\w+)/gm)].map((m) => m[1]).sort();

for (const nome of NOVOS) {
  test(`js/${nome}.js exporta exatamente o que o .d.ts declara, sem import e sem DOM, e está em exports`, async () => {
    const modulo = await import(`../js/${nome}.js`);
    const fonte = ler(`js/${nome}.js`).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.deepEqual(Object.keys(modulo).sort(), declarados(ler(`js/${nome}.d.ts`)));
    assert.doesNotMatch(fonte, /^\s*import\s/m, 'nenhum import');
    assert.doesNotMatch(fonte, /\b(document|window|localStorage|matchMedia)\s*\./, 'o DOM vem de quem chama');
    assert.deepEqual(pacote.exports[`./js/${nome}.js`], { types: `./js/${nome}.d.ts`, default: `./js/${nome}.js` });
  });
}

test('package.json 3.26.0 com os três exports novos depois do filtro-nucleo; README com a tag, a seção e um exemplo de cada', () => {
  assert.equal(pacote.version, '3.26.0');
  const chaves = Object.keys(pacote.exports);
  assert.equal(chaves.length, 32);
  const i = chaves.indexOf('./js/filtro-nucleo.js');
  assert.deepEqual(chaves.slice(i + 1, i + 4), NOVOS.map((n) => `./js/${n}.js`));
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.26\.0"/);
  assert.match(leiame, /### Tema, cookie do navio e barra inferior em js\/ \(v3\.26\.0\)/);
  assert.match(leiame, /\*\*Por que a v3\.26\.0 é minor:\*\*/);
  assert.match(leiame, /\*\*O que muda na tela dos apps ao adotar:\*\* nada/);
  assert.match(leiame, /\*\*A regra D4\*\*[^\n]*\*\*fica em cada app\*\*/);
  assert.match(leiame, /migram: \['claro'\]/, 'o caso do Materiais');
  for (const nome of NOVOS) {
    assert.match(leiame, new RegExp(`\\| \`js/${nome}\\.js\` \\|`), `${nome} na tabela do js/`);
    assert.match(leiame, new RegExp(`from 'onevessel-ui/js/${nome}\\.js'`), `${nome} com exemplo de uso`);
  }
});

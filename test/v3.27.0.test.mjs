// v3.27.0 (ML7 e RP3, decididos em 23/11; GV1–GV12 como a recomendação do
// levantamento): a Gaveta no janelas.css, o token --ov-gaveta e o ícone do
// .ov-btn que não encolhe no controles.css. Minor: as fixtures da v3.26.0
// (`test/fixtures/*-v3.26.0.*`, da tag, fixas) ficam iguais regra a regra;
// o que nasce é a lista, e nada muda de valor. O único seletor que sai é o
// :where(...) de box-sizing, que volta com o .ov-gaveta a mais.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { problemasDeBase, regras, seletores, semComentario } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');
const exemplo = ler('exemplo/index.html');

const ATUAL = { janelas: ler('css/janelas.css'), controles: ler('css/controles.css') };
const ANTES = { janelas: ler('test/fixtures/janelas-v3.26.0.css'), controles: ler('test/fixtures/controles-v3.26.0.css') };

const MOVEL = '@media (max-width: 767px)';
const REDUZIDO = '@media (prefers-reduced-motion: reduce)';
const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// Toda regra da fixture igual, fora as que saem; o que nasce é exatamente a
// lista, e as velhas ficam na mesma ordem. Nada é alterado.
function minor(nome, { saem = [], nascem = [] }) {
  const atual = ATUAL[nome];
  const antes = ANTES[nome];
  for (const r of regras(antes)) {
    for (const s of r.seletores) {
      const chave = `${r.media}|${s}`;
      if (s.startsWith('@')) { assert.ok(seletores(atual).has(s), `${nome}: sumiu ${s}`); continue; }
      if (saem.includes(chave)) { assert.equal(declaracoesEm(atual, r.media, s), null, `${nome}: devia sair ${chave}`); continue; }
      assert.deepEqual(declaracoesEm(atual, r.media, s), declaracoesEm(antes, r.media, s), `${nome}: ${chave}`);
    }
  }
  const velhas = chaves(antes).filter((c) => !saem.includes(c));
  const agora = chaves(atual);
  assert.deepEqual(agora.filter((c) => !velhas.includes(c)), nascem, `${nome}: o que nasce`);
  assert.deepEqual(agora.filter((c) => velhas.includes(c)), velhas, `${nome}: a ordem das velhas`);
}

// ---------- Gaveta (janelas.css) ----------

const caixas = (texto) => regras(texto).find((r) => r.seletores.length === 1 && r.seletores[0].startsWith(':where(.ov-dialogo,'));
const ONDE_ANTES = caixas(ANTES.janelas).seletores[0];
const ONDE = caixas(ATUAL.janelas).seletores[0];
const GAVETA = '.ov-gaveta';
const RODAPE = '.ov-gaveta-rodape';
const DETALHE = '.ov-gaveta[data-altura="detalhe"]';

test('janelas.css: nascem só a Gaveta e o .ov-gaveta no :where e no movimento reduzido; nada de antes muda de valor', () => {
  minor('janelas', {
    saem: [`|${ONDE_ANTES}`],
    nascem: [
      `|${ONDE}`,
      `|${GAVETA}`, `|${GAVETA} > .ov-folha-alca`, `|${RODAPE}`, '|@keyframes ovEntraDaDireita',
      `${MOVEL}|${GAVETA}`, `${MOVEL}|${DETALHE}`, `${MOVEL}|${DETALHE} > .ov-folha-alca`, `${MOVEL}|${RODAPE}`, `${MOVEL}|${RODAPE} > *`, `${MOVEL}|${RODAPE} > .ov-btn`,
      `${REDUZIDO}|${GAVETA}`,
    ],
  });
});

test('o :where(...) de box-sizing é o de antes com o .ov-gaveta no fim, e a mesma declaração', () => {
  const lista = (s) => s.slice(':where('.length, -1).split(',').map((x) => x.trim());
  assert.deepEqual(lista(ONDE), [...lista(ONDE_ANTES), GAVETA]);
  assert.deepEqual(declaracoesEm(ATUAL.janelas, '', ONDE), ['box-sizing: border-box']);
  assert.deepEqual(declaracoesEm(ANTES.janelas, '', ONDE_ANTES), ['box-sizing: border-box']);
});

test('Gaveta a partir de 768px: encostada à direita, 520 pelo token, sem raio, sem 100vh, a camada do Diálogo, a área segura em cima, à direita e embaixo', () => {
  assert.deepEqual(declaracoesEm(ATUAL.janelas, '', GAVETA), [
    'position: fixed', 'top: 0', 'right: 0', 'bottom: 0', 'z-index: var(--ov-z-dialogo)', 'width: var(--ov-gaveta)',
    'display: flex', 'flex-direction: column', 'overflow: hidden',
    'padding-top: env(safe-area-inset-top, 0px)', 'padding-right: env(safe-area-inset-right, 0px)', 'padding-bottom: env(safe-area-inset-bottom, 0px)',
    'background: var(--ov-superficie-elevada)', 'border-left: 1px solid var(--ov-borda-forte)', 'box-shadow: var(--ov-sombra-2)',
    'color: var(--ov-texto)', 'font: var(--ov-fonte-corpo)', 'animation: ovEntraDaDireita .22s cubic-bezier(.32,.72,0,1)',
  ]);
  assert.deepEqual(declaracoesEm(ATUAL.janelas, '', `${GAVETA} > .ov-folha-alca`), ['display: none']);
  assert.deepEqual(declaracoesEm(ATUAL.janelas, '', RODAPE), ['flex: none', 'display: flex', 'justify-content: flex-end', 'gap: 8px', 'padding: 12px 24px', 'border-top: 1px solid var(--ov-borda)']);
  const quadro = semComentario(ATUAL.janelas).match(/@keyframes ovEntraDaDireita\s*\{([\s\S]*?\})\s*\}/)[1].replace(/\s+/g, ' ').trim();
  assert.equal(quadro, 'from { transform: translateX(100%); } to { transform: none; }');
  // Nenhuma regra da Gaveta usa 100vh nem raio no computador, nem desfoque.
  for (const r of regras(ATUAL.janelas).filter((x) => x.seletores.some((s) => s.includes('ov-gaveta')))) {
    assert.doesNotMatch(r.corpo, /backdrop-filter|blur\(/, r.seletores.join());
    if (r.media === '') assert.doesNotMatch(r.corpo, /100vh|border-radius/, r.seletores.join());
  }
});

test('Gaveta abaixo de 768px: Folha cheia por padrão, 90% com alça no detalhe, o rodapé do .ov-folha-rodape', () => {
  // O padding-top do celular troca o da área segura (não soma), e a caixa
  // zera o de baixo: o rodapé já leva o env(safe-area-inset-bottom).
  assert.deepEqual(declaracoesEm(ATUAL.janelas, MOVEL, GAVETA), ['left: 0', 'width: auto', 'padding-top: calc(env(safe-area-inset-top, 0px) + 5px)', 'padding-bottom: 0', 'padding-left: env(safe-area-inset-left, 0px)', 'border-left: 0', 'animation-name: ovSobe']);
  const abaixo = regras(ATUAL.janelas).filter((r) => r.media === MOVEL && r.seletores.some((x) => x.includes('ov-gaveta')));
  assert.equal(abaixo.filter((r) => /padding(-bottom)?:[^;]*safe-area-inset-bottom/.test(r.corpo)).length, 1, 'só o rodapé soma a área segura de baixo');
  assert.ok(declaracoesEm(ATUAL.janelas, MOVEL, RODAPE)[0].includes('env(safe-area-inset-bottom, 0px)'));
  assert.deepEqual(declaracoesEm(ATUAL.janelas, MOVEL, DETALHE), ['top: auto', 'height: 90vh', 'height: 90dvh', 'padding-top: 0', 'border-radius: var(--ov-raio-xl) var(--ov-raio-xl) 0 0']);
  assert.deepEqual(declaracoesEm(ATUAL.janelas, MOVEL, `${DETALHE} > .ov-folha-alca`), ['display: grid', 'flex: none']);
  // A geometria do .ov-folha-rodape: o padding e os botões de 48, mesma largura.
  const folha = declaracoesEm(ATUAL.janelas, '', '.ov-folha-rodape');
  assert.deepEqual(declaracoesEm(ATUAL.janelas, MOVEL, RODAPE), folha.filter((d) => d.startsWith('padding:')));
  for (const s of [`${RODAPE} > *`, `${RODAPE} > .ov-btn`]) {
    assert.deepEqual(declaracoesEm(ATUAL.janelas, MOVEL, s), declaracoesEm(ATUAL.janelas, '', '.ov-folha-rodape > .ov-btn'), s);
  }
  // Movimento reduzido: só aparece, e a regra vem depois da do celular.
  const reduzido = regras(ATUAL.janelas).findIndex((r) => r.media === REDUZIDO && r.seletores.includes(GAVETA));
  const movel = regras(ATUAL.janelas).findIndex((r) => r.media === MOVEL && r.seletores.includes(GAVETA));
  assert.ok(reduzido > movel);
  assert.ok(regras(ATUAL.janelas)[reduzido].corpo.includes('animation-name: ovFade'));
});

test('o miolo do Painel na Gaveta não herda a largura, a Folha nem o modo foco: tudo isso é preso ao .ov-painel', () => {
  for (const r of regras(ATUAL.janelas)) {
    if (!/width|position|height/.test(r.corpo)) continue;
    for (const s of r.seletores) {
      if (/^\.ov-painel-(cab|corpo)$|^\.ov-dados/.test(s)) assert.doesNotMatch(r.corpo, /\b(width|position)\s*:/, s);
    }
  }
});

test('janelas.css e controles.css importáveis sozinhos, sem outline: none nem !important novo', () => {
  const importantes = (t) => (semComentario(t).match(/!important/g) ?? []).length;
  for (const nome of ['janelas', 'controles']) {
    assert.deepEqual(problemasDeBase(`${nome}.css`, ATUAL[nome]), [], nome);
    assert.doesNotMatch(ATUAL[nome], /outline:\s*(none|0)\b/, nome);
    assert.equal(importantes(ATUAL[nome]), importantes(ANTES[nome]), nome);
  }
  assert.match(ATUAL.janelas.slice(0, ATUAL.janelas.indexOf('*/')), /Gaveta/, 'o comentário do topo');
});

// ---------- RP3 (controles.css) ----------

test('controles.css: nasce só o .ov-btn > svg { flex: none }; o .ov-btn-icone svg fica como estava', () => {
  minor('controles', { nascem: ['|.ov-btn > svg'] });
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', '.ov-btn > svg'), ['flex: none']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', '.ov-btn-icone svg'), ['width: 18px', 'height: 18px', 'flex: none']);
});

// ---------- Token ----------

test('tokens.json: nasce só o ov-gaveta (520px, ao lado do ov-dialogo-formulario); o usage do ov-z-dialogo inclui a gaveta', () => {
  const tokens = JSON.parse(ler('tokens/tokens.json'));
  const antes = JSON.parse(ler('test/fixtures/tokens-v3.26.0.json'));
  const grupo = Object.values(tokens).find((g) => g.tokens?.some((t) => t.name === 'ov-gaveta'));
  assert.ok(grupo, 'grupo do ov-gaveta');
  const i = grupo.tokens.findIndex((t) => t.name === 'ov-gaveta');
  assert.equal(grupo.tokens[i - 1].name, 'ov-dialogo-formulario');
  assert.equal(grupo.tokens[i].value, '520px');
  const camadas = Object.values(tokens).flatMap((g) => g.tokens ?? []).find((t) => t.name === 'ov-z-dialogo');
  assert.equal(camadas.usage, 'Véu, diálogo, gaveta, paleta de comandos e folha móvel.');
  const era = Object.values(antes).flatMap((g) => g.tokens ?? []).find((t) => t.name === 'ov-z-dialogo');
  assert.equal(era.usage, 'Véu, diálogo, paleta de comandos e folha móvel.');
  // Fora o token novo e esse usage, o tokens.json é o da tag.
  const sem = JSON.parse(JSON.stringify(tokens), (k, v) => (Array.isArray(v) ? v.filter((t) => t?.name !== 'ov-gaveta') : v));
  for (const g of Object.values(sem)) for (const t of g.tokens ?? []) if (t.name === 'ov-z-dialogo') t.usage = era.usage;
  assert.deepEqual(sem, antes);
});

test('tokens.css: o da v3.26.0 com uma linha a mais, --ov-gaveta: 520px, depois do --ov-dialogo-formulario', () => {
  const linhas = ler('css/tokens.css').split('\n');
  const antes = ler('test/fixtures/tokens-v3.26.0.css').split('\n');
  const i = linhas.indexOf('  --ov-gaveta: 520px;');
  assert.ok(i > 0);
  assert.equal(linhas[i - 1], '  --ov-dialogo-formulario: 640px;');
  assert.deepEqual([...linhas.slice(0, i), ...linhas.slice(i + 1)], antes);
});

// ---------- Os outros arquivos, o exemplo e a versão ----------

const DA_V3260 = {
  'css/casca.css': 'dec8032af2c2ca28e82bdfe576d867610c546bb768a9fdc0a1728e24ae0be338',
  'css/fontes.css': '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
  'css/impressao.css': 'caa847f2a4f114828ac12e95ddbc68e47b89ec6b616bf5014121d0f28c52deaf',
  'css/onevessel.css': 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
  'css/previa.css': '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
  'css/relatorio.css': '4e541be44ca429a6f113b4fe29478477f9c914af709fddcd2f4556cf22ac50b1',
  'css/telas.css': 'aca9e4153479af32f7a1170dc146e40e41705a5b9ba244994e56be27a6f6e177',
  'tailwind/preset.js': '9adaa96a15e4741e0aa5c9386bc87dd894159e7e04774ae854a5b0c04eb4af0a',
  'js/alteracoes-nucleo.d.ts': 'b802858cef25fd528dcf1ef15eb2165eb4aa73d8376a7c4f55044046c5c89c7a',
  'js/alteracoes-nucleo.js': '3275de25a16812f027b05c60b8de52ea78eb9bce2143166437241c4a5b62cc71',
  'js/barra-nucleo.d.ts': '2d8d8da847e9806ad6a9f83dc704a27093af8c08e7c936b98f562b4d03f627c8',
  'js/barra-nucleo.js': 'b011ba7cb2cf663aa10831d8413e38e81da1415e5502169601089034428a6e1e',
  'js/camada.d.ts': '6bdde06e7102cdd9f324d54b3eee2bb78be3cb9c5b158378c4cab09277682cb2',
  'js/camada.js': '45a04d3a63f1ccf2910e6cc347ebc01efe64182bcf30489921f4fb93e8a66c69',
  'js/datas.d.ts': 'f03e597347ab9f6153cdee5c0d8134ee444b19bcfd7c194805f0b66eed14b181',
  'js/datas.js': '553a02c5a53509b091d31b5b05f22d3957bd81b1bfba26f0c29a907cc4d15eea',
  'js/embarcacao-nucleo.d.ts': '30aad463fe35146a2c85226960c87af954eecb769dc540c24f08e7fce143379c',
  'js/embarcacao-nucleo.js': '79eaf167ecd5a6c14bf0b81f03f7dc4003431602b1cdfe621f7382fba70c2e45',
  'js/filtro-nucleo.d.ts': 'eea598afc57ba2c33fa7f73c45a998e07ae0dc466a6e30613e94506d64a8c3c2',
  'js/filtro-nucleo.js': 'e261b28b16cf397aa957baef59e7cec2e1fdfa5c02d3e87c01d6a64dbb302ad5',
  'js/foco-preso.d.ts': '4f4282234d45a8c9402ea2a5e71f568d6ec5b79d3f5579cd36f3b50209254821',
  'js/foco-preso.js': 'f9e36b7575c949c5d97ec1286f76cc9e5c84f73647201372dc646cfe35e7052c',
  'js/lateral-nucleo.d.ts': '22ba640a788d8bab28d97b1109b66b6fdde1aab9e001b422ba1c5f8dcf234485',
  'js/lateral-nucleo.js': '7dba92ae5496d8c33f1a9503f8c6157827bf8e7358aabd22710d22d8ca6e7323',
  'js/menu-nucleo.d.ts': 'c5d69017f5d9b5a1827f1ee5175f697dcbcbf49d356d7b692fd3e6fc87a16cc8',
  'js/menu-nucleo.js': '794ddaefa8f7f130e732fa3f26dfa36389179de70f99c840f826336c3350f0da',
  'js/package.json': '3ca9d4afd21425087cf31893b8f9f63c81b0b8408db5e343ca76e5f8aa26ab9a',
  'js/paleta-nucleo.d.ts': 'a0117772ce0439bfbf044397e11e4d61db38afa831a7d82e4ea7be82ba1b9450',
  'js/paleta-nucleo.js': '79882b9d8f636c4daec672b2475474ee999f56d0240cc0b525d30dad4fbfc7fc',
  'js/teclas-da-lista.d.ts': 'efb47465a1bde7f5dbd65b1a5296955d4ecd2d74e18b675099e87c8d136a03e4',
  'js/teclas-da-lista.js': 'e8c4ea0a969926a1c21c487ff6d358c07b44734323f6abc5894570c7c2bc3e79',
  'js/teclas-da-tabela.d.ts': '7c7c3f334d54ecb0810939914e819a1929afb7447ebfe8aa2a8f4497934da7f3',
  'js/teclas-da-tabela.js': 'fb950d7d9178a5ec6a0cc9e25eb17c6c5548838483f720474beee2e56d4dd9dd',
  'js/teclas-das-abas.d.ts': '0ab8a7a0bc0fbdb435bca3a844403bf6fb492000e8d4c26dd40f43c11b304c6c',
  'js/teclas-das-abas.js': '92daaf05a306d2f767ec2348d333ad0763a42d00105fa75f01e9e4962e1d9964',
  'js/teclas-do-painel.d.ts': '5ea8b24465c5f75a452affc2cfbc858e0cbdc33c458b548b1b02dd93cb8751fc',
  'js/teclas-do-painel.js': '890e36d9f5d26cdb9f6af6d16961bccc1b53ad4b910aea1536d63f9e71714c6d',
  'js/tema-nucleo.d.ts': '4dde993aedc0fd048203d1f19ef2938440d7522518cd0180931535d68e8ed4c2',
  'js/tema-nucleo.js': '86d8cbd3b750dcb064e6167dcba79549c49a0e2bbdf504273bacd01358618870',
  'js/texto.d.ts': '3ab09a6ceeaefea03a0e60b0aa423b3a4ea80f5b70f094eea03e4a1e294b1b09',
  'js/texto.js': '95f98b2d6ba6e3215deb415ceaf8d22b65a7126b45ded877d3b7028dc3e2205d',
  'js/toast-nucleo.d.ts': '3a017e3c0e3c2d2a14787aa0d3074b1f1ff57f747cb9595800e691a186e5448d',
  'js/toast-nucleo.js': 'e647098ae7813e085e5094afd28775442ec1241e75a7106c43a0c8fb23226dce',
};

test('os outros CSS, o preset e todo js/ com os bytes da v3.26.0 (nada em js/, nem o comentário do camada.js); as fixtures da tag', () => {
  for (const [arquivo, sha] of Object.entries(DA_V3260)) assert.equal(sha256(arquivo), sha, arquivo);
  const css = readdirSync(url('css')).filter((n) => n.endsWith('.css')).map((n) => `css/${n}`).sort();
  assert.deepEqual(css, [...Object.keys(DA_V3260).filter((a) => a.startsWith('css/')), 'css/controles.css', 'css/janelas.css', 'css/tokens.css'].sort(), 'nenhum CSS nasce nem some');
  const js = readdirSync(url('js')).map((n) => `js/${n}`).sort();
  assert.deepEqual(js, Object.keys(DA_V3260).filter((a) => a.startsWith('js/')).sort(), 'nenhum js/ nasce nem some');
  const FIXTURES = {
    'controles-v3.26.0.css': 'af238d42d9e6a8393bd92ab8a3e24f7146932e3dd101c800b4303edb552ae4c5',
    'janelas-v3.26.0.css': '29fd0d108082adc91176bb2858d7faa0d57a8e4daf056954928102d7e1ea38b7',
    'tokens-v3.26.0.css': 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92',
    'tokens-v3.26.0.json': '9b3a76c02c3e729ea9a653a9bd47da59d774098084050bb627a1b244e126198e',
  };
  for (const [nome, sha] of Object.entries(FIXTURES)) assert.equal(sha256(`test/fixtures/${nome}`), sha, nome);
});

test('exemplo: a Gaveta com e sem rodapé nos dois temas, e a fileira de três botões com ícone a 520 e a 420', () => {
  const i = exemplo.indexOf('<section class="gaveta-ex">');
  assert.ok(i > 0);
  const secao = exemplo.slice(i, exemplo.indexOf('</section>', i));
  for (const tema of ['escuro', 'claro']) {
    assert.match(secao, new RegExp(`<div class="ov-gaveta" data-altura="detalhe" role="dialog" aria-modal="true" aria-labelledby="gv-leitura-${tema}">`), `${tema} sem rodapé`);
    assert.match(secao, new RegExp(`<div class="ov-gaveta" role="dialog" aria-modal="true" aria-labelledby="gv-campo-${tema}">`), `${tema} com rodapé`);
    assert.match(secao, new RegExp(`id="gv-leitura-${tema}"[^]*?</div>\\s*</div>\\s*</div>`), tema);
  }
  assert.equal((secao.match(/class="ov-gaveta-rodape"/g) ?? []).length, 2);
  assert.equal((secao.match(/class="ov-veu"/g) ?? []).length, 4);
  assert.equal((secao.match(/class="ov-painel-cab"/g) ?? []).length, 4);
  assert.equal((secao.match(/class="fileira-btn" style="width: 520px"/g) ?? []).length, 2);
  assert.equal((secao.match(/class="fileira-btn" style="width: 420px"/g) ?? []).length, 2);
  assert.match(exemplo, /\.fileira-btn \{ display: grid; grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(secao, /@[a-z0-9-]+\.[a-z]/i, 'nenhum e-mail');
});

test('package.json 3.27.0 sem export novo; README com a tag, a seção, a Gaveta em Janelas e o RP3 em Controles', () => {
  assert.equal(pacote.version, '3.27.0');
  assert.equal(Object.keys(pacote.exports).length, 32);
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.27\.0"/);
  assert.match(leiame, /### Gaveta e o ícone do botão que não encolhe \(v3\.27\.0\)/);
  assert.match(leiame, /\*\*Alteradas pelo nome:\*\* nenhuma regra muda de valor/);
  assert.match(leiame, /\*\*Por que a v3\.27\.0 é minor:\*\*/);
  assert.match(leiame, /\*\*O que muda na tela dos apps ao adotar:\*\*/);
  const janelas = leiame.slice(leiame.indexOf('### Janelas'), leiame.indexOf('### Controles'));
  assert.match(janelas, /- \*\*Gaveta\*\* \(v3\.27\.0, ML7\)/);
  assert.match(janelas, /<div class="ov-gaveta"/);
  const controles = leiame.slice(leiame.indexOf('### Controles'), leiame.indexOf('### Telas'));
  assert.match(controles, /`\.ov-btn > svg \{ flex: none; \}`/);
});

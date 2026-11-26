// v3.28.0 (MJ18 e MJ22, decididos pelo Salim em 26/11, T1 a T6; o "Tentar
// novamente" de 25/11): o interruptor no controles.css, a quebra do pé do
// Diálogo de confirmação no janelas.css e o rótulo no README e no exemplo.
// Minor: as fixtures da v3.27.0 (`test/fixtures/*-v3.27.0.css`, da tag,
// fixas) ficam iguais regra a regra; o que nasce é a lista, e nada muda de
// valor nem de seletor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize } from 'node:path';

import { problemasDeBase, regras, seletores, semComentario } from '../scripts/css-regras.mjs';

// Desde a v3.28.1, o controles.css é lido pela fixture da v3.28.0 (os bytes
// da tag, fixos): o interruptor muda na v3.28.1.
const FIXTURAS_V3280 = { 'css/controles.css': 'test/fixtures/controles-v3.28.0.css' };
const url = (p) => new URL(`../${FIXTURAS_V3280[p] ?? p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');
const exemplo = ler('exemplo/index.html');

const ATUAL = { janelas: ler('css/janelas.css'), controles: ler('css/controles.css') };
const ANTES = { janelas: ler('test/fixtures/janelas-v3.27.0.css'), controles: ler('test/fixtures/controles-v3.27.0.css') };

const TOQUE = '@media (pointer: coarse)';
const REDUZIDO = '@media (prefers-reduced-motion: reduce)';
const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// Toda regra da fixture igual; o que nasce é exatamente a lista, e as velhas
// ficam na mesma ordem. Nada sai nem é alterado.
function minor(nome, nascem) {
  const atual = ATUAL[nome];
  const antes = ANTES[nome];
  for (const r of regras(antes)) {
    for (const s of r.seletores) {
      if (s.startsWith('@')) { assert.ok(seletores(atual).has(s), `${nome}: sumiu ${s}`); continue; }
      assert.deepEqual(declaracoesEm(atual, r.media, s), declaracoesEm(antes, r.media, s), `${nome}: ${r.media}|${s}`);
    }
  }
  const velhas = chaves(antes);
  const agora = chaves(atual);
  assert.deepEqual(agora.filter((c) => !velhas.includes(c)), nascem, `${nome}: o que nasce`);
  assert.deepEqual(agora.filter((c) => velhas.includes(c)), velhas, `${nome}: a ordem das velhas`);
}

// ---------- Interruptor (controles.css) ----------

const IT = '.ov-interruptor';
const TRILHO = '.ov-interruptor-trilho';
const BOLINHA = '.ov-interruptor-trilho::before';
const LIGADO = '.ov-interruptor[aria-checked="true"] .ov-interruptor-trilho';
const LIGADO_BOLINHA = `${LIGADO}::before`;
const PALAVRA = '.ov-interruptor-palavra';
const OCUPADO = '.ov-interruptor[aria-busy="true"]';
const OCUPADO_TRILHO = '.ov-interruptor[aria-busy="true"]:not(:disabled) .ov-interruptor-trilho';
const DESABILITADO = '.ov-interruptor:disabled';
const HOVER = '.ov-interruptor:hover:not(:disabled):not([aria-busy="true"])';

test('controles.css: nasce só o interruptor (o botão, o trilho, a bolinha, a palavra, os estados, o toque e o movimento reduzido); nada de antes muda', () => {
  minor('controles', [
    `|${IT}`, `|${HOVER}`, `|${IT}:focus-visible`, `|${TRILHO}`, `|${BOLINHA}`, `|${LIGADO}`, `|${LIGADO_BOLINHA}`,
    `|${PALAVRA}`, `|${PALAVRA}::after`, `|${OCUPADO}`, `|${OCUPADO_TRILHO}`, `|${DESABILITADO}`,
    `${TOQUE}|${IT}`, `${TOQUE}|${TRILHO}`, `${TOQUE}|${BOLINHA}`, `${TOQUE}|${LIGADO_BOLINHA}`,
    `${REDUZIDO}|${BOLINHA}`,
  ]);
});

test('interruptor: o botão é o alvo (36, 48 no toque), sem fundo, com o anel único e o hover; o desabilitado é o disabled nativo a .6 (T3); o gravando, o trilho a .6 (T4)', () => {
  const botao = declaracoesEm(ATUAL.controles, '', IT);
  for (const d of ['box-sizing: border-box', 'display: inline-flex', 'align-items: center', 'gap: 8px', 'min-height: var(--ov-altura-controle)', 'border: 0', 'border-radius: var(--ov-raio-md)', 'background: transparent', 'color: var(--ov-texto)', 'font: 500 14px/20px var(--font-sans)', 'cursor: pointer', 'transition: background-color .12s']) assert.ok(botao.includes(d), d);
  assert.deepEqual(declaracoesEm(ATUAL.controles, TOQUE, IT), ['min-height: var(--ov-altura-toque)']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', HOVER), ['background: var(--ov-linha-hover)']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', `${IT}:focus-visible`), ['outline: 2px solid var(--ov-foco)', 'outline-offset: 2px']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', DESABILITADO), ['opacity: .6', 'cursor: not-allowed']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', DESABILITADO), declaracoesEm(ATUAL.controles, '', '.ov-btn:disabled'), 'igual ao botão');
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', OCUPADO), ['cursor: progress']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', OCUPADO_TRILHO), ['opacity: .6']);
  // Nenhum aria-disabled (T3, a): o desabilitado é só o disabled.
  assert.doesNotMatch(semComentario(ATUAL.controles), /ov-interruptor[^{]*aria-disabled/);
});

test('interruptor: trilho com a borda ov-borda-controle nos dois estados (T2); as cores do livro; a bolinha com box-sizing e borda transparente; a palavra reserva "Inativo"', () => {
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', TRILHO), ['box-sizing: border-box', 'position: relative', 'flex: none', 'width: 36px', 'height: 20px', 'border: 1px solid var(--ov-borda-controle)', 'border-radius: var(--ov-raio-pill)', 'background: var(--ov-superficie-recuada)', 'transition: background-color .12s']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', LIGADO), ['background: var(--ov-acao)'], 'ligado só troca o fundo: a borda fica');
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', BOLINHA), ['content: ""', 'box-sizing: border-box', 'position: absolute', 'top: 2px', 'left: 2px', 'width: 14px', 'height: 14px', 'border: 1px solid transparent', 'border-radius: var(--ov-raio-pill)', 'background: var(--ov-neutro)', 'transition: transform .12s, background-color .12s']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', LIGADO_BOLINHA), ['background: var(--ov-sobre-acao)', 'transform: translateX(16px)']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, TOQUE, TRILHO), ['width: 44px', 'height: 24px']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, TOQUE, BOLINHA), ['width: 18px', 'height: 18px']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, TOQUE, LIGADO_BOLINHA), ['transform: translateX(20px)']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, REDUZIDO, BOLINHA), ['transition: background-color .12s'], 'a bolinha salta');
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', PALAVRA), ['display: inline-block']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, '', `${PALAVRA}::after`), ['content: "Inativo"', 'display: block', 'height: 0', 'overflow: hidden', 'visibility: hidden']);
});

// A folga da bolinha pela conta das declarações: o absolute mede da borda de
// dentro do trilho (border-box, 1px de borda), e a bolinha é border-box.
const px = (v) => Number(String(v).match(/^(-?[\d.]+)px$/)[1]);
const valor = (lista, prop) => lista.find((d) => d.startsWith(`${prop}:`))?.slice(prop.length + 1).trim();
const folgas = (media) => {
  const t = { ...Object.fromEntries(declaracoesEm(ATUAL.controles, '', TRILHO).map((d) => d.split(': '))), ...Object.fromEntries((declaracoesEm(ATUAL.controles, media, TRILHO) ?? []).map((d) => d.split(': '))) };
  const b = { ...Object.fromEntries(declaracoesEm(ATUAL.controles, '', BOLINHA).map((d) => d.split(': '))), ...Object.fromEntries((declaracoesEm(ATUAL.controles, media, BOLINHA) ?? []).map((d) => d.split(': '))) };
  const ligado = valor(declaracoesEm(ATUAL.controles, media, LIGADO_BOLINHA) ?? declaracoesEm(ATUAL.controles, '', LIGADO_BOLINHA), 'transform');
  const borda = 1;
  const [dentroL, dentroA] = [px(t.width) - 2 * borda, px(t.height) - 2 * borda];
  const desloca = Number(ligado.match(/translateX\(([\d.]+)px\)/)[1]);
  const cima = px(b.top), esq = px(b.left), lado = px(b.width);
  assert.equal(px(b.height), lado);
  return {
    desligado: [cima, dentroL - esq - lado, dentroA - cima - lado, esq],
    ligado: [cima, dentroL - esq - desloca - lado, dentroA - cima - lado, esq + desloca],
  };
};
test('interruptor: a bolinha centrada, 2px de folga nos quatro lados, nos dois tamanhos e nos dois estados (pela conta)', () => {
  for (const media of ['', TOQUE]) {
    const f = folgas(media);
    assert.deepEqual(f.desligado, [2, f.desligado[1], 2, 2], `${media || 'computador'} desligado`);
    assert.deepEqual(f.ligado, [2, 2, 2, f.ligado[3]], `${media || 'computador'} ligado`);
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

// Valores conferidos (arredondados a 2 casas), para o relatório.
const ESPERADO = {
  escuro: { borda: [3.42, 3.08], palavra: [14.81, 13.33], bolinhaDesligada: 6.26, bolinhaLigada: 5.10, acaoNaElevada: 2.95 },
  claro: { borda: [4.15, 4.15], palavra: [16.74, 16.74], bolinhaDesligada: 5.66, bolinhaLigada: 5.36, acaoNaElevada: 5.36 },
};
for (const [tema, t] of Object.entries(TEMAS)) {
  test(`interruptor, contraste no tema ${tema}: trilho pela borda (3:1) e palavra (4,5:1) sobre a superfície e a elevada; bolinha sobre o trilho`, () => {
    const fundos = ['ov-superficie', 'ov-superficie-elevada'];
    const borda = fundos.map((f) => contraste(t['ov-borda-controle'], t[f]));
    const palavra = fundos.map((f) => contraste(t['ov-texto'], t[f]));
    for (const r of borda) assert.ok(r >= 3, `borda ${r.toFixed(2)}`);
    for (const r of palavra) assert.ok(r >= 4.5, `palavra ${r.toFixed(2)}`);
    const bolinhaDesligada = contraste(t['ov-neutro'], t['ov-superficie-recuada']);
    const bolinhaLigada = contraste(t['ov-sobre-acao'], t['ov-acao']);
    assert.ok(bolinhaDesligada >= 3 && bolinhaLigada >= 3);
    const e = ESPERADO[tema];
    assert.deepEqual(borda.map((r) => +r.toFixed(2)), e.borda);
    assert.deepEqual(palavra.map((r) => +r.toFixed(2)), e.palavra);
    assert.equal(+bolinhaDesligada.toFixed(2), e.bolinhaDesligada);
    assert.equal(+bolinhaLigada.toFixed(2), e.bolinhaLigada);
    // O porquê da T2: sem a borda, o ov-acao sobre a elevada do escuro fica abaixo de 3.
    assert.equal(+contraste(t['ov-acao'], t['ov-superficie-elevada']).toFixed(2), e.acaoNaElevada);
  });
}

// ---------- Pé do Diálogo (janelas.css) ----------

const PE = '.ov-dialogo:not([data-tamanho="formulario"]) .ov-dialogo-acoes';
test('janelas.css: nascem só o pé que quebra e os filhos dele, logo depois do .ov-dialogo-acoes; o de formulário não entra', () => {
  minor('janelas', [`|${PE}`, `|${PE} > *`]);
  assert.deepEqual(declaracoesEm(ATUAL.janelas, '', PE), ['flex-wrap: wrap-reverse', 'width: fit-content', 'max-width: 100%', 'margin-left: auto']);
  assert.deepEqual(declaracoesEm(ATUAL.janelas, '', `${PE} > *`), ['flex: 1 0 auto']);
  const ordem = chaves(ATUAL.janelas);
  assert.equal(ordem.indexOf(`|${PE}`), ordem.indexOf('|.ov-dialogo-acoes') + 1);
  assert.deepEqual(declaracoesEm(ATUAL.janelas, '', '.ov-dialogo-acoes'), ['display: flex', 'justify-content: flex-end', 'gap: 8px', 'margin-top: 24px'], 'o de sempre');
  // Nenhuma regra nova num @media: o formulário abaixo de 768 fica como estava.
  for (const r of regras(ATUAL.janelas).filter((x) => x.seletores.some((s) => s.startsWith('.ov-dialogo:not(')))) assert.equal(r.media, '');
});

test('janelas.css e controles.css importáveis sozinhos, sem outline: none nem !important novo', () => {
  const importantes = (t) => (semComentario(t).match(/!important/g) ?? []).length;
  for (const nome of ['janelas', 'controles']) {
    assert.deepEqual(problemasDeBase(`${nome}.css`, ATUAL[nome]), [], nome);
    assert.doesNotMatch(ATUAL[nome], /outline:\s*(none|0)\b/, nome);
    assert.equal(importantes(ATUAL[nome]), importantes(ANTES[nome]), nome);
  }
});

// ---------- Os outros arquivos, o exemplo e a versão ----------

const DA_V3270 = {
  'css/casca.css': 'dec8032af2c2ca28e82bdfe576d867610c546bb768a9fdc0a1728e24ae0be338',
  'css/fontes.css': '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
  'css/impressao.css': 'caa847f2a4f114828ac12e95ddbc68e47b89ec6b616bf5014121d0f28c52deaf',
  'css/onevessel.css': 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
  'css/previa.css': '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
  'css/relatorio.css': '4e541be44ca429a6f113b4fe29478477f9c914af709fddcd2f4556cf22ac50b1',
  'css/telas.css': 'aca9e4153479af32f7a1170dc146e40e41705a5b9ba244994e56be27a6f6e177',
  'css/tokens.css': '5c4b6eec97edf1d5a498e754e1506db51d2979c73c9ef328b4660b79014d5470',
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

test('os outros CSS, os tokens, o preset e todo js/ com os bytes da v3.27.0; as fixtures da tag', () => {
  for (const [arquivo, sha] of Object.entries(DA_V3270)) assert.equal(sha256(arquivo), sha, arquivo);
  const css = readdirSync(url('css')).filter((n) => n.endsWith('.css')).map((n) => `css/${n}`).sort();
  assert.deepEqual(css, [...Object.keys(DA_V3270).filter((a) => a.startsWith('css/')), 'css/controles.css', 'css/janelas.css'].sort(), 'nenhum CSS nasce nem some');
  const js = readdirSync(url('js')).map((n) => `js/${n}`).sort();
  assert.deepEqual(js, Object.keys(DA_V3270).filter((a) => a.startsWith('js/')).sort(), 'nenhum js/ nasce nem some');
  const FIXTURES = {
    'controles-v3.27.0.css': '1614ecf3ff82d9f5ac941cff8c4ad766dce33edbb673667b1e18c40b301da492',
    'janelas-v3.27.0.css': '71dd9a8ec3e275f37ab099638214dff3801c8f67453ed12fe09fae80e31e20b8',
  };
  for (const [nome, sha] of Object.entries(FIXTURES)) assert.equal(sha256(`test/fixtures/${nome}`), sha, nome);
});

test('"Tentar novamente" no README e no exemplo; nenhum "de novo" de nova tentativa sobrou', () => {
  for (const [nome, texto] of [['README', leiame], ['exemplo', exemplo]]) {
    assert.doesNotMatch(texto, />Tentar de novo<|[Tt]ente de novo/, nome);
  }
  assert.match(leiame, /<button class="ov-toast-acao">Tentar novamente<\/button>/);
  assert.equal((exemplo.match(/<button class="ov-toast-acao" type="button">Tentar novamente<\/button>/g) ?? []).length, 2);
  assert.equal((exemplo.match(/Não consegui enviar o cadastro\. Tente novamente\./g) ?? []).length, 2);
});

test('exemplo: o interruptor nos dois temas, sobre a superfície e a elevada (ligado, desligado, gravando, desabilitado com motivo), e o Diálogo de 288 com o pé que quebra', () => {
  const i = exemplo.indexOf('<section class="interruptor-ex">');
  assert.ok(i > 0);
  const secao = exemplo.slice(i, exemplo.indexOf('</section>', i));
  for (const tema of ['escuro', 'claro']) {
    for (const fundo of ['superficie', 'elevada']) {
      assert.match(secao, new RegExp(`aria-describedby="it-motivo-${fundo}-${tema}"`), `${tema} ${fundo}`);
      assert.match(secao, new RegExp(`<p class="ov-motivo" id="it-motivo-${fundo}-${tema}">`), `${tema} ${fundo}`);
    }
    assert.match(secao, new RegExp(`<div class="moldura" data-theme="${tema}">[^]*?style="width: 288px"[^]*?Cancelar</button>\\s*<button class="ov-btn ov-btn-primario" type="button">Tentar novamente</button>`), tema);
  }
  const botoes = secao.match(/<button type="button" role="switch" class="ov-interruptor"[^>]*>/g) ?? [];
  assert.equal(botoes.length, 16);
  for (const b of botoes) assert.match(b, /aria-label="Ativo"/);
  assert.equal(botoes.filter((b) => /aria-busy="true"/.test(b)).length, 4);
  assert.equal(botoes.filter((b) => /aria-checked="false"/.test(b)).length, 8);
  // Desde a v3.28.1, a ordem (palavra antes do trilho) e o apagado
  // (aria-disabled no lugar do disabled) ficam com o teste da v3.28.1.
});

// Desde a v3.28.1, a versão e a tag ficam com o teste da versão mais nova.
test('package.json sem export novo; README com a seção, o interruptor em Controles e o pé em Janelas', () => {
  assert.equal(Object.keys(pacote.exports).length, 32);
  assert.match(leiame, /### Interruptor, o pé do Diálogo que quebra e "Tentar novamente" \(v3\.28\.0\)/);
  assert.match(leiame, /\*\*Alteradas pelo nome:\*\* nenhuma regra muda de valor nem de seletor/);
  assert.match(leiame, /\*\*Por que a v3\.28\.0 é minor:\*\*/);
  assert.match(leiame, /\*\*O que muda na tela dos apps ao adotar:\*\*/);
  const janelas = leiame.slice(leiame.indexOf('### Janelas'), leiame.indexOf('### Controles'));
  assert.match(janelas, /- \*\*Pé que não cabe\*\* \(v3\.28\.0, MJ22\)/);
  const controles = leiame.slice(leiame.indexOf('### Controles'), leiame.indexOf('### Telas'));
  assert.match(controles, /<button type="button" role="switch" class="ov-interruptor" aria-checked="true" aria-label="Ativo">/);
  assert.match(controles, /\*\*O contrato do app:\*\*[^\n]*aria-checked[^\n]*\*\*a palavra é do app\*\*[^\n]*aria-busy="true"[^\n]*`disabled` nativo/);
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

const abrir = async (opcoes, fazer) => {
  const servidor = await servir();
  const navegador = await chromium.launch();
  try {
    const contexto = await navegador.newContext({ reducedMotion: 'reduce', ...opcoes });
    const pagina = await contexto.newPage();
    await pagina.goto(`http://127.0.0.1:${servidor.address().port}/exemplo/index.html`);
    await pagina.evaluate(() => document.fonts.ready);
    return await fazer(pagina);
  } finally {
    await navegador.close();
    servidor.close();
  }
};

// As folgas medidas: da borda de dentro do trilho à caixa da bolinha.
const medirBolinhas = () => [...document.querySelectorAll('.interruptor-ex .ov-interruptor')].map((it) => {
  const trilho = it.querySelector('.ov-interruptor-trilho');
  const t = trilho.getBoundingClientRect();
  const e = getComputedStyle(trilho, '::before');
  const borda = parseFloat(getComputedStyle(trilho).borderTopWidth);
  const lado = parseFloat(e.width);
  const x = parseFloat(e.left) + (it.getAttribute('aria-checked') === 'true' ? new DOMMatrix(e.transform).m41 : 0);
  const y = parseFloat(e.top);
  const dentro = [t.width - 2 * borda, t.height - 2 * borda];
  return { ligado: it.getAttribute('aria-checked') === 'true', trilho: [t.width, t.height], bolinha: [lado, parseFloat(e.height), e.boxSizing], folgas: [y, dentro[0] - x - lado, dentro[1] - y - lado, x], alvo: it.getBoundingClientRect().height, palavra: it.querySelector('.ov-interruptor-palavra').getBoundingClientRect().width };
});

for (const [nome, opcoes, trilho, bolinha, alvo] of [
  ['computador, 1280', { viewport: { width: 1280, height: 900 } }, [36, 20], 14, 36],
  ['toque, 375', { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true }, [44, 24], 18, 48],
]) {
  test(`interruptor medido (${nome}): a bolinha centrada, 2px nos quatro lados, ligado e desligado; o alvo; a palavra com a mesma largura`, { skip: chromium ? false : motivo }, async () => {
    const medidas = await abrir(opcoes, async (pagina) => {
      assert.equal(await pagina.evaluate(() => matchMedia('(pointer: coarse)').matches), alvo === 48);
      return pagina.evaluate(medirBolinhas);
    });
    assert.equal(medidas.length, 16);
    for (const m of medidas) {
      assert.deepEqual(m.trilho, trilho);
      assert.deepEqual(m.bolinha, [bolinha, bolinha, 'border-box']);
      // [cima, direita, baixo, esquerda]: 2 em cima, embaixo e do lado em que a bolinha está.
      const f = m.folgas.map((x) => +x.toFixed(2));
      assert.deepEqual([f[0], f[2], f[m.ligado ? 1 : 3]], [2, 2, 2], `${m.ligado ? 'ligado' : 'desligado'}: ${f}`);
      assert.equal(f[m.ligado ? 3 : 1], trilho[0] - 2 - 2 - bolinha, 'o curso: a largura de dentro menos a folga e a bolinha');
      assert.ok(m.alvo >= alvo, `alvo ${m.alvo}`);
    }
    // Ativo e Inativo com a mesma largura: o trilho não pula.
    assert.equal(new Set(medidas.map((m) => m.palavra.toFixed(2))).size, 1);
  });
}

// O pé de cada Diálogo de confirmação do exemplo.
const medirPes = () => [...document.querySelectorAll('.ov-dialogo:not([data-tamanho="formulario"])')].filter((d) => d.querySelector('.ov-dialogo-acoes')).map((d) => {
  const pe = d.querySelector('.ov-dialogo-acoes');
  const [cancelar, acao] = [...pe.children].map((b) => b.getBoundingClientRect());
  const cs = getComputedStyle(d);
  const util = d.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const direita = d.getBoundingClientRect().right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
  return { acao: pe.lastElementChild.textContent, util, cancelar: [cancelar.top, cancelar.width, cancelar.right], acaoR: [acao.top, acao.width, acao.right, acao.bottom], direita };
});
for (const largura of [1280, 375, 320]) {
  test(`pé do Diálogo a ${largura}: o de 288 quebra (ação em cima, os dois com a largura toda, 8 entre eles); o "Remover dia" fica lado a lado, à direita`, { skip: chromium ? false : motivo }, async () => {
    const pes = await abrir({ viewport: { width: largura, height: 900 } }, (pagina) => pagina.evaluate(medirPes));
    const quebrados = pes.filter((p) => p.acao === 'Tentar novamente');
    const lado = pes.filter((p) => p.acao === 'Remover dia');
    assert.equal(quebrados.length, 2);
    assert.equal(lado.length, 2);
    for (const p of quebrados) {
      assert.equal(p.util, 238);
      assert.equal(+(p.cancelar[0] - p.acaoR[3]).toFixed(2), 8, 'a ação em cima, 8 acima do Cancelar');
      assert.equal(p.cancelar[1], p.util);
      assert.equal(p.acaoR[1], p.util);
    }
    for (const p of lado) {
      assert.equal(p.cancelar[0], p.acaoR[0], 'na mesma linha');
      assert.ok(p.cancelar[2] < p.acaoR[2] - p.acaoR[1], 'Cancelar antes');
      assert.ok(Math.abs(p.acaoR[2] - p.direita) < 0.5, 'encostado à direita');
      assert.ok(p.acaoR[1] < 120, 'a largura do rótulo, sem crescer');
    }
  });
}

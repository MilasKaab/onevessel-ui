// v3.25.0 (decidido pelo Salim em 08/11, D1–D5): o papel dos relatórios sai
// colorido como a tela (print-color-adjust: exact na .rel-pagina; o @media
// print só com a paginação), o aviso em bloco (.ov-aviso, atencao e erro),
// o painel dentro de uma coluna (.ov-painel[data-coluna]) e a descrição nova
// do ov-borda-forte. O indicador em alerta não muda (D2). Minor: as
// fixtures da v3.24.3 (`test/fixtures/*-v3.24.3.*`, da tag, fixas) ficam
// iguais regra a regra, fora as alteradas pelo nome e o que nasce pela lista.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { problemasDeBase, regras, seletores, semComentario } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');
const exemplo = ler('exemplo/index.html');

const ATUAL = { impressao: ler('css/impressao.css'), relatorio: ler('css/relatorio.css'), telas: ler('css/telas.css'), janelas: ler('css/janelas.css'), previa: ler('css/previa.css') };
const ANTES = { impressao: ler('test/fixtures/impressao-v3.24.3.css'), relatorio: ler('test/fixtures/relatorio-v3.24.3.css'), telas: ler('test/fixtures/telas-v3.24.3.css'), janelas: ler('test/fixtures/janelas-v3.24.3.css') };

const PRINT = '@media print';
const COMPUTADOR = '@media (min-width: 1024px)';
const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// Toda regra da fixture igual, fora as alteradas e as que saem; o que nasce
// é exatamente a lista, e as velhas ficam na mesma ordem.
function minor(nome, { alteradas = {}, saem = [], nascem = [] }) {
  const atual = ATUAL[nome];
  const antes = ANTES[nome];
  for (const r of regras(antes)) {
    for (const s of r.seletores) {
      const chave = `${r.media}|${s}`;
      if (s.startsWith('@')) { assert.ok(seletores(atual).has(s), `${nome}: sumiu ${s}`); continue; }
      if (saem.includes(chave)) { assert.equal(declaracoesEm(atual, r.media, s), null, `${nome}: devia sair ${chave}`); continue; }
      if (chave in alteradas) { assert.deepEqual(declaracoesEm(atual, r.media, s), alteradas[chave], `${nome}: ${chave}`); continue; }
      assert.deepEqual(declaracoesEm(atual, r.media, s), declaracoesEm(antes, r.media, s), `${nome}: ${chave}`);
    }
  }
  const velhas = chaves(antes).filter((c) => !saem.includes(c));
  const agora = chaves(atual);
  assert.deepEqual(agora.filter((c) => !velhas.includes(c)), nascem, `${nome}: o que nasce`);
  assert.deepEqual(agora.filter((c) => velhas.includes(c)), velhas, `${nome}: a ordem das velhas`);
}

// ---------- 1. Papel colorido ----------

const PAGINA = '.rel-pagina';
const COR_EXATA = ['-webkit-print-color-adjust: exact', 'print-color-adjust: exact'];

test('relatorio.css: só a .rel-pagina muda, com o print-color-adjust: exact (e o -webkit-) no fim; nada nasce', () => {
  const era = declaracoesEm(ANTES.relatorio, '', PAGINA);
  minor('relatorio', { alteradas: { [`|${PAGINA}`]: [...era, ...COR_EXATA] } });
  assert.deepEqual(declaracoesEm(ATUAL.relatorio, '', '.rel-pagina[data-orientacao="paisagem"]'), declaracoesEm(ANTES.relatorio, '', '.rel-pagina[data-orientacao="paisagem"]'));
  // Fora de @media: vale também para quem imprime sem o impressao.css.
  assert.doesNotMatch(semComentario(ATUAL.relatorio), /@media|@page/);
});

test('impressao.css: o @media print fica só com a paginação; as regras que tiravam cor saem pelo nome', () => {
  minor('impressao', {
    alteradas: {
      [`${PRINT}|.rel-pagina`]: ['max-width: none', 'margin: 0', 'padding: 0'],
      [`${PRINT}|.rel-timbre img`]: ['height: 10mm'],
    },
    saem: [`${PRINT}|.rel-timbre`, `${PRINT}|.rel-titulo`, `${PRINT}|.rel-secao`, `${PRINT}|.rel-resumo b`, `${PRINT}|.rel-resumo`],
  });
  const noPapel = regras(ATUAL.impressao).filter((r) => r.media === PRINT).flatMap((r) => r.seletores);
  assert.deepEqual(noPapel, ['.rel-pagina', '.rel-pagina[data-orientacao="paisagem"]', '.rel-timbre img', '.rel-tabela tr', '.rel-tabela thead', '.rel-rodape']);
  // As duas páginas com nome e o rodapé pelas caixas não mudam.
  for (const s of ['@page relatorio', '@page relatorio-paisagem']) assert.ok(seletores(ATUAL.impressao).has(s), s);
  assert.equal(ATUAL.impressao.slice(0, ATUAL.impressao.indexOf('/* Só a paginação')), ANTES.impressao.slice(0, ANTES.impressao.indexOf('/* Papel em preto e branco')));
});

// O papel é a .rel-pagina e o que vai dentro: toda .rel-* fora a barra e a
// área, que são interface (previa.css) e somem ou perdem o fundo no papel.
const INTERFACE = /^\.rel-(barra|area)\b/;

test('nenhuma regra de impressão converte o papel para preto e branco nem tira fundo, em CSS nenhum', () => {
  const nomes = readdirSync(url('css')).filter((n) => n.endsWith('.css'));
  for (const nome of nomes) {
    const texto = ler(`css/${nome}`);
    for (const r of regras(texto).filter((x) => x.media.includes('print'))) {
      const ds = declaracoes(r.corpo);
      for (const s of r.seletores) {
        assert.ok(!ds.some((d) => /grayscale|saturate\(0|filter\s*:/.test(d)), `${nome}: ${s} tira cor (${ds})`);
        assert.ok(!ds.some((d) => /print-color-adjust\s*:\s*economy/.test(d)), `${nome}: ${s} economiza cor`);
        if (INTERFACE.test(s)) continue;
        assert.ok(!ds.some((d) => /^(color|border(-[a-z]+)?-color|border(-[a-z]+)?)\s*:.*(#000\b|#000000|\bblack\b|#999)/.test(d)), `${nome}: ${s} pinta de preto (${ds})`);
        assert.ok(!ds.some((d) => /^background(-color|-image)?\s*:\s*(none|transparent)/.test(d)), `${nome}: ${s} tira o fundo (${ds})`);
      }
    }
  }
  // A cor exata na folha, nas duas grafias, e por herança no que está nela.
  const pagina = declaracoesEm(ATUAL.relatorio, '', PAGINA);
  for (const d of COR_EXATA) assert.ok(pagina.includes(d), d);
  // Os papéis coloridos continuam: filete laranja, títulos e números azuis, faixa tingida.
  assert.ok(declaracoesEm(ATUAL.relatorio, '', '.rel-timbre').includes('border-bottom: 2px solid var(--rel-filete)'));
  assert.ok(declaracoesEm(ATUAL.relatorio, '', '.rel-secao').includes('color: var(--rel-titulo)'));
  assert.ok(declaracoesEm(ATUAL.relatorio, '', '.rel-resumo').includes('background: var(--rel-tinta)'));
  // A área e a barra (interface) seguem como estavam no previa.css.
  assert.deepEqual(declaracoesEm(ATUAL.previa, PRINT, '.rel-area'), ['padding: 0', 'background: none']);
  assert.deepEqual(declaracoesEm(ATUAL.previa, PRINT, '.rel-barra'), ['display: none']);
});

test('impressao.css continua sem seletor global: só .rel-*, sem @page sem nome, body, visibility nem position: absolute', () => {
  const texto = semComentario(ATUAL.impressao);
  assert.doesNotMatch(texto, /@page\s*\{|\bbody\b|visibility|position:\s*absolute/);
  for (const s of seletores(ATUAL.impressao)) if (!s.startsWith('@')) assert.match(s, /^\.rel-/, s);
});

// ---------- 2. Aviso em bloco ----------

const AVISO = [
  '|.ov-aviso',
  '|.ov-aviso[data-tom="atencao"]',
  '|.ov-aviso[data-tom="erro"]',
  '|.ov-aviso > svg',
  '|.ov-aviso-texto',
  '|.ov-aviso-texto > p',
  '|.ov-aviso-titulo',
];

test('telas.css: nascem exatamente as regras do aviso em bloco, antes do esqueleto; nada de antes muda', () => {
  minor('telas', { nascem: AVISO });
  const ordem = chaves(ATUAL.telas);
  assert.equal(ordem.indexOf('|.ov-aviso-titulo') + 1, ordem.indexOf('|.ov-esqueleto'));
});

test('aviso em bloco: os dois tons com o par da tag pastel, ícone de 16px na cor do texto, caixa com fonte e cor próprias', () => {
  const em = (s) => declaracoesEm(ATUAL.telas, '', s);
  assert.deepEqual(em('.ov-aviso[data-tom="atencao"]'), ['background: var(--ov-tag-atencao-fundo)', 'color: var(--ov-tag-atencao-texto)']);
  assert.deepEqual(em('.ov-aviso[data-tom="erro"]'), ['background: var(--ov-tag-erro-fundo)', 'color: var(--ov-tag-erro-texto)']);
  const base = em('.ov-aviso');
  for (const d of ['box-sizing: border-box', 'display: flex', 'border-radius: var(--ov-raio-md)', 'font: 400 14px/20px var(--font-sans)', 'background: var(--ov-tag-neutro-fundo)', 'color: var(--ov-tag-neutro-texto)']) assert.ok(base.includes(d), d);
  assert.deepEqual(em('.ov-aviso > svg'), ['flex: none', 'width: 16px', 'height: 16px', 'margin-top: 2px']);
  assert.ok(!em('.ov-aviso > svg').some((d) => d.startsWith('color')), 'o ícone herda a cor do texto');
  assert.deepEqual(em('.ov-aviso-titulo'), ['font-weight: 600']);
  // O vocabulário é o da tag: nada de "perigo" (D5).
  assert.doesNotMatch(semComentario(ATUAL.telas), /perigo/);
});

const tokens = JSON.parse(ler('tokens/tokens.json'));
const valor = (nome, tema) => {
  const t = tokens.color.tokens.find((c) => c.name === nome);
  assert.ok(t, nome);
  return typeof t.value === 'string' ? t.value : t.value[tema];
};
const rgba = (s) => {
  s = s.trim();
  if (s[0] === '#') return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)).concat(1);
  const m = s.match(/rgba?\(([^)]+)\)/)[1].split(',').map(Number);
  return [m[0], m[1], m[2], m[3] ?? 1];
};
const sobre = (frente, fundo) => { const [r, g, b, a] = rgba(frente); const f = rgba(fundo); return `#${[r, g, b].map((c, i) => Math.round(c * a + f[i] * (1 - a)).toString(16).padStart(2, '0')).join('')}`; };
const luz = (cor) => { const [r, g, b] = rgba(cor).map((c) => c / 255); const c = (x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b); };
const contraste = (a, b) => { const [x, y] = [luz(a), luz(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('aviso em bloco: texto ≥ 4,5:1 (na prática ≥ 6,1:1) sobre o próprio fundo, em ov-superficie, ov-superficie-elevada e ov-fundo, nos dois temas', () => {
  for (const tema of ['escuro', 'claro']) for (const tom of ['atencao', 'erro']) {
    for (const superficie of ['ov-superficie', 'ov-superficie-elevada', 'ov-fundo']) {
      const fundo = sobre(valor(`ov-tag-${tom}-fundo`, tema), valor(superficie, tema));
      const c = contraste(valor(`ov-tag-${tom}-texto`, tema), fundo);
      assert.ok(c >= 6.1, `${tema} ${tom} em ${superficie}: ${c.toFixed(2)}`);
    }
  }
});

// ---------- 4. ov-borda-forte ----------

const USO = 'Borda decorativa um degrau acima da ov-borda: contorno do que flutua (menu, paleta, diálogo, barra de ações em massa, link de pular para o conteúdo), do painel no modo foco, do segmentado, dos chips de filtro e das teclas de atalho. Nunca a única borda de um controle: essa é a ov-borda-controle.';

test('tokens.json: só o usage do ov-borda-forte muda; o valor e o tokens.css não mudam', () => {
  const antes = JSON.parse(ler('test/fixtures/tokens-v3.24.3.json'));
  const forte = tokens.color.tokens.find((c) => c.name === 'ov-borda-forte');
  assert.equal(forte.usage, USO);
  assert.doesNotMatch(forte.usage, /secundário/);
  const era = antes.color.tokens.find((c) => c.name === 'ov-borda-forte');
  assert.equal(era.usage, 'Borda de botão secundário, chips de filtro e teclas de atalho.');
  assert.deepEqual(forte.value, era.value);
  assert.deepEqual({ ...tokens, color: { ...tokens.color, tokens: tokens.color.tokens.map((c) => (c.name === 'ov-borda-forte' ? { ...c, usage: era.usage } : c)) } }, antes);
  assert.equal(sha256('css/tokens.css'), 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92');
});

test('ov-borda-forte: a descrição diz onde o token está, e o secundário não o usa', () => {
  const usam = new Set();
  for (const nome of readdirSync(url('css')).filter((n) => n.endsWith('.css') && n !== 'tokens.css')) {
    for (const r of regras(ler(`css/${nome}`))) if (/var\(--ov-borda-forte\)/.test(r.corpo)) r.seletores.forEach((s) => usam.add(s));
  }
  const lista = [...usam];
  for (const classe of ['.ov-menu', '.ov-paleta', '.ov-dialogo', '.ov-acoes-massa', '.ov-pular', '.ov-segmentado', '.ov-chip-filtro', '.ov-tecla']) {
    assert.ok(lista.some((s) => s === classe || s.startsWith(`${classe} `) || s.startsWith(`${classe}[`)), classe);
  }
  assert.ok(lista.some((s) => s.includes('[data-painel="foco"]') && s.endsWith('> .ov-painel')), 'painel no modo foco');
  assert.ok(!lista.some((s) => s.includes('ov-btn')), 'nenhum botão com a borda decorativa');
});

// ---------- 5. Painel dentro de uma coluna ----------

const COLUNA = '.ov-painel[data-coluna]';

test('janelas.css: nasce só o .ov-painel[data-coluna], a partir de 1024px, no fim do modo foco; nada de antes muda', () => {
  minor('janelas', { nascem: [`${COMPUTADOR}|${COLUNA}`] });
  assert.deepEqual(declaracoesEm(ATUAL.janelas, COMPUTADOR, COLUNA), ['width: 100%', 'height: 100%', 'min-height: 0', 'border: 1px solid var(--ov-borda)', 'border-radius: var(--ov-raio-lg)', 'overflow: hidden']);
  // Nem fora do computador nem abaixo de 1024px: lá é a Folha.
  assert.equal(regras(ATUAL.janelas).filter((r) => r.seletores.some((s) => s.includes('data-coluna'))).length, 1);
});

test('painel em coluna sem !important, e o janelas.css importável sozinho, sem outline: none', () => {
  assert.doesNotMatch(semComentario(ATUAL.janelas).match(/\.ov-painel\[data-coluna\][^}]*\}/)[0], /!important/);
  const importantes = (t) => (semComentario(t).match(/!important/g) ?? []).length;
  assert.equal(importantes(ATUAL.janelas), importantes(ANTES.janelas));
  assert.deepEqual(problemasDeBase('janelas.css', ATUAL.janelas), []);
  assert.deepEqual(problemasDeBase('telas.css', ATUAL.telas), []);
  for (const t of Object.values(ATUAL)) assert.doesNotMatch(t, /outline:\s*(none|0)\b/);
});

// ---------- Os outros arquivos, o exemplo e a versão ----------

test('os outros CSS com os bytes da v3.24.3; as fixtures da tag', () => {
  const CSS = {
    casca: 'dec8032af2c2ca28e82bdfe576d867610c546bb768a9fdc0a1728e24ae0be338',
    controles: 'af238d42d9e6a8393bd92ab8a3e24f7146932e3dd101c800b4303edb552ae4c5',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    tokens: 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92',
  };
  assert.deepEqual(readdirSync(url('css')).filter((n) => n.endsWith('.css')).sort(), [...Object.keys(CSS), 'impressao', 'janelas', 'relatorio', 'telas'].map((n) => `${n}.css`).sort(), 'nenhum CSS nasce nem some');
  for (const [nome, sha] of Object.entries(CSS)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
  const FIXTURES = {
    'impressao-v3.24.3.css': 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    'janelas-v3.24.3.css': '30784a9cbae14a0e447c3b517ffbadba9f1520dcef98d33e6444e16b130663eb',
    'relatorio-v3.24.3.css': 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    'telas-v3.24.3.css': '1c98875ecc5f9cab5a28332d87b9089153465b9c74884f8f505fdae09c0c83c4',
    'tokens-v3.24.3.json': '00e88f37d561d821f96fa505b1cd794326d70bb5df6453a531e24cf667463b1d',
  };
  for (const [nome, sha] of Object.entries(FIXTURES)) assert.equal(sha256(`test/fixtures/${nome}`), sha, nome);
});

test('exemplo: o aviso nos dois tons e o painel em coluna, nos dois temas', () => {
  for (const tema of ['escuro', 'claro']) {
    const i = exemplo.indexOf(`<div class="controles-moldura" data-theme="${tema}">\n      <div class="ov-cartao avisos-cartao">`);
    assert.ok(i > 0, tema);
    const trecho = exemplo.slice(i, exemplo.indexOf('</aside>', i));
    for (const tom of ['atencao', 'erro']) assert.match(trecho, new RegExp(`class="ov-aviso" data-tom="${tom}"`), `${tema} ${tom}`);
    assert.match(trecho, /class="ov-aviso-titulo"/, tema);
    assert.match(trecho, new RegExp(`class="moldura moldura-coluna" data-theme="${tema}"`), tema);
    assert.match(trecho, /<aside class="ov-painel" data-coluna/, tema);
  }
});

test('exemplo/relatorio.html: dados fictícios, o CSS do relatório e a impressão só no clique', () => {
  assert.ok(existsSync(url('exemplo/relatorio.html')));
  const pagina = ler('exemplo/relatorio.html');
  for (const css of ['../css/tokens.css', '../css/fontes.css', '../css/relatorio.css', '../css/impressao.css']) assert.ok(pagina.includes(`href="${css}"`), css);
  assert.match(pagina, /Navio Exemplo/);
  assert.match(pagina, /--rel-rodape: "OneVessel · Exemplo · /);
  assert.match(pagina, /<main class="rel-pagina">/);
  assert.doesNotMatch(pagina, /@[a-z0-9-]+\.[a-z]/i, 'nenhum e-mail');
  assert.doesNotMatch(pagina, /Bram Power/);
  // window.print só no botão, nunca ao carregar.
  assert.equal((pagina.match(/window\.print\(\)/g) ?? []).length, 1);
  assert.match(pagina, /onclick="window\.print\(\)"/);
});

test('package.json 3.25.0, sem export novo; README com a tag, a seção, as alteradas pelo nome, a adoção e os componentes', () => {
  assert.equal(pacote.version, '3.25.0');
  assert.equal(Object.keys(pacote.exports).length, 29);
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.25\.0"/);
  assert.match(leiame, /### Aviso em bloco, painel em coluna e papel colorido \(v3\.25\.0\)/);
  assert.match(leiame, /\*\*Alteradas pelo nome\*\*[^\n]*`\.rel-pagina` ganha `-webkit-print-color-adjust: exact; print-color-adjust: exact`[^\n]*`filter: grayscale\(1\)`[^\n]*`usage` do `ov-borda-forte`/);
  assert.match(leiame, /\*\*Por que a v3\.25\.0 é minor:\*\*/);
  assert.match(leiame, /\*\*O que muda na tela dos apps ao adotar:\*\*[^\n]*colorido/);
  assert.match(leiame, /\*\*Adoção:\*\*[^\n]*`data-tom="perigo"` → `"erro"`[^\n]*`data-coluna`/);
  assert.match(leiame, /- \*\*Aviso em bloco\*\* \(v3\.25\.0\): `\.ov-aviso`/);
  assert.match(leiame, /- \*\*Painel dentro de uma coluna\*\* \(v3\.25\.0\)/);
  assert.match(leiame, /- \*\*Papel colorido como a tela\*\* \(v3\.25\.0/);
  assert.doesNotMatch(leiame, /\*\*Papel em preto e branco\*\*/);
});

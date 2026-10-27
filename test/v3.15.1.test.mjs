// v3.15.1 (decidido pelo Salim em 27/10, ao ver a Bordo e o Paradas): três
// ajustes à lateral recolhível da v3.15.0. (1) Na recolhida, a âncora do
// seletor com data-fixo ficava 5px fora do eixo dos outros ícones: o
// padding-right do [data-fixo] (0,2,0) vencia o padding: 0 do recolhido
// (0,1,0); o seletor passa a :where([data-fixo]). (2) O botão
// .ov-lateral-alternar ganha o texto em .ov-lateral-texto. (3) O rodapé
// começa por um .ov-lateral-grupo vazio, depois o botão; a conta no fim.
// `test/fixtures/casca-v3.15.0.css` é o casca.css da tag v3.15.0, fixo.
// Desde a v3.16.0, a casca, as telas e os tokens daqui são as fixtures da
// v3.15.1 (fixture com fixture); as medidas olham só as duas cascas da
// .pagina, e a versão e a tag ficam com o teste da versão mais nova. Desde
// a v3.17.0, as janelas daqui são a fixture da v3.16.0 (iguais às da v3.15.1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { regras } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const antes = ler('test/fixtures/casca-v3.15.0.css');
const casca = ler('test/fixtures/casca-v3.15.1.css');
const exemplo = ler('exemplo/index.html');
const leiame = ler('README.md');
const n = await import('../js/lateral-nucleo.js');

const ESTREITA = '@media (max-width: 1023px)';
const ESTREITA_TOQUE = '@media (max-width: 1023px) and (pointer: coarse)';
const LARGA = '@media (min-width: 1024px)';
const LARGA_TOQUE = '@media (min-width: 1024px) and (pointer: coarse)';
const ESCOLHA = ':where(.ov-casca[data-lateral="recolhida"])';
const BOTAO = '.ov-lateral-alternar';
const FIXO_ANTES = '.ov-seletor-embarcacao[data-fixo]';
const FIXO = '.ov-seletor-embarcacao:where([data-fixo])';
const MARGENS = ['.ov-superior', '.ov-tela', '.ov-faixa'];

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const corpo = (seletor, media = '') => (declaracoesEm(casca, media, seletor) ?? []).join('; ');
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));
const porSeletor = (media, filtro = () => true) => {
  const mapa = new Map();
  for (const r of regras(casca).filter((x) => x.media === media)) {
    for (const s of r.seletores) {
      if (!filtro(s, r)) continue;
      mapa.set(s, [...(mapa.get(s) ?? []), ...declaracoes(r.corpo)]);
    }
  }
  return mapa;
};

// ---------- patch: todo o resto do casca.css da v3.15.0 igual ----------

// Alteradas pelo nome: o data-fixo troca de seletor (os mesmos elementos,
// com menos força) e o botão ganha as declarações do texto.
const ALTERADAS = [`|${FIXO_ANTES}`, `|${BOTAO}`];

test('patch: toda regra do casca.css da v3.15.0 igual, fora as alteradas pelo nome', () => {
  for (const r of regras(antes)) {
    for (const s of r.seletores) {
      if (ALTERADAS.includes(`${r.media}|${s}`)) continue;
      assert.deepEqual(declaracoesEm(casca, r.media, s), declaracoesEm(antes, r.media, s), `${r.media}|${s}`);
    }
  }
});

test('patch: nenhuma regra nasce; o data-fixo só troca de seletor', () => {
  const velhas = new Set(chaves(antes));
  const novas = new Set(chaves(casca));
  assert.deepEqual(chaves(casca).filter((c) => !velhas.has(c)), [`|${FIXO}`]);
  assert.deepEqual(chaves(antes).filter((c) => !novas.has(c)), [`|${FIXO_ANTES}`]);
  // As outras regras do data-fixo (sem seta, sem realce) ficam como estavam.
  assert.equal(corpo(`${FIXO_ANTES}::after`), 'content: none');
  assert.equal(corpo(`${FIXO_ANTES}:hover`), 'background: transparent');
});

test('patch: o data-fixo com as declarações da v3.15.0, na força do seletor sozinho', () => {
  assert.deepEqual(declaracoesEm(casca, '', FIXO), declaracoesEm(antes, '', FIXO_ANTES));
  // Vem depois da regra de base (mesma força, ganha aberto) e antes dos
  // blocos de recolhido (mesma força, eles ganham).
  const ordem = regras(casca).map((r) => `${r.media}|${r.seletores.join(', ')}`);
  const i = ordem.indexOf(`|${FIXO}`);
  assert.ok(i > ordem.indexOf('|.ov-seletor-embarcacao'));
  assert.ok(i < ordem.findIndex((c) => c.startsWith(`${ESTREITA}|`)));
  assert.ok(i < ordem.findIndex((c) => c.startsWith(`${LARGA}|`)));
  // Nenhum data-fixo fora de :where() mexe em padding.
  for (const r of regras(casca)) {
    if (r.seletores.some((s) => /\[data-fixo\]/.test(s.replace(/:where\([^)]*\)/g, '')))) assert.doesNotMatch(r.corpo, /padding/, r.seletores.join(', '));
  }
});

test('patch: o botão é o da v3.15.0 mais o que mostra o texto', () => {
  const de = declaracoesEm(antes, '', BOTAO);
  const agora = declaracoesEm(casca, '', BOTAO);
  for (const d of de) assert.ok(agora.includes(d), d);
  assert.deepEqual(agora.filter((d) => !de.includes(d)), ['gap: 10px', 'min-width: 0', 'text-align: left', 'white-space: nowrap']);
});

test('os outros CSS com os bytes da v3.15.0', () => {
  const SHA = {
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    janelas: '015a5e82157558910b90cf1237f0404fbca2de89a036def4a87370b7e156d763',
    telas: 'a589ff277e7ee7f059d2014e91353802fa42fe8feb35ea76011a6d3ba8e29715',
    controles: 'e18ae6db69fc02205e45929f09afbd1b61e33212bf0aaf64d030c5c9edbfe9de',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
    tokens: '28569ab7f0be7c421d0db9bbd69eae4127d1c6f12d938fa503d88e6aa79805be',
  };
  const FIXTURE = { telas: 'v3.15.1', tokens: 'v3.15.1', janelas: 'v3.16.0' };
  for (const [nome, sha] of Object.entries(SHA)) assert.equal(sha256(FIXTURE[nome] ? `test/fixtures/${nome}-${FIXTURE[nome]}.css` : `css/${nome}.css`), sha, nome);
});

// ---------- O recolhido continua igual nos dois blocos ----------

test('recolhida por escolha = abaixo de 1024px, como na v3.15.0', () => {
  const estreita = porSeletor(ESTREITA, (s, r) => !MARGENS.includes(s) && !(s === BOTAO && /display:\s*none/.test(r.corpo)));
  const larga = porSeletor(LARGA);
  assert.deepEqual([...larga.keys()], [...estreita.keys()].map((s) => `${ESCOLHA} ${s}`));
  for (const [s, ds] of estreita) assert.deepEqual(larga.get(`${ESCOLHA} ${s}`), ds, s);
  const toque = porSeletor(ESTREITA_TOQUE);
  const larga_toque = porSeletor(LARGA_TOQUE);
  assert.deepEqual([...larga_toque.keys()], [...toque.keys()].map((s) => `${ESCOLHA} ${s}`));
  for (const [s, ds] of toque) assert.deepEqual(larga_toque.get(`${ESCOLHA} ${s}`), ds, s);
  // O seletor, com ou sem data-fixo, fica sem padding nos dois.
  assert.equal(corpo('.ov-seletor-embarcacao', ESTREITA), 'justify-content: center; padding: 0');
  assert.equal(corpo(`${ESCOLHA} .ov-seletor-embarcacao`, LARGA), 'justify-content: center; padding: 0');
});

// ---------- O botão com texto e o rodapé ----------

test('núcleo: o botão em cada estado traz o texto, igual ao rótulo', () => {
  assert.deepEqual(n.botaoDaLateral('aberta'), { icone: 'panel-left-close', texto: 'Recolher barra lateral', rotulo: 'Recolher barra lateral', expandido: true });
  assert.deepEqual(n.botaoDaLateral('recolhida'), { icone: 'panel-left-open', texto: 'Expandir barra lateral', rotulo: 'Expandir barra lateral', expandido: false });
  assert.deepEqual(n.botaoDaLateral('lixo'), n.botaoDaLateral('aberta'));
  assert.match(ler('js/lateral-nucleo.d.ts'), /texto: string;/);
});

test('exemplo: rodapé na ordem (filete, botão com texto, conta) nos dois temas, e o script troca o texto', () => {
  const rodape = '<div class="ov-lateral-rodape">\n'
    + '            <div class="ov-lateral-grupo"></div>\n'
    + '            <button class="ov-lateral-alternar" type="button" aria-expanded="true" aria-label="Recolher barra lateral" title="Recolher barra lateral"><i data-icone="panel-left-close"></i><span class="ov-lateral-texto">Recolher barra lateral</span></button>\n'
    + '            <button class="ov-conta" ';
  for (const tema of ['escuro', 'claro']) {
    const i = exemplo.indexOf(`<div class="moldura" data-theme="${tema}">`);
    assert.ok(i > 0, tema);
    const lateral = exemplo.slice(i, exemplo.indexOf('</nav>', i));
    assert.ok(lateral.includes(rodape), tema);
  }
  assert.match(exemplo, /const \{ icone, texto, rotulo, expandido \} = botaoDaLateral\(estado\)/);
  assert.match(exemplo, /botao\.querySelector\('\.ov-lateral-texto'\)\.textContent = texto/);
});

test('README com o texto do botão e o rodapé', () => {
  assert.match(leiame, /<svg …panel-left-close…\/><span class="ov-lateral-texto">Recolher barra lateral<\/span>/);
  assert.match(leiame, /\*\*O rodapé, nesta ordem\*\* \(v3\.15\.1\)/);
  assert.match(leiame, /\*\*Por que a v3\.15\.1 é patch:\*\*/);
});

// ---------- A medida, no navegador ----------

// O Playwright é devDependency (o `npm run icones`). Sem o Chromium
// instalado, o teste diz por que pulou.
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

// O centro do SVG de cada item da lateral, em px a partir da borda dela.
const centros = () => [...document.querySelectorAll('.pagina .ov-lateral')].map((lateral) => {
  const esquerda = lateral.getBoundingClientRect().left;
  const itens = lateral.querySelectorAll('.ov-lateral-marca, .ov-seletor-embarcacao, .ov-busca-gatilho, .ov-nav, .ov-lateral-alternar, .ov-conta');
  return [...itens].filter((el) => el.getClientRects().length).map((el) => {
    const r = el.querySelector('svg').getBoundingClientRect();
    return { item: `${el.className} ${el.title}`.trim(), centro: r.left + r.width / 2 - esquerda };
  });
});

const medir = async (largura, recolhida) => {
  const navegador = await chromium.launch();
  try {
    const pagina = await navegador.newPage({ viewport: { width: largura, height: 900 } });
    await pagina.goto(url('exemplo/index.html').href);
    await pagina.evaluate((r) => { for (const c of document.querySelectorAll('.ov-casca')) c.dataset.lateral = r ? 'recolhida' : 'aberta'; }, recolhida);
    const medidas = await pagina.evaluate(centros);
    const texto = await pagina.evaluate(() => [...document.querySelectorAll('.pagina .ov-lateral-alternar .ov-lateral-texto')].map((t) => t.getBoundingClientRect().width));
    const filete = await pagina.evaluate(() => [...document.querySelectorAll('.pagina .ov-lateral-rodape > .ov-lateral-grupo')].map((g) => g.getBoundingClientRect().height));
    return { medidas, texto, filete };
  } finally {
    await navegador.close();
  }
};

const todosNoEixo = (medidas, rotulo) => {
  assert.equal(medidas.length, 2, rotulo);
  for (const itens of medidas) {
    assert.ok(itens.length >= 10, rotulo);
    const eixo = itens[0].centro;
    for (const { item, centro } of itens) assert.ok(Math.abs(centro - eixo) <= 1, `${rotulo}: ${item} a ${centro}px, eixo a ${eixo}px`);
  }
};

test('medida: recolhida por escolha a 1280px, todo ícone no mesmo eixo (1px), e o texto do botão fora', { skip: chromium ? false : motivo }, async () => {
  const { medidas, texto, filete } = await medir(1280, true);
  todosNoEixo(medidas, '1280px recolhida');
  // As duas cascas têm a âncora: a da Bordo é botão, a do Paradas data-fixo.
  for (const itens of medidas) assert.ok(itens.some((x) => x.item.startsWith('ov-seletor-embarcacao')));
  for (const l of texto) assert.ok(l <= 1, `texto do botão com ${l}px`);
  for (const h of filete) assert.equal(h, 1);
});

test('medida: abaixo de 1024px (900px), todo ícone no mesmo eixo (1px)', { skip: chromium ? false : motivo }, async () => {
  const { medidas } = await medir(900, false);
  // A 900px o botão some; os outros continuam.
  for (const itens of medidas) assert.ok(!itens.some((x) => x.item.startsWith('ov-lateral-alternar')));
  todosNoEixo(medidas, '900px');
});

test('medida: aberta a 1280px, o botão mostra o texto', { skip: chromium ? false : motivo }, async () => {
  const { texto } = await medir(1280, false);
  assert.equal(texto.length, 2);
  for (const l of texto) assert.ok(l > 100, `texto do botão com ${l}px`);
});

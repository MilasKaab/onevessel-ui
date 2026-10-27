// v3.17.0 (decidido pelo Salim em 27/10, em teste em Pessoas da Bordo): o
// modo foco do Painel lateral, só a partir de 1024px. A tela põe
// data-painel="foco" no contêiner da lista e do painel; o modo age enquanto
// o .ov-painel é filho dele. Lista compacta (só as células com
// data-principal, numa coluna de 360px, nome em reticências), lista em
// segundo plano (--ov-texto-secundario, por cor), painel em primeiro plano
// (superfície elevada, borda forte, sombra 2, o resto com mínimo de 520px,
// sticky, Detalhes em colunas de 280px). E, fora do modo, o par dt/dd
// embrulhado num div na .ov-dados (display: contents). Minor: a fixture da
// v3.16.0 (`test/fixtures/janelas-v3.16.0.css`, da tag, fixa) fica igual
// regra a regra; só nasce o que está aqui.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { regras } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const janelas = ler('css/janelas.css');
const antes = ler('test/fixtures/janelas-v3.16.0.css');
const exemplo = ler('exemplo/index.html');
const leiame = ler('README.md');
const pacote = JSON.parse(ler('package.json'));

const COMPUTADOR = '@media (min-width: 1024px)';
const FOCO = '[data-painel="foco"]:has(> .ov-painel)';
const LISTA = `${FOCO} > :not(.ov-painel):has(.ov-tabela)`;
const OCULTA = `${FOCO} .ov-tabela :is(th, td):not([data-principal])`;
const NOME = `${FOCO} .ov-tabela td.nome`;
const FUNDO = `${FOCO} .ov-tabela tbody tr:not([aria-selected="true"], :hover, :focus-visible, :has(:focus-visible))`;
const PAINEL = `${FOCO} > .ov-painel`;
const DADOS = `${PAINEL} .ov-dados:has(> div)`;
const PAR = `${PAINEL} .ov-dados > div`;
const FORM = `${PAINEL} :has(> .ov-campo-grupo)`;
const FORM_RESTO = `${FORM} > :not(.ov-campo-grupo)`;

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));
const ordem = (texto) => regras(texto).map((r) => `${r.media}|${r.seletores.join(', ')}`);

// ---------- minor: tudo da v3.16.0 igual; só nasce o novo ----------

const NOVAS = [
  '|.ov-dados > div',
  ...[FOCO, LISTA, OCULTA, NOME, FUNDO, PAINEL, DADOS, PAR, FORM, FORM_RESTO].map((s) => `${COMPUTADOR}|${s}`),
];

test('minor: toda regra do janelas.css da v3.16.0 igual, e só nasce o modo foco e o par embrulhado', () => {
  for (const r of regras(antes)) {
    for (const s of r.seletores) assert.deepEqual(declaracoesEm(janelas, r.media, s), declaracoesEm(antes, r.media, s), `${r.media}|${s}`);
  }
  const velhas = new Set(chaves(antes));
  assert.deepEqual(chaves(janelas).filter((c) => !velhas.has(c)), NOVAS);
  // A ordem das velhas não muda (a força é a mesma, a ordem decide).
  const novas = new Set(NOVAS);
  assert.deepEqual(ordem(janelas).filter((c) => !novas.has(c)), ordem(antes));
});

test('os outros CSS com os bytes da v3.16.0', () => {
  const SHA = {
    casca: 'e416342d156f26fe70a17d52b390e144e33079d78aa31b78d949511fe15961d0',
    telas: '3eed809d323ba240d4e8065fe31447bd0ddf3f5c6f52a43825e8a97575390fe0',
    tokens: 'fefa160e9e66f8c7529b9efa3208d1561a8d1ef7acbaf92d521f1b4989b2afd1',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    controles: 'e18ae6db69fc02205e45929f09afbd1b61e33212bf0aaf64d030c5c9edbfe9de',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
  };
  for (const [nome, sha] of Object.entries(SHA)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
  assert.equal(sha256('test/fixtures/janelas-v3.16.0.css'), '015a5e82157558910b90cf1237f0404fbca2de89a036def4a87370b7e156d763');
});

// ---------- O novo ----------

test('o par embrulhado: fora do modo, o div some (a .ov-dados solta fica como estava)', () => {
  assert.deepEqual(declaracoesEm(janelas, '', '.ov-dados > div'), ['display: contents']);
  assert.deepEqual(declaracoesEm(janelas, '', '.ov-dados'), declaracoesEm(antes, '', '.ov-dados'));
  const o = ordem(janelas);
  assert.equal(o.indexOf('|.ov-dados > div'), o.indexOf('|.ov-dados dd') + 1);
});

test('modo foco: só no bloco de 1024px para cima, sempre preso ao atributo com o painel dentro', () => {
  const doFoco = regras(janelas).filter((r) => r.seletores.some((s) => s.includes('data-painel')));
  assert.equal(doFoco.length, 10);
  for (const r of doFoco) {
    assert.equal(r.media, COMPUTADOR);
    for (const s of r.seletores) assert.ok(s.startsWith(FOCO), s);
  }
  // Nenhum outro CSS fala do atributo nem da marca.
  for (const nome of ['casca', 'telas', 'controles', 'onevessel', 'relatorio', 'previa', 'impressao']) {
    assert.doesNotMatch(ler(`css/${nome}.css`), /data-painel|data-principal/, nome);
  }
});

test('lista compacta: coluna de 360px que cede, colunas não principais fora, nome em reticências', () => {
  assert.deepEqual(declaracoesEm(janelas, COMPUTADOR, FOCO), ['display: flex', 'align-items: flex-start']);
  assert.deepEqual(declaracoesEm(janelas, COMPUTADOR, LISTA), ['flex: 0 1 360px', 'width: 360px', 'min-width: 0']);
  assert.deepEqual(declaracoesEm(janelas, COMPUTADOR, OCULTA), ['display: none']);
  assert.deepEqual(declaracoesEm(janelas, COMPUTADOR, NOME), ['width: 100%', 'max-width: 0']);
});

test('segundo plano: por cor, nunca opacity, sem véu nem bloqueio de clique', () => {
  assert.deepEqual(declaracoesEm(janelas, COMPUTADOR, FUNDO), ['color: var(--ov-texto-secundario)']);
  for (const r of regras(janelas).filter((x) => x.media === COMPUTADOR)) {
    assert.doesNotMatch(r.corpo, /opacity|pointer-events|overflow\s*:\s*hidden|backdrop/, r.seletores.join(', '));
    for (const s of r.seletores) assert.doesNotMatch(s, /ov-veu/);
  }
});

test('painel em primeiro plano: elevada, borda forte, sombra 2, o resto com mínimo de 520px, sticky com a altura toda', () => {
  assert.deepEqual(declaracoesEm(janelas, COMPUTADOR, PAINEL), [
    'position: sticky', 'top: var(--ov-barra-superior)', 'flex: 1 1 0', 'width: auto', 'min-width: 520px',
    'height: calc(100vh - var(--ov-barra-superior))', 'height: calc(100dvh - var(--ov-barra-superior))',
    'background: var(--ov-superficie-elevada)', 'border-left: 1px solid var(--ov-borda-forte)', 'box-shadow: var(--ov-sombra-2)',
  ]);
  // Vem depois do .ov-painel[data-abas] (mesma força): ganha a largura dele.
  const o = ordem(janelas);
  assert.ok(o.indexOf(`${COMPUTADOR}|${PAINEL}`) > o.indexOf('|.ov-painel[data-abas]'));
});

test('Detalhes em colunas de no mínimo 280px: pares da .ov-dados e campos do formulário', () => {
  assert.deepEqual(declaracoesEm(janelas, COMPUTADOR, DADOS), ['grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))', 'gap: 16px 24px']);
  assert.deepEqual(declaracoesEm(janelas, COMPUTADOR, PAR), ['display: grid', 'grid-template-columns: 128px 1fr', 'gap: 10px 12px', 'align-content: start']);
  assert.deepEqual(declaracoesEm(janelas, COMPUTADOR, FORM), ['display: grid', 'grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))', 'gap: 16px 24px', 'align-items: start']);
  assert.deepEqual(declaracoesEm(janelas, COMPUTADOR, FORM_RESTO), ['grid-column: 1 / -1']);
});

test('exemplo: seção do modo foco fora da .pagina, painel aberto nos dois temas e um fechado', () => {
  const i = exemplo.indexOf('<section class="foco">');
  assert.ok(i > exemplo.indexOf('<section class="largura">'), 'depois da largura');
  const secao = exemplo.slice(i, exemplo.indexOf('\n</section>', i));
  const molduras = secao.split('<div class="moldura" ').slice(1);
  assert.deepEqual(molduras.map((m) => m.slice(0, m.indexOf('>'))), ['data-theme="escuro"', 'data-theme="claro"', 'data-theme="claro"']);
  for (const [n, m] of molduras.entries()) {
    assert.match(m, /<div class="foco-area" data-painel="foco">/);
    assert.match(m, /<th data-principal>Nome<\/th><th>Função<\/th><th>Empresa<\/th><th data-principal>Estado<\/th>/);
    assert.equal((m.match(/aria-selected="true"><td class="nome" data-principal>/g) ?? []).length, n < 2 ? 1 : 0);
    assert.equal(m.includes('<aside class="ov-painel"'), n < 2);
  }
  for (const m of molduras.slice(0, 2)) {
    assert.match(m, /<dl class="ov-dados">\s*<div><dt>/);
    assert.match(m, /<div class="ov-campo-grupo">/);
  }
});

test('package.json 3.17.0; README com a tag, o modo foco no Painel e por que é minor', () => {
  assert.equal(pacote.version, '3.17.0');
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.17\.0"/);
  assert.match(leiame, /\*\*Modo foco\*\* \(v3\.17\.0\)/);
  assert.match(leiame, /\*\*Por que a v3\.17\.0 é minor:\*\*/);
});

// ---------- A medida, no navegador ----------

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

const abrir = async (largura, fn) => {
  const navegador = await chromium.launch();
  try {
    const pagina = await navegador.newPage({ viewport: { width: largura, height: 900 }, reducedMotion: 'reduce' });
    await pagina.goto(url('exemplo/index.html').href);
    return await fn(pagina);
  } finally {
    await navegador.close();
  }
};

// Medidas de cada contêiner da seção.
const medidas = () => [...document.querySelectorAll('.foco [data-painel="foco"]')].map((area) => {
  const painel = area.querySelector(':scope > .ov-painel');
  const lista = area.querySelector(':scope > .ov-cartao');
  const linhas = [...area.querySelectorAll('tbody tr')];
  const estilo = (el) => getComputedStyle(el);
  const raiz = estilo(area.closest('.moldura'));
  return {
    display: estilo(area).display,
    lista: lista.getBoundingClientRect().width,
    area: area.getBoundingClientRect().width,
    colunas: [...area.querySelectorAll('thead th')].filter((t) => estilo(t).display !== 'none').map((t) => t.textContent),
    nomeCorta: linhas.some((l) => { const n = l.querySelector('.nome'); return n.scrollWidth > n.clientWidth && estilo(n).textOverflow === 'ellipsis'; }),
    cores: linhas.map((l) => estilo(l).color),
    texto: raiz.getPropertyValue('--ov-texto').trim(),
    secundario: raiz.getPropertyValue('--ov-texto-secundario').trim(),
    terciario: raiz.getPropertyValue('--ov-texto-terciario').trim(),
    opacidades: linhas.map((l) => estilo(l).opacity),
    painel: painel && {
      largura: painel.getBoundingClientRect().width,
      posicao: estilo(painel).position,
      fundo: estilo(painel).backgroundColor,
      borda: estilo(painel).borderLeftColor,
      sombra: estilo(painel).boxShadow,
      colunasDados: estilo(painel.querySelector('.ov-dados')).gridTemplateColumns.split(' ').length,
      colunasForm: estilo(painel.querySelector('form')).gridTemplateColumns.split(' ').length,
    },
  };
});
const hex = (c) => {
  const [r, g, b] = c.match(/\d+/g).map(Number);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

test('medida: a 1440, lista de 360 com Nome e Estado, painel com o resto, Detalhes em duas colunas', { skip: chromium ? false : motivo }, async () => {
  const ms = await abrir(1440, (p) => p.evaluate(medidas));
  assert.equal(ms.length, 3);
  for (const m of ms.slice(0, 2)) {
    assert.equal(m.display, 'flex');
    assert.equal(m.lista, 360);
    assert.deepEqual(m.colunas, ['Nome', 'Estado']);
    assert.ok(m.nomeCorta, 'algum nome longo corta em reticências');
    assert.equal(m.painel.largura, m.area - 360);
    assert.ok(m.painel.largura >= 520);
    assert.equal(m.painel.posicao, 'sticky');
    assert.ok(m.painel.sombra !== 'none');
    assert.equal(m.painel.colunasDados, 2);
    assert.equal(m.painel.colunasForm, 2);
    // A linha aberta (a segunda) com o texto normal; as outras em secundário.
    m.cores.forEach((c, i) => assert.equal(hex(c), i === 1 ? m.texto : m.secundario, `linha ${i}`));
    assert.ok(m.opacidades.every((o) => o === '1'));
  }
  // Painel fechado: a lista volta inteira, sem segundo plano.
  const fechado = ms[2];
  assert.equal(fechado.display, 'block');
  assert.equal(fechado.painel, null);
  assert.equal(fechado.colunas.length, 8);
  assert.equal(fechado.lista, fechado.area);
  assert.ok(fechado.cores.every((c) => hex(c) === fechado.texto));
});

test('medida: as cores do painel são as do tema', { skip: chromium ? false : motivo }, async () => {
  const ms = await abrir(1440, (p) => p.evaluate(() => [...document.querySelectorAll('.foco .moldura')].slice(0, 2).map((m) => {
    const e = getComputedStyle(m);
    const painel = getComputedStyle(m.querySelector('.ov-painel'));
    return { elevada: e.getPropertyValue('--ov-superficie-elevada').trim(), forte: e.getPropertyValue('--ov-borda-forte').trim(), fundo: painel.backgroundColor, borda: painel.borderLeftColor };
  })));
  for (const m of ms) {
    assert.equal(hex(m.fundo), m.elevada);
    assert.equal(hex(m.borda), m.forte);
  }
});

test('medida: :hover e :focus-visible devolvem o texto normal à linha', { skip: chromium ? false : motivo }, async () => {
  const r = await abrir(1440, async (p) => {
    const linha = p.locator('.foco .moldura').first().locator('tbody tr').nth(4);
    await linha.scrollIntoViewIfNeeded();
    await linha.hover();
    await p.waitForTimeout(50);
    const hover = await linha.evaluate((l) => getComputedStyle(l).color);
    await p.mouse.move(0, 0);
    // Com movimento reduzido, o onevessel.css dá a tudo uma transição de
    // .01ms: a cor chega no quadro seguinte.
    await p.waitForTimeout(50);
    const solto = await linha.evaluate((l) => getComputedStyle(l).color);
    // Como as setas da tabela: uma tecla, e o script põe o foco na linha.
    await p.keyboard.press('Tab');
    await linha.evaluate((l) => l.focus());
    await p.waitForTimeout(50);
    const foco = await linha.evaluate((l) => ({ cor: getComputedStyle(l).color, visivel: l.matches(':focus-visible') }));
    const texto = await p.locator('.foco .moldura').first().evaluate((m) => getComputedStyle(m).getPropertyValue('--ov-texto').trim());
    const secundario = await p.locator('.foco .moldura').first().evaluate((m) => getComputedStyle(m).getPropertyValue('--ov-texto-secundario').trim());
    return { hover, solto, foco, texto, secundario };
  });
  assert.equal(hex(r.hover), r.texto);
  assert.equal(hex(r.solto), r.secundario);
  assert.ok(r.foco.visivel);
  assert.equal(hex(r.foco.cor), r.texto);
});

test('medida: o painel fica sob a barra superior com a altura toda ao rolar a lista', { skip: chromium ? false : motivo }, async () => {
  const r = await abrir(1440, (p) => p.evaluate(() => {
    const moldura = document.querySelector('.foco .moldura');
    const conteudo = moldura.querySelector('.ov-conteudo');
    const painel = moldura.querySelector('.ov-painel');
    const barra = moldura.querySelector('.ov-superior');
    // Mais linhas para a lista passar da altura da moldura.
    const corpo = moldura.querySelector('tbody');
    for (let i = 0; i < 4; i++) for (const l of [...corpo.children]) { const c = l.cloneNode(true); c.removeAttribute('aria-selected'); corpo.append(c); }
    conteudo.scrollTop = 400;
    const b = barra.getBoundingClientRect();
    const pn = painel.getBoundingClientRect();
    return { topoPainel: pn.top, baseBarra: b.bottom, altura: pn.height, janela: innerHeight, barra: b.height, rolou: conteudo.scrollTop };
  }));
  assert.ok(r.rolou > 0);
  assert.equal(r.topoPainel, r.baseBarra);
  assert.equal(r.altura, r.janela - r.barra);
});

test('medida: a 1024 com a lateral aberta, o painel mantém 520 e a lista cede, sem transbordar', { skip: chromium ? false : motivo }, async () => {
  const ms = await abrir(1024, (p) => p.evaluate(medidas));
  for (const m of ms.slice(0, 2)) {
    assert.equal(m.painel.largura, 520);
    assert.equal(m.lista, m.area - 520);
    assert.ok(m.lista < 360);
  }
});

test('medida: abaixo de 1024px (900 e 600) nada muda: folha fixa, as colunas e as cores da lista sem painel', { skip: chromium ? false : motivo }, async () => {
  for (const largura of [900, 600]) {
    const ms = await abrir(largura, (p) => p.evaluate(medidas));
    for (const m of ms.slice(0, 2)) {
      assert.equal(m.display, 'block', `${largura}`);
      assert.equal(m.painel.posicao, 'fixed', `${largura}`);
      // 900: o texto normal; 600: a legenda da lista de linhas (telas.css).
      assert.ok(m.cores.every((c) => hex(c) === (largura === 900 ? m.texto : m.terciario)), `${largura}`);
      assert.deepEqual(m.colunas, ms[2].colunas, `${largura}`);
    }
  }
});

// v3.21.0 (direção visual de Pessoas de 30/10 e livro v4, para Pessoas da
// Bordo, Templates e o Histórico do Paradas): a coluna ordenável
// (.ov-ordenar), a segunda linha da célula (.ov-celula-sub), o cursor de mão
// na linha que abre, os cantos do painel no modo foco e a duracao em
// js/datas.js. Minor: as fixtures da v3.20.0 (`test/fixtures/*-v3.20.0.css`,
// da tag, fixas) ficam iguais regra a regra, fora a alterada pelo nome.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { problemasDeBase, regras, seletores } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const NOMES = ['janelas', 'telas'];
const ATUAL = Object.fromEntries(NOMES.map((n) => [n, ler(`css/${n}.css`)]));
const ANTES = Object.fromEntries(NOMES.map((n) => [n, ler(`test/fixtures/${n}-v3.20.0.css`)]));
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');
const exemplo = ler('exemplo/index.html');

const COMPUTADOR = '@media (min-width: 1024px)';
const TOQUE = '@media (pointer: coarse)';
const PAINEL = '[data-painel="foco"]:has(> .ov-painel) > .ov-painel';
const ABRE = '.ov-tabela tbody tr:has([data-abre-linha])';
const ORDENADA = '.ov-tabela th:is([aria-sort="ascending"], [aria-sort="descending"]) .ov-ordenar';

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- minor: tudo da v3.20.0 igual, fora a alterada pelo nome ----------

const ALTERADAS = {
  janelas: {
    [`${COMPUTADOR}|${PAINEL}`]: ['position: sticky', 'top: calc(var(--ov-barra-superior) + 8px)', 'flex: 1 1 0', 'width: auto', 'min-width: 520px',
      'height: calc(100vh - var(--ov-barra-superior) - 16px)', 'height: calc(100dvh - var(--ov-barra-superior) - 16px)', 'margin: 8px 8px 8px 0',
      'background: var(--ov-superficie-elevada)', 'border: 1px solid var(--ov-borda-forte)', 'border-radius: var(--ov-raio-lg)', 'box-shadow: var(--ov-sombra-2)'],
  },
};

const NOVAS = {
  janelas: [`${COMPUTADOR}|${PAINEL} .ov-painel-corpo`],
  telas: [`|${ABRE}`, `|${ABRE} [data-abre-linha]`, `|:where(${ABRE} :is(input, select, textarea, button):not([data-abre-linha]))`,
    '|.ov-celula-sub', '|.ov-tabela th:has(> .ov-ordenar)', '|.ov-ordenar', '|.ov-tabela th.num .ov-ordenar', '|.ov-ordenar svg',
    '|.ov-ordenar:hover svg', '|.ov-ordenar:focus-visible svg', '|.ov-ordenar:focus-visible', `|${ORDENADA}`, `|${ORDENADA} svg`,
    '|.ov-tabela th[aria-sort="descending"] .ov-ordenar svg', `${TOQUE}|.ov-ordenar`],
};

for (const nome of NOMES) {
  test(`minor: toda regra do ${nome}.css da v3.20.0 igual, fora as alteradas pelo nome`, () => {
    const lista = ALTERADAS[nome] ?? {};
    for (const r of regras(ANTES[nome])) {
      for (const s of r.seletores) {
        const chave = `${r.media}|${s}`;
        if (s.startsWith('@')) { assert.ok(seletores(ATUAL[nome]).has(s), `sumiu: ${s}`); continue; }
        const velha = declaracoesEm(ANTES[nome], r.media, s);
        const nova = declaracoesEm(ATUAL[nome], r.media, s);
        if (chave in lista) {
          assert.notDeepEqual(nova, velha, `está na lista e não mudou: ${chave}`);
          assert.deepEqual(nova, lista[chave], chave);
        } else assert.deepEqual(nova, velha, chave);
      }
    }
  });

  test(`${nome}.css: o que nasceu na v3.21.0 é exatamente a lista, e a ordem das velhas não muda`, () => {
    const velhas = new Set(chaves(ANTES[nome]));
    assert.deepEqual(chaves(ATUAL[nome]).filter((c) => !velhas.has(c)), NOVAS[nome]);
    const fica = (c) => !NOVAS[nome].includes(c);
    assert.deepEqual(chaves(ATUAL[nome]).filter(fica), chaves(ANTES[nome]).filter(fica));
  });
}

test('janelas.css e telas.css continuam importáveis sozinhos, sem outline: none', () => {
  for (const nome of NOMES) {
    assert.deepEqual(problemasDeBase(nome, ATUAL[nome]), []);
    assert.doesNotMatch(ATUAL[nome], /outline:\s*(none|0)\b/);
  }
});

test('os outros CSS e os js de antes com os bytes da v3.20.0; as fixtures da tag', () => {
  const CSS = {
    casca: 'ff7ed72dda28e8729a7151b0cbdc7a7cea8f63453528f5852c0b4cfc8a54f1dd',
    controles: 'c56d3e940bd8045e11217414606972c15c5740ceefa906c4c658590e6f95da92',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    tokens: 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92',
  };
  assert.deepEqual(readdirSync(url('css')).filter((n) => n.endsWith('.css')).sort(), [...Object.keys(CSS), ...NOMES].map((n) => `${n}.css`).sort(), 'nenhum CSS nasce nem some');
  for (const [nome, sha] of Object.entries(CSS)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
  assert.equal(sha256('test/fixtures/janelas-v3.20.0.css'), '5ffa2125214366a593af8ee7c05be11aee555981b99f35c25f106b0413c44622');
  assert.equal(sha256('test/fixtures/telas-v3.20.0.css'), 'b511610c2f0995607ae0aba8cbbd26f5ebe3e75489e58b245a9561c4b817f4ba');
  const JS = {
    'alteracoes-nucleo': '3275de25a16812f027b05c60b8de52ea78eb9bce2143166437241c4a5b62cc71',
    camada: '45a04d3a63f1ccf2910e6cc347ebc01efe64182bcf30489921f4fb93e8a66c69',
    'filtro-nucleo': 'e261b28b16cf397aa957baef59e7cec2e1fdfa5c02d3e87c01d6a64dbb302ad5',
    'foco-preso': 'f9e36b7575c949c5d97ec1286f76cc9e5c84f73647201372dc646cfe35e7052c',
    'lateral-nucleo': 'b0b7ac1a063ee91e83420b10cbab0e6950bf61fa0aff7e4a9ad25eacfa325a01',
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
});

// ---------- O CSS novo ----------

test('.ov-ordenar: o th todo, sem borda nem fundo, a fonte e a cor do cabeçalho; a seta de 14 fraca sem ordem', () => {
  const t = ATUAL.telas;
  assert.deepEqual(declaracoesEm(t, '', '.ov-tabela th:has(> .ov-ordenar)'), ['padding: 0']);
  const b = declaracoesEm(t, '', '.ov-ordenar');
  for (const d of ['width: 100%', 'min-height: 36px', 'padding: 0 12px', 'border: 0', 'background: transparent', 'font: inherit', 'color: inherit', 'cursor: pointer']) assert.ok(b.includes(d), d);
  assert.ok(declaracoesEm(t, '', '.ov-tabela th.num .ov-ordenar').includes('justify-content: flex-end'));
  const svg = declaracoesEm(t, '', '.ov-ordenar svg');
  for (const d of ['width: 14px', 'height: 14px', 'color: var(--ov-texto-terciario)', 'opacity: .5']) assert.ok(svg.includes(d), d);
  assert.deepEqual(declaracoesEm(t, '', '.ov-ordenar:hover svg'), ['opacity: 1']);
  assert.deepEqual(declaracoesEm(t, '', '.ov-ordenar:focus-visible'), ['outline: 2px solid var(--ov-foco)', 'outline-offset: -2px']);
  assert.deepEqual(declaracoesEm(t, '', ORDENADA), ['color: var(--ov-texto)']);
  assert.deepEqual(declaracoesEm(t, '', `${ORDENADA} svg`), ['color: var(--ov-texto)', 'opacity: 1']);
  assert.deepEqual(declaracoesEm(t, '', '.ov-tabela th[aria-sort="descending"] .ov-ordenar svg'), ['transform: scaleY(-1)']);
  assert.deepEqual(declaracoesEm(t, TOQUE, '.ov-ordenar'), ['min-height: var(--ov-altura-toque)']);
});

test('.ov-celula-sub: bloco em legenda e terciário, com reticências; nenhuma regra a esconde no celular', () => {
  assert.deepEqual(declaracoesEm(ATUAL.telas, '', '.ov-celula-sub'), ['display: block', 'overflow: hidden', 'text-overflow: ellipsis', 'white-space: nowrap', 'font: var(--ov-fonte-legenda)', 'color: var(--ov-texto-terciario)']);
  assert.equal(regras(ATUAL.telas).filter((r) => r.seletores.some((s) => s.includes('ov-celula-sub'))).length, 1);
});

test('cursor: a linha que abre e a ação em pointer; os controles em auto, sem força', () => {
  assert.deepEqual(declaracoesEm(ATUAL.telas, '', ABRE), ['cursor: pointer']);
  assert.deepEqual(declaracoesEm(ATUAL.telas, '', `${ABRE} [data-abre-linha]`), ['cursor: pointer']);
  assert.deepEqual(declaracoesEm(ATUAL.telas, '', `:where(${ABRE} :is(input, select, textarea, button):not([data-abre-linha]))`), ['cursor: auto']);
});

// ---------- js/datas.js ----------

const declarados = (dts) => [...dts.matchAll(/^export declare (?:function|const) (\w+)/gm)].map((m) => m[1]).sort();

test('js/datas.js exporta exatamente o que o .d.ts declara, com a duracao', async () => {
  const modulo = await import('../js/datas.js');
  assert.deepEqual(Object.keys(modulo).sort(), declarados(ler('js/datas.d.ts')));
  assert.ok(Object.keys(modulo).includes('duracao'));
  assert.equal(modulo.duracao(2 * 60 * 60 * 1000 + 5 * 60 * 1000), '2h05');
});

// ---------- Versão, README e exemplo ----------

test('package.json 3.21.0; README com a tag, a seção da versão, a alterada e o exemplo da duracao', () => {
  assert.equal(pacote.version, '3.21.0');
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.21\.0"/);
  assert.match(leiame, /### Tabela de registros e duração \(v3\.21\.0\)/);
  assert.match(leiame, /\*\*Por que a v3\.21\.0 é minor:\*\*/);
  assert.match(leiame, /\*\*Alteradas pelo nome\*\*[^\n]*`\[data-painel="foco"\]:has\(> \.ov-painel\) > \.ov-painel`/);
  assert.match(leiame, /import \{ decorrido, duracao \} from 'onevessel-ui\/js\/datas\.js'/);
  assert.match(leiame, /`js\/datas\.js` \|[^\n]*`duracao` desde a v3\.21\.0/);
});

test('exemplo: a tabela de registros nos dois temas, ordenada nos dois sentidos', () => {
  const secao = exemplo.slice(exemplo.indexOf('<section class="registros">'), exemplo.indexOf('</section>', exemplo.indexOf('<section class="registros">')));
  assert.ok(secao.length > 0);
  for (const tema of ['escuro', 'claro']) assert.match(secao, new RegExp(`data-theme="${tema}"`));
  assert.match(secao, /aria-sort="ascending"/);
  assert.match(secao, /aria-sort="descending"/);
  assert.match(secao, /<th class="num" aria-sort="[a-z]+"><button class="ov-ordenar"/);
  assert.ok((secao.match(/class="ov-celula-sub"/g) ?? []).length >= 16);
  assert.ok((secao.match(/data-abre-linha/g) ?? []).length >= 8);
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

const tabelas = () => [...document.querySelectorAll('.registros .ov-tabela')].map((t) => {
  const e = (el) => getComputedStyle(el);
  const raiz = e(t.closest('[data-theme]'));
  const cor = (n) => raiz.getPropertyValue(n).trim();
  const ths = [...t.querySelectorAll('th:has(> .ov-ordenar)')].map((th) => {
    const b = th.querySelector('.ov-ordenar');
    const svg = b.querySelector('svg');
    return {
      sort: th.getAttribute('aria-sort'), num: th.classList.contains('num'),
      th: th.getBoundingClientRect().width, botao: b.getBoundingClientRect().width,
      thAltura: th.getBoundingClientRect().height, botaoAltura: b.getBoundingClientRect().height,
      cor: e(b).color, svg: { w: svg.getBoundingClientRect().width, cor: e(svg).color, opacidade: e(svg).opacity, transform: e(svg).transform },
      // A seta encosta na direita do botão na .num; o texto, na esquerda nas outras.
      direita: b.getBoundingClientRect().right - svg.getBoundingClientRect().right,
    };
  });
  const linha = t.tBodies[0].rows[0];
  const sub = linha.querySelector('.ov-celula-sub');
  return {
    texto: cor('--ov-texto'), terciario: cor('--ov-texto-terciario'),
    ths,
    sub: { display: e(sub).display, visivel: sub.getBoundingClientRect().height > 0, fonte: `${e(sub).fontSize}/${e(sub).lineHeight}`, peso: e(sub).fontWeight, cor: e(sub).color, overflow: e(sub).textOverflow },
    linhaAltura: linha.getBoundingClientRect().height,
    cursor: {
      td: e(linha.querySelector('td.meta')).cursor, sub: e(sub).cursor, acao: e(linha.querySelector('[data-abre-linha]')).cursor,
      check: e(linha.querySelector('.ov-check')).cursor, menu: e(linha.querySelector('.ov-btn')).cursor,
    },
  };
});
const hex = (c) => {
  const [r, g, b] = c.match(/\d+/g).map(Number);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

test('medida: a 1440, o botão ocupa o th, a seta de 14 vira com o sentido, a .num à direita, a segunda linha cabe nos 44', { skip: chromium ? false : motivo }, async () => {
  const ts = await abrir(1440, (p) => p.evaluate(tabelas));
  assert.equal(ts.length, 2);
  for (const t of ts) {
    for (const th of t.ths) {
      assert.equal(th.botao, th.th);
      // A meia borda do th (border-collapse) fica fora do botão.
      assert.ok(th.thAltura - th.botaoAltura <= 0.5, `${th.thAltura} ${th.botaoAltura}`);
      assert.equal(th.svg.w, 14);
      const ordenada = th.sort !== 'none';
      assert.equal(hex(th.cor), ordenada ? t.texto : t.terciario, th.sort);
      assert.equal(hex(th.svg.cor), ordenada ? t.texto : t.terciario);
      assert.equal(th.svg.opacidade, ordenada ? '1' : '0.5');
      assert.equal(th.svg.transform, th.sort === 'descending' ? 'matrix(1, 0, 0, -1, 0, 0)' : 'none');
      if (th.num) assert.equal(th.direita, 12, 'a seta da .num encosta no padding da direita');
    }
    assert.deepEqual(t.ths.map((x) => x.sort).filter((s) => s !== 'none').length, 1);
    assert.deepEqual({ ...t.sub, cor: hex(t.sub.cor) }, { display: 'block', visivel: true, fonte: '13px/18px', peso: '400', cor: t.terciario, overflow: 'ellipsis' });
    assert.equal(t.linhaAltura, 44);
    assert.deepEqual(t.cursor, { td: 'pointer', sub: 'pointer', acao: 'pointer', check: 'auto', menu: 'pointer' });
  }
  assert.deepEqual(ts.map((t) => t.ths.find((x) => x.sort !== 'none').sort), ['ascending', 'descending']);
});

test('medida: linha sem [data-abre-linha] não muda de cursor', { skip: chromium ? false : motivo }, async () => {
  const c = await abrir(1440, (p) => p.evaluate(() => getComputedStyle(document.querySelector('.largura .ov-tabela tbody td')).cursor));
  assert.equal(c, 'auto');
});

test('medida: abaixo de 768 (600) a segunda linha continua visível na lista do celular', { skip: chromium ? false : motivo }, async () => {
  const ts = await abrir(600, (p) => p.evaluate(tabelas));
  for (const t of ts) {
    assert.ok(t.sub.visivel);
    assert.equal(t.sub.fonte, '13px/18px');
  }
});

const painel = () => [...document.querySelectorAll('.foco [data-painel="foco"] > .ov-painel')].map((p) => {
  const e = getComputedStyle(p);
  const area = p.parentElement.getBoundingClientRect();
  const r = p.getBoundingClientRect();
  return { raio: e.borderRadius, margem: e.margin, borda: [e.borderTopWidth, e.borderRightWidth, e.borderBottomWidth, e.borderLeftWidth], direita: area.right - r.right, corpo: getComputedStyle(p.querySelector('.ov-painel-corpo')).borderRadius };
});

test('medida: a 1440, o painel no modo foco com os cantos de 12, a 8 da direita, a borda em volta', { skip: chromium ? false : motivo }, async () => {
  const ps = await abrir(1440, (p) => p.evaluate(painel));
  assert.equal(ps.length, 2);
  for (const p of ps) {
    assert.equal(p.raio, '12px');
    assert.equal(p.margem, '8px 8px 8px 0px');
    assert.deepEqual(p.borda, ['1px', '1px', '1px', '1px']);
    assert.equal(p.direita, 8);
    assert.equal(p.corpo, '0px 0px 12px 12px');
  }
});

test('medida: abaixo de 1024 (900) o painel é a Folha, como antes', { skip: chromium ? false : motivo }, async () => {
  const ps = await abrir(900, (p) => p.evaluate(painel));
  for (const p of ps) {
    assert.equal(p.raio, '16px 16px 0px 0px');
    assert.equal(p.margem, '0px');
    assert.equal(p.corpo, '0px');
  }
});

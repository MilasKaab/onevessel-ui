// v3.22.0 (U5 e o pendente do Menu, decididos pelo Salim em 02/11): o
// "Atenção" do indicador em alerta na linha da nota, em ov-destaque-texto, e
// o item de menu desabilitado (.ov-menu-item[aria-disabled="true"], com o
// .ov-motivo no toque). Minor: as fixtures da v3.21.0
// (`test/fixtures/*-v3.21.0.css`, da tag, fixas) ficam iguais regra a regra,
// fora a alterada pelo nome. Nenhum js muda: o núcleo do Menu não executa
// item nenhum (Enter e Espaço são do item; o clique, do app). Desde a v3.23.0,
// o lateral-nucleo daqui é a fixture da v3.22.0 (fixture com fixture), e a
// versão e a tag ficam com o teste da versão mais nova.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { problemasDeBase, regras, seletores } from '../scripts/css-regras.mjs';
import { acaoDaTeclaNoMenu } from '../js/menu-nucleo.js';

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
const NOMES = ['casca', 'telas'];
const ATUAL = Object.fromEntries(NOMES.map((n) => [n, ler(`css/${n}.css`)]));
const ANTES = Object.fromEntries(NOMES.map((n) => [n, ler(`test/fixtures/${n}-v3.21.0.css`)]));
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');
const exemplo = ler('exemplo/index.html');

const TOQUE = '@media (pointer: coarse)';
const DESABILITADO = '.ov-menu-item[aria-disabled="true"]';
const NOTA_COM_ALERTA = '.ov-indicador-nota:has(> .ov-indicador-alerta)';

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- minor: tudo da v3.21.0 igual, fora a alterada pelo nome ----------

const ALTERADAS = {
  telas: {
    '|.ov-indicador-alerta': ['margin-left: auto', 'display: inline-flex', 'align-items: center', 'gap: 4px', 'font-size: 12px', 'color: var(--ov-destaque-texto)'],
  },
};

const NOVAS = {
  casca: [`|${DESABILITADO}`, `|${DESABILITADO} svg`, `|${DESABILITADO}:hover:not(:focus-visible)`, `|${DESABILITADO} + .ov-motivo`, `${TOQUE}|${DESABILITADO} + .ov-motivo`],
  telas: [`|${NOTA_COM_ALERTA}`, '|.ov-indicador-nota > .ov-indicador-alerta'],
};

for (const nome of NOMES) {
  test(`minor: toda regra do ${nome}.css da v3.21.0 igual, fora as alteradas pelo nome`, () => {
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

  test(`${nome}.css: o que nasceu na v3.22.0 é exatamente a lista, e a ordem das velhas não muda`, () => {
    const velhas = new Set(chaves(ANTES[nome]));
    assert.deepEqual(chaves(ATUAL[nome]).filter((c) => !velhas.has(c)), NOVAS[nome]);
    const fica = (c) => !NOVAS[nome].includes(c);
    assert.deepEqual(chaves(ATUAL[nome]).filter(fica), chaves(ANTES[nome]).filter(fica));
  });
}

test('casca.css e telas.css continuam importáveis sozinhos, sem outline: none', () => {
  for (const nome of NOMES) {
    assert.deepEqual(problemasDeBase(nome, ATUAL[nome]), []);
    assert.doesNotMatch(ATUAL[nome], /outline:\s*(none|0)\b/);
  }
});

test('os outros CSS e os js com os bytes da v3.21.0; as fixtures da tag', () => {
  const CSS = {
    controles: 'c56d3e940bd8045e11217414606972c15c5740ceefa906c4c658590e6f95da92',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    janelas: 'c5f04f85a5c1c313affd658e7689485b10f2ae66b174a05bb88292359459b45b',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    tokens: 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92',
  };
  assert.deepEqual(readdirSync(url('css')).filter((n) => n.endsWith('.css')).sort(), [...Object.keys(CSS), ...NOMES].map((n) => `${n}.css`).sort(), 'nenhum CSS nasce nem some');
  // Desde a v3.24.0, os controles e as janelas daqui são as fixtures da
  // v3.23.0 (os bytes da v3.21.0): fixture com fixture.
  const fonteCss = (nome) => (['controles', 'janelas'].includes(nome) ? `test/fixtures/${nome}-v3.23.0.css` : `css/${nome}.css`);
  for (const [nome, sha] of Object.entries(CSS)) assert.equal(sha256(fonteCss(nome)), sha, nome);
  assert.equal(sha256('test/fixtures/casca-v3.21.0.css'), 'ff7ed72dda28e8729a7151b0cbdc7a7cea8f63453528f5852c0b4cfc8a54f1dd');
  assert.equal(sha256('test/fixtures/telas-v3.21.0.css'), '5ea97289a8903b01a764ec06043d3fcd7068a7da8e354b336661289dc54451e4');
  const JS = {
    'alteracoes-nucleo': '3275de25a16812f027b05c60b8de52ea78eb9bce2143166437241c4a5b62cc71',
    camada: '45a04d3a63f1ccf2910e6cc347ebc01efe64182bcf30489921f4fb93e8a66c69',
    datas: '72d30b9aa1d5e87567df5bc1c336b7d27d03140e29849dc7cd96f82ac626d30f',
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
  // Desde a v3.23.0, o lateral-nucleo daqui é a fixture da v3.22.0 (os bytes
  // de antes, que a v3.23.0 só acrescenta no fim): fixture com fixture.
  // Desde a v3.24.0, o datas daqui é a fixture da v3.23.0.
  const fonteJs = (nome) => (nome === 'lateral-nucleo' ? `test/fixtures/${nome}-v3.22.0.js` : nome === 'datas' ? `test/fixtures/${nome}-v3.23.0.js` : `js/${nome}.js`);
  for (const [nome, sha] of Object.entries(JS)) assert.equal(sha256(fonteJs(nome)), sha, nome);
  const js = readdirSync(url('js')).filter((n) => n.endsWith('.js')).map((n) => n.slice(0, -3)).sort();
  assert.deepEqual(js, Object.keys(JS).sort(), 'nenhum js nasce, some ou muda');
});

// ---------- O CSS novo ----------

test('"Atenção" na nota: flex, alinhado à última linha (flex-end antes, de recuo), sem encolher; o texto em ov-destaque-texto', () => {
  const t = ATUAL.telas;
  assert.deepEqual(declaracoesEm(t, '', NOTA_COM_ALERTA), ['display: flex', 'align-items: flex-end', 'align-items: last baseline', 'gap: 8px']);
  assert.deepEqual(declaracoesEm(t, '', '.ov-indicador-nota > .ov-indicador-alerta'), ['flex-shrink: 0']);
  // A borda e o filete do alerta continuam em ov-destaque.
  assert.deepEqual(declaracoesEm(t, '', '.ov-indicador[data-alerta="true"]'), ['border-color: var(--ov-destaque)', 'box-shadow: inset 3px 0 0 var(--ov-destaque)']);
});

test('item de menu desabilitado: terciário sem opacidade (U7), not-allowed, sem realce no hover; o motivo só no toque, com o recuo do texto', () => {
  const c = ATUAL.casca;
  assert.deepEqual(declaracoesEm(c, '', DESABILITADO), ['color: var(--ov-texto-terciario)', 'cursor: not-allowed']);
  assert.deepEqual(declaracoesEm(c, '', `${DESABILITADO} svg`), ['color: var(--ov-texto-terciario)']);
  // Depois da regra do perigo, com a mesma força: o vermelho sai.
  const ordem = regras(c).flatMap((r) => r.seletores);
  assert.ok(ordem.indexOf(DESABILITADO) > ordem.indexOf('.ov-menu-item[data-tom="perigo"]'));
  assert.ok(ordem.indexOf(`${DESABILITADO} svg`) > ordem.indexOf('.ov-menu-item[data-tom="perigo"] svg'));
  assert.doesNotMatch(c, /aria-disabled="true"\][^{]*\{[^}]*opacity/);
  assert.deepEqual(declaracoesEm(c, '', `${DESABILITADO}:hover:not(:focus-visible)`), ['background: transparent']);
  const motivo = declaracoesEm(c, '', `${DESABILITADO} + .ov-motivo`);
  for (const d of ['display: none', 'padding: 0 10px 6px 36px', 'font: 400 12px/16px var(--font-sans)', 'color: var(--ov-texto-terciario)']) assert.ok(motivo.includes(d), d);
  assert.deepEqual(declaracoesEm(c, TOQUE, `${DESABILITADO} + .ov-motivo`), ['display: block']);
});

test('menu-nucleo: Enter e Espaço não são do núcleo em item nenhum (o desabilitado não executa por ele)', () => {
  for (const key of ['Enter', ' ']) for (let i = -1; i < 4; i++) assert.equal(acaoDaTeclaNoMenu({ key }, i, 4), null);
});

// ---------- Versão, README e exemplo ----------

test('README com a seção da versão, a alterada, o contraste e os dois contratos', () => {
  assert.match(leiame, /### "Atenção" na nota e item de menu desabilitado \(v3\.22\.0\)/);
  assert.match(leiame, /\*\*Por que a v3\.22\.0 é minor:\*\*/);
  assert.match(leiame, /\*\*Alteradas pelo nome\*\*[^\n]*`\.ov-indicador-alerta`/);
  assert.match(leiame, /<div class="ov-indicador-nota"><span>3 atividades<\/span><span class="ov-indicador-alerta">Atenção<\/span><\/div>/);
  assert.match(leiame, /aria-disabled="true" aria-describedby="motivo-excluir" title="Tem embarques ou alocações no histórico\."/);
  assert.match(leiame, /<p class="ov-motivo" id="motivo-excluir">/);
  assert.match(leiame, /6,50:1/);
  assert.match(leiame, /7,75:1/);
  assert.match(leiame, /anel[^\n]*7,20:1[^\n]*8,74:1[^\n]*6,46:1[^\n]*7,79:1/);
});

test('exemplo: a seção nos dois temas, alerta com nota de uma e de três linhas e sem nota, desabilitado normal e de perigo', () => {
  const ini = exemplo.indexOf('<section class="atencao-menu">');
  const secao = exemplo.slice(ini, exemplo.indexOf('</section>', ini));
  assert.ok(ini > 0);
  for (const tema of ['escuro', 'claro']) {
    const i = secao.indexOf(`data-theme="${tema}"`);
    assert.ok(i > 0, tema);
    const bloco = secao.slice(i, tema === 'escuro' ? secao.indexOf('data-theme="claro"') : undefined);
    assert.equal((bloco.match(/<div class="ov-indicador-nota"><span>[^<]+<\/span><span class="ov-indicador-alerta">Atenção<\/span><\/div>/g) ?? []).length, 2);
    assert.match(bloco, /<div class="ov-indicador-rotulo">[^<]+<span class="ov-indicador-alerta">Atenção<\/span><\/div><div class="ov-indicador-valor">\d+<\/div><\/a>/);
    assert.match(bloco, /role="menuitem" type="button" aria-disabled="true" aria-describedby="motivo-arquivar-/);
    assert.match(bloco, /data-tom="perigo" aria-disabled="true" aria-describedby="motivo-excluir-/);
  }
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

const abrir = async (largura, fn, opcoes = {}) => {
  const navegador = await chromium.launch();
  try {
    const pagina = await navegador.newPage({ viewport: { width: largura, height: 900 }, reducedMotion: 'reduce', ...opcoes });
    await pagina.goto(url('exemplo/index.html').href);
    return await fn(pagina);
  } finally {
    await navegador.close();
  }
};

// Contraste WCAG entre duas cores rgb() opacas.
const contraste = (a, b) => {
  const l = (c) => {
    const [r, g, bl] = c.match(/\d+/g).slice(0, 3).map((v) => {
      const x = Number(v) / 255;
      return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [l(a), l(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const indicadores = () => [...document.querySelectorAll('.atencao-menu .controles-moldura')].map((m) => {
  const cartoes = [...m.querySelectorAll('.ov-indicador[data-alerta="true"]')];
  return {
    tema: m.dataset.theme,
    cartoes: cartoes.map((c) => {
      const nota = c.querySelector('.ov-indicador-nota');
      const alerta = c.querySelector('.ov-indicador-alerta');
      const r = (el) => el.getBoundingClientRect();
      const texto = nota?.querySelector('span:not(.ov-indicador-alerta)');
      const linhas = texto ? Math.round(r(texto).height / parseFloat(getComputedStyle(texto).lineHeight)) : 0;
      return {
        naNota: !!nota?.contains(alerta), linhas,
        display: nota ? getComputedStyle(nota).display : null,
        direita: nota ? r(nota).right - r(alerta).right : null,
        // A última linha do texto e o "Atenção" terminam juntos (±2px: 12 e 13px).
        pe: texto ? Math.abs(r(texto).bottom - r(alerta).bottom) : null,
        abaixoDoTopo: texto ? r(alerta).top - r(texto).top : null,
        cor: getComputedStyle(alerta).color, fonte: getComputedStyle(alerta).fontSize,
        fundo: getComputedStyle(c).backgroundColor, borda: getComputedStyle(c).borderTopColor,
        destaque: getComputedStyle(c).getPropertyValue('--ov-destaque').trim(),
      };
    }),
  };
});

for (const largura of [1280, 390]) {
  test(`medida: a ${largura}, o "Atenção" na nota à direita, na última linha; sem nota, no rótulo; contraste de 4,5:1 ou mais`, { skip: chromium ? false : motivo }, async () => {
    const ms = await abrir(largura, (p) => p.evaluate(indicadores));
    assert.deepEqual(ms.map((m) => m.tema), ['escuro', 'claro']);
    for (const m of ms) {
      const [uma, tres, sem] = m.cartoes;
      assert.deepEqual([uma.naNota, tres.naNota, sem.naNota], [true, true, false]);
      assert.equal(uma.linhas, 1);
      assert.equal(tres.linhas, 3, `${m.tema} a ${largura}: a nota longa em 3 linhas`);
      for (const c of [uma, tres]) {
        assert.equal(c.display, 'flex');
        assert.equal(c.direita, 0);
        assert.ok(c.pe <= 2, `${c.pe}`);
      }
      assert.ok(tres.abaixoDoTopo > 30, 'na última linha, não na primeira');
      for (const c of [uma, tres, sem]) {
        assert.equal(c.fonte, '12px');
        assert.ok(contraste(c.cor, c.fundo) >= 4.5, `${m.tema}: ${contraste(c.cor, c.fundo)}`);
      }
    }
    // Os valores do README.
    assert.equal(contraste(ms[0].cartoes[0].cor, ms[0].cartoes[0].fundo).toFixed(2), '7.75');
    assert.equal(contraste(ms[1].cartoes[0].cor, ms[1].cartoes[0].fundo).toFixed(2), '6.50');
  });
}

const menus = () => [...document.querySelectorAll('.atencao-menu .ov-menu')].map((menu) => {
  const itens = [...menu.querySelectorAll('.ov-menu-item')];
  return itens.map((i) => {
    const e = getComputedStyle(i);
    const m = i.nextElementSibling?.classList.contains('ov-motivo') ? i.nextElementSibling : null;
    return {
      desabilitado: i.getAttribute('aria-disabled') === 'true', perigo: i.dataset.tom === 'perigo',
      opacidade: e.opacity, cursor: e.cursor, cor: e.color, svg: i.querySelector('svg') ? getComputedStyle(i.querySelector('svg')).color : null,
      terciario: getComputedStyle(menu).getPropertyValue('--ov-texto-terciario').trim(), erro: getComputedStyle(menu).getPropertyValue('--ov-erro').trim(),
      motivo: m && { display: getComputedStyle(m).display, recuo: (() => { const g = document.createRange(); g.selectNodeContents(m); return g.getBoundingClientRect().left - i.getBoundingClientRect().left; })(), texto: i.querySelector('svg') ? i.querySelector('svg').getBoundingClientRect().right + 10 - i.getBoundingClientRect().left : null, descrito: i.getAttribute('aria-describedby') === m.id, title: i.title === m.textContent },
    };
  });
});
const hex = (c) => `#${c.match(/\d+/g).slice(0, 3).map((v) => Number(v).toString(16).padStart(2, '0')).join('')}`;

test('medida: no mouse, o desabilitado sem opacidade, texto e ícone em terciário (o perigo também), not-allowed, o motivo escondido', { skip: chromium ? false : motivo }, async () => {
  const ms = await abrir(1280, (p) => p.evaluate(menus));
  assert.equal(ms.length, 2);
  for (const itens of ms) {
    assert.deepEqual(itens.map((i) => i.desabilitado), [false, true, true]);
    for (const i of itens.filter((x) => x.desabilitado)) {
      assert.equal(i.opacidade, '1');
      assert.equal(hex(i.cor), i.terciario);
      assert.equal(hex(i.svg), i.terciario);
      assert.equal(i.cursor, 'not-allowed');
      assert.equal(i.motivo.display, 'none');
      assert.ok(i.motivo.descrito && i.motivo.title);
    }
    assert.notEqual(hex(itens[0].cor), itens[0].terciario);
    assert.notEqual(hex(itens[2].cor), itens[2].erro, 'o vermelho sai no desabilitado');
  }
});

test('medida: no toque, o motivo escrito abaixo, com o recuo do texto do item', { skip: chromium ? false : motivo }, async () => {
  const ms = await abrir(390, (p) => p.evaluate(menus), { hasTouch: true, isMobile: true });
  for (const itens of ms) {
    for (const i of itens.filter((x) => x.desabilitado)) {
      assert.equal(i.motivo.display, 'block');
      assert.equal(i.motivo.recuo, 36);
      assert.equal(i.motivo.recuo, i.motivo.texto);
    }
  }
});

// Cor rgba() composta sobre uma opaca.
const sobre = (c, fundo) => {
  const [r, g, b, a = 1] = c.match(/[\d.]+/g).map(Number);
  const [R, G, B] = fundo.match(/\d+/g).map(Number);
  return `rgb(${Math.round(r * a + R * (1 - a))}, ${Math.round(g * a + G * (1 - a))}, ${Math.round(b * a + B * (1 - a))})`;
};

test('medida: hover sem realce no desabilitado (o habilitado ganha); foco pelo teclado com fundo e anel inteiros, de 3:1 ou mais; Enter não tira o foco', { skip: chromium ? false : motivo }, async () => {
  const temas = await abrir(1280, async (p) => {
    const saida = {};
    for (const tema of ['escuro', 'claro']) {
      const menu = p.locator(`.atencao-menu .controles-moldura[data-theme="${tema}"] .ov-menu`);
      const fundo = (item) => item.evaluate((el) => getComputedStyle(el).backgroundColor);
      // O onevessel.css põe 0,01 ms de transição em tudo no movimento reduzido:
      // um quadro de espera antes de ler a cor.
      const editar = menu.locator('.ov-menu-item').first();
      await editar.hover();
      await p.waitForTimeout(50);
      const habilitado = await fundo(editar);
      const itens = [];
      for (const item of await menu.locator('[aria-disabled="true"]').all()) {
        await item.hover();
        await p.waitForTimeout(50);
        const hover = await fundo(item);
        await p.mouse.move(0, 0);
        await p.keyboard.press('Shift');
        await item.focus();
        await p.waitForTimeout(50);
        const foco = await item.evaluate((el) => {
          const e = getComputedStyle(el);
          return { fundo: e.backgroundColor, anel: e.outlineStyle, largura: e.outlineWidth, corAnel: e.outlineColor, opacidade: e.opacity, visivel: el.matches(':focus-visible'), menu: getComputedStyle(el.closest('.ov-menu')).backgroundColor };
        });
        await p.keyboard.press('Enter');
        const continua = await item.evaluate((el) => document.activeElement === el);
        itens.push({ hover, foco, continua });
      }
      saida[tema] = { habilitado, itens };
    }
    return saida;
  });
  const anel = {};
  for (const [tema, r] of Object.entries(temas)) {
    assert.notEqual(r.habilitado, 'rgba(0, 0, 0, 0)');
    assert.equal(r.itens.length, 2, 'o normal e o de perigo');
    for (const i of r.itens) {
      assert.equal(i.hover, 'rgba(0, 0, 0, 0)');
      assert.ok(i.foco.visivel);
      assert.deepEqual([i.foco.anel, i.foco.largura, i.foco.opacidade], ['solid', '2px', '1']);
      assert.notEqual(i.foco.fundo, 'rgba(0, 0, 0, 0)');
      // O anel por dentro (recuo -2): de um lado o fundo do menu, do outro o do item em foco.
      const contraMenu = contraste(i.foco.corAnel, i.foco.menu);
      const contraItem = contraste(i.foco.corAnel, sobre(i.foco.fundo, i.foco.menu));
      assert.ok(contraMenu >= 3 && contraItem >= 3, `${tema}: ${contraMenu} ${contraItem}`);
      anel[tema] = [contraMenu.toFixed(2), contraItem.toFixed(2)];
      assert.ok(i.continua);
    }
  }
  // Os valores do README.
  assert.deepEqual(anel, { escuro: ['8.74', '7.79'], claro: ['7.20', '6.46'] });
});

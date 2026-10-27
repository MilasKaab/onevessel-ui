// v3.18.0 (decidido pelo Salim em 27/10, noite): visões grandes,
// .ov-visoes[data-tamanho="grande"], para a divisão principal de uma tela (o
// Paradas: Atividades planejadas / A bordo). Partes iguais num controle com
// cara de cartão (ov-superficie opaco, contorno ov-borda, raio nos quatro
// cantos, divisória de 1px), 64px no computador e 56 abaixo de 768px, preso
// sob a barra superior. A selecionada: ov-acao-suave, filete de 2px por
// sombra interna, rótulo em ov-texto (o ov-acao-texto dava 4,07:1 no claro)
// e ícone em ov-acao-texto. O .ov-rotulo por extenso a partir de 768px, o
// .ov-tnum abaixo. Minor: a fixture da v3.17.0
// (`test/fixtures/telas-v3.17.0.css`, da tag, fixa) fica igual regra a
// regra; só nasce o que está aqui.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { regras } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const telas = ler('css/telas.css');
const antes = ler('test/fixtures/telas-v3.17.0.css');
const tokens = ler('css/tokens.css');
const exemplo = ler('exemplo/index.html');
const leiame = ler('README.md');
const pacote = JSON.parse(ler('package.json'));

const CELULAR = '@media (max-width: 767px)';
const GRANDE = '.ov-visoes[data-tamanho="grande"]';
const VISAO = `${GRANDE} > .ov-visao`;
const ICONE = `${VISAO} svg`;
const DIVISORIA = `${VISAO} + .ov-visao`;
const FOCO = `${VISAO}:focus-visible`;
const SELECIONADA = `${VISAO}:is([aria-selected="true"], [aria-current="page"])`;
const ICONE_SEL = `${SELECIONADA} svg`;
const ROTULO = `${GRANDE} .ov-rotulo`;
const NUMERO = `${GRANDE} .ov-tnum`;

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));
const ordem = (texto) => regras(texto).map((r) => `${r.media}|${r.seletores.join(', ')}`);

// ---------- minor: tudo da v3.17.0 igual; só nasce o novo ----------

const NOVAS = [
  ...[GRANDE, VISAO, ICONE, DIVISORIA, FOCO, SELECIONADA, ICONE_SEL, ROTULO, NUMERO].map((s) => `|${s}`),
  ...[GRANDE, VISAO, ROTULO, NUMERO].map((s) => `${CELULAR}|${s}`),
];

test('minor: toda regra do telas.css da v3.17.0 igual, e só nascem as visões grandes', () => {
  for (const r of regras(antes)) {
    for (const s of r.seletores) assert.deepEqual(declaracoesEm(telas, r.media, s), declaracoesEm(antes, r.media, s), `${r.media}|${s}`);
  }
  const velhas = new Set(chaves(antes));
  assert.deepEqual(chaves(telas).filter((c) => !velhas.has(c)), NOVAS);
  // A ordem das velhas não muda; as novas vêm logo depois das visões normais.
  const novas = new Set(NOVAS);
  assert.deepEqual(ordem(telas).filter((c) => !novas.has(c)), ordem(antes));
  const o = ordem(telas);
  assert.equal(o.indexOf(`|${GRANDE}`), o.indexOf('@media (pointer: coarse)|.ov-visao') + 1);
});

test('os outros CSS com os bytes da v3.17.0', () => {
  const SHA = {
    casca: 'e416342d156f26fe70a17d52b390e144e33079d78aa31b78d949511fe15961d0',
    janelas: '8ab843278eafba3adb4923e70c818e56adf5abc0509467f6cc6c5b7d1f0da038',
    tokens: 'fefa160e9e66f8c7529b9efa3208d1561a8d1ef7acbaf92d521f1b4989b2afd1',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    controles: 'e18ae6db69fc02205e45929f09afbd1b61e33212bf0aaf64d030c5c9edbfe9de',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
  };
  for (const [nome, sha] of Object.entries(SHA)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
  assert.equal(sha256('test/fixtures/telas-v3.17.0.css'), '3eed809d323ba240d4e8065fe31447bd0ddf3f5c6f52a43825e8a97575390fe0');
});

// ---------- O novo ----------

test('visões grandes: toda regra presa ao atributo, e nenhum outro CSS fala dele (o data-tamanho do Diálogo é outro)', () => {
  const doAtributo = regras(telas).filter((r) => r.seletores.some((s) => s.includes('data-tamanho')));
  assert.equal(doAtributo.length, NOVAS.length);
  for (const r of doAtributo) for (const s of r.seletores) assert.ok(s.startsWith(GRANDE), s);
  for (const nome of ['casca', 'janelas', 'controles', 'onevessel', 'relatorio', 'previa', 'impressao']) {
    assert.doesNotMatch(ler(`css/${nome}.css`), /ov-visoes?\[data-tamanho|ov-visoes?\b[^{]*data-tamanho/, nome);
  }
});

test('o conjunto: cartão opaco preso sob a barra, partes iguais, 64px', () => {
  assert.deepEqual(declaracoesEm(telas, '', GRANDE), [
    'position: sticky', 'top: var(--ov-barra-superior)', 'z-index: var(--ov-z-flutuante)',
    'display: grid', 'grid-auto-flow: column', 'grid-auto-columns: minmax(0, 1fr)', 'gap: 0', 'box-sizing: border-box', 'height: 64px',
    'overflow: hidden', 'border: 1px solid var(--ov-borda)', 'border-radius: var(--ov-raio-md)', 'background: var(--ov-superficie)',
  ]);
  assert.deepEqual(declaracoesEm(telas, '', DIVISORIA), ['border-left: 1px solid var(--ov-borda)']);
});

test('a visão: ícone e rótulo centrados numa linha, o .ov-rotulo numa linha própria; o número só no celular', () => {
  assert.deepEqual(declaracoesEm(telas, '', VISAO), [
    'flex-wrap: wrap', 'justify-content: center', 'align-content: center', 'gap: 2px 6px', 'min-width: 0',
    'height: auto', 'padding: 0 12px', 'border-radius: 0', 'text-align: center',
  ]);
  assert.deepEqual(declaracoesEm(telas, '', ICONE), ['flex: 0 0 auto']);
  assert.deepEqual(declaracoesEm(telas, '', ROTULO), ['flex: 0 0 100%', 'color: var(--ov-texto-secundario)']);
  assert.deepEqual(declaracoesEm(telas, '', NUMERO), ['display: none', 'color: var(--ov-texto-secundario)']);
});

test('a selecionada: ov-acao-suave, filete de 2px por sombra interna, rótulo em ov-texto e ícone em ov-acao-texto', () => {
  assert.deepEqual(declaracoesEm(telas, '', SELECIONADA), ['background: var(--ov-acao-suave)', 'color: var(--ov-texto)', 'box-shadow: inset 0 -2px 0 var(--ov-acao)']);
  assert.deepEqual(declaracoesEm(telas, '', ICONE_SEL), ['color: var(--ov-acao-texto)']);
  // Sem border-bottom (sairia curvo nos cantos) e sem ov-acao-texto no texto.
  for (const r of regras(telas).filter((x) => x.seletores.some((s) => s.startsWith(GRANDE)))) {
    assert.doesNotMatch(r.corpo, /border-bottom/, r.seletores.join(', '));
    if (!r.seletores.every((s) => s.endsWith(' svg'))) assert.doesNotMatch(r.corpo, /ov-acao-texto/, r.seletores.join(', '));
  }
  // O anel do livro, para dentro: o cartão corta o que passa da borda.
  assert.deepEqual(declaracoesEm(telas, '', FOCO), ['outline: 2px solid var(--ov-foco)', 'outline-offset: -2px']);
});

test('abaixo de 768px: 56px, top somando a área segura, o número no lugar do texto', () => {
  assert.deepEqual(declaracoesEm(telas, CELULAR, GRANDE), ['top: calc(var(--ov-barra-superior) + env(safe-area-inset-top, 0px))', 'height: 56px']);
  assert.deepEqual(declaracoesEm(telas, CELULAR, VISAO), ['flex-wrap: nowrap', 'padding: 0 8px']);
  assert.deepEqual(declaracoesEm(telas, CELULAR, ROTULO), ['display: none']);
  assert.deepEqual(declaracoesEm(telas, CELULAR, NUMERO), ['display: inline']);
  // A mesma altura do .ov-cabecalho-movel, que leva a área segura.
  assert.match(declaracoesEm(ler('css/casca.css'), '', '.ov-cabecalho-movel').join('; '), /height: calc\(var\(--ov-barra-superior\) \+ env\(safe-area-inset-top, 0px\)\)/);
});

// ---------- Contraste, pelos tokens, nos dois temas ----------

const bloco = (cabeca) => {
  const i = tokens.indexOf(cabeca);
  const c = tokens.slice(tokens.indexOf('{', i) + 1, tokens.indexOf('}', i));
  return Object.fromEntries([...c.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};
const escuro = bloco(':root,\n[data-theme="escuro"]');
const TEMAS = { escuro, claro: { ...escuro, ...bloco('[data-theme="claro"] {') } };
const cor = (v) => {
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).concat(1);
  m = v.match(/^rgba\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/);
  return m ? m.slice(1).map(Number) : null;
};
const sobre = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
const luminancia = (c) => {
  const [r, g, b] = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

for (const [tema, t] of Object.entries(TEMAS)) {
  test(`contraste no tema ${tema}: rótulo, subtítulo, ícone e anel, na selecionada e nas outras`, () => {
    const confere = (frente, fundo, minimo, rotulo) => {
      const r = contraste(cor(t[frente]), fundo);
      assert.ok(r >= minimo, `${tema}: ${rotulo} com ${r.toFixed(2)}:1, menos de ${minimo}:1`);
    };
    const cartao = cor(t['ov-superficie']);
    const selecionada = sobre(cor(t['ov-acao-suave']), cartao);
    confere('ov-texto', selecionada, 4.5, 'rótulo da selecionada');
    confere('ov-texto-secundario', selecionada, 4.5, 'subtítulo da selecionada');
    confere('ov-acao-texto', selecionada, 3, 'ícone da selecionada');
    confere('ov-foco', selecionada, 3, 'anel na selecionada');
    confere('ov-texto-secundario', cartao, 4.5, 'rótulo e subtítulo das outras');
    confere('ov-foco', cartao, 3, 'anel nas outras');
  });
}
// O motivo da decisão: o ov-acao-texto no rótulo não passaria no claro.
test('o ov-acao-texto sobre o ov-acao-suave fica abaixo de 4,5:1 no tema claro, sobre o ov-fundo', () => {
  const t = TEMAS.claro;
  const r = contraste(cor(t['ov-acao-texto']), sobre(cor(t['ov-acao-suave']), cor(t['ov-fundo'])));
  assert.ok(r < 4.5, r.toFixed(2));
});

test('exemplo: seção das visões grandes depois do modo foco, nos dois temas, com o filtro normal abaixo', () => {
  const i = exemplo.indexOf('<section class="visoes-grandes">');
  assert.ok(i > exemplo.indexOf('<section class="foco">'), 'depois do modo foco');
  const secao = exemplo.slice(i, exemplo.indexOf('\n</section>', i));
  const molduras = secao.split('<div class="moldura" ').slice(1);
  assert.deepEqual(molduras.map((m) => m.slice(0, m.indexOf('>'))), ['data-theme="escuro"', 'data-theme="claro"']);
  for (const m of molduras) {
    assert.match(m, /<div class="ov-visoes" data-tamanho="grande" role="tablist" aria-label="Parada">/);
    assert.equal((m.match(/role="tab" id="aba-/g) ?? []).length, 2);
    assert.equal((m.match(/aria-selected="true" aria-controls="painel-/g) ?? []).length, 1);
    assert.equal((m.match(/<span class="ov-rotulo">\d+ atividades [^<]+<\/span><span class="ov-tnum">\d+<\/span><\/button>/g) ?? []).length, 2);
    assert.match(m, /<div class="ov-visoes" role="tablist" aria-label="Filtro">/);
    assert.match(m, /role="tabpanel"/);
  }
});

test('package.json 3.18.0; README com a tag, as visões grandes e por que é minor', () => {
  assert.equal(pacote.version, '3.18.0');
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.18\.0"/);
  assert.match(leiame, /\*\*Visões grandes\*\* \(v3\.18\.0\)/);
  assert.match(leiame, /\*\*Por que a v3\.18\.0 é minor:\*\*/);
  assert.match(leiame, /<div class="ov-visoes" data-tamanho="grande" role="tablist"/);
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

// Medidas de cada moldura da seção, antes e depois de rolar.
const medidas = () => [...document.querySelectorAll('.visoes-grandes .moldura')].map((moldura) => {
  const e = (el) => getComputedStyle(el);
  const raiz = e(moldura);
  const token = (n) => raiz.getPropertyValue(`--${n}`).trim();
  const faixa = moldura.querySelector('[data-tamanho="grande"]');
  const visoes = [...faixa.querySelectorAll(':scope > .ov-visao')];
  const caixa = (el) => el.getBoundingClientRect();
  const visivel = (el) => e(el).display !== 'none' && caixa(el).width > 0;
  const cada = visoes.map((v) => {
    const svg = v.querySelector('svg');
    const rotulo = v.querySelector('.ov-rotulo');
    const numero = v.querySelector('.ov-tnum');
    const cv = caixa(v);
    const meio = (el) => { const c = caixa(el); return c.left + c.width / 2; };
    return {
      largura: cv.width, altura: cv.height, meio: cv.left + cv.width / 2,
      cor: e(v).color, fundo: e(v).backgroundColor, sombra: e(v).boxShadow, borda: e(v).borderLeftWidth,
      corIcone: e(svg).color,
      rotulo: visivel(rotulo) && { meio: meio(rotulo), topo: caixa(rotulo).top, cor: e(rotulo).color, base: caixa(svg).bottom },
      numero: visivel(numero) && { cor: e(numero).color, topo: caixa(numero).top, iconeTopo: caixa(svg).top },
    };
  });
  return {
    altura: caixa(faixa).height, posicao: e(faixa).position, z: e(faixa).zIndex,
    fundo: e(faixa).backgroundColor, contorno: e(faixa).borderTopColor, raio: e(faixa).borderTopLeftRadius,
    largura: caixa(faixa).width, cada,
    filtro: caixa(moldura.querySelector('[aria-label="Filtro"] .ov-visao')).height,
    tokens: Object.fromEntries(['ov-superficie', 'ov-borda', 'ov-texto', 'ov-texto-secundario', 'ov-acao', 'ov-acao-texto', 'ov-acao-suave'].map((n) => [n, token(n)])),
  };
});
const rgb = (c) => {
  const m = c.match(/^#([0-9a-f]{6})$/i);
  if (m) return `rgb(${[0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).join(', ')})`;
  return c.replace(/^rgba\(([^)]+)\)$/, (_, v) => `rgba(${v.split(',').map((x) => String(Number(x))).join(', ')})`);
};

for (const [largura, altura, celular] of [[1440, 64, false], [768, 64, false], [375, 56, true]]) {
  test(`medida a ${largura}: ${altura}px, partes iguais, cores da selecionada e das outras, ${celular ? 'o número' : 'o subtítulo abaixo'}`, { skip: chromium ? false : motivo }, async () => {
    const ms = await abrir(largura, (p) => p.evaluate(medidas));
    assert.equal(ms.length, 2);
    for (const m of ms) {
      const t = m.tokens;
      assert.equal(m.altura, altura);
      assert.equal(m.posicao, 'sticky');
      assert.equal(m.z, '20');
      assert.equal(m.fundo, rgb(t['ov-superficie']));
      assert.equal(m.contorno, rgb(t['ov-borda']));
      assert.equal(m.raio, '8px');
      // Partes iguais (a divisória de 1px fica dentro da segunda).
      assert.equal(m.cada[0].largura, m.cada[1].largura);
      assert.equal(m.cada[0].largura * 2, m.largura - 2);
      assert.equal(m.cada[1].borda, '1px');
      const [sel, outra] = m.cada;
      assert.equal(sel.fundo, rgb(t['ov-acao-suave']));
      assert.equal(sel.cor, rgb(t['ov-texto']));
      assert.equal(sel.corIcone, rgb(t['ov-acao-texto']));
      assert.equal(sel.sombra, `${rgb(t['ov-acao'])} 0px -2px 0px 0px inset`);
      assert.equal(outra.fundo, 'rgba(0, 0, 0, 0)');
      assert.equal(outra.cor, rgb(t['ov-texto-secundario']));
      assert.equal(outra.corIcone, rgb(t['ov-texto-secundario']));
      assert.equal(outra.sombra, 'none');
      for (const v of m.cada) {
        if (celular) {
          assert.equal(v.rotulo, false);
          assert.equal(v.numero.cor, rgb(t['ov-texto-secundario']));
        } else {
          assert.equal(v.numero, false);
          // Centrado e abaixo da linha do ícone.
          assert.ok(Math.abs(v.rotulo.meio - v.meio) <= 1, `${v.rotulo.meio} ${v.meio}`);
          assert.ok(v.rotulo.topo >= v.rotulo.base, 'subtítulo abaixo do ícone');
          assert.equal(v.rotulo.cor, rgb(t['ov-texto-secundario']));
        }
      }
      // O filtro abaixo continua nas visões normais.
      assert.equal(m.filtro, 32);
    }
  });

  test(`medida a ${largura}: presa sob a ${celular ? 'barra do celular' : 'barra superior'} ao rolar, por cima dos cards`, { skip: chromium ? false : motivo }, async () => {
    const r = await abrir(largura, (p) => p.evaluate((celular) => [...document.querySelectorAll('.visoes-grandes .moldura')].map((moldura) => {
      const conteudo = moldura.querySelector('.ov-conteudo');
      const faixa = moldura.querySelector('[data-tamanho="grande"]');
      const barra = moldura.querySelector(celular ? '.ov-cabecalho-movel' : '.ov-superior');
      // A moldura na janela, para o elementFromPoint achar a faixa.
      moldura.scrollIntoView({ block: 'start' });
      conteudo.scrollTop = 300;
      const f = faixa.getBoundingClientRect();
      // O que aparece no meio da faixa é a própria faixa, não um card.
      const ponto = document.elementFromPoint(f.left + 4, f.top + f.height / 2);
      return { rolou: conteudo.scrollTop, topo: f.top, base: barra.getBoundingClientRect().bottom, emCima: faixa.contains(ponto) };
    }), celular));
    for (const m of r) {
      assert.ok(m.rolou > 0);
      assert.equal(m.topo, m.base);
      assert.ok(m.emCima);
    }
  });
}

test('medida: o foco por teclado desenha o anel para dentro', { skip: chromium ? false : motivo }, async () => {
  const r = await abrir(1440, async (p) => {
    const aba = p.locator('.visoes-grandes .moldura').first().locator('[role="tab"][aria-selected="true"]').first();
    await aba.scrollIntoViewIfNeeded();
    await p.keyboard.press('Tab');
    await aba.focus();
    // Com movimento reduzido, o onevessel.css dá a tudo uma transição de
    // .01ms: o anel chega no quadro seguinte.
    await p.waitForTimeout(50);
    return aba.evaluate((v) => ({ visivel: v.matches(':focus-visible'), estilo: getComputedStyle(v).outlineStyle, largura: getComputedStyle(v).outlineWidth, recuo: getComputedStyle(v).outlineOffset }));
  });
  assert.ok(r.visivel);
  assert.deepEqual([r.estilo, r.largura, r.recuo], ['solid', '2px', '-2px']);
});

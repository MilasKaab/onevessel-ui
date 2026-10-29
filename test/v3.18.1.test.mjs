// v3.18.1 (decidido pelo Salim em 28/10, manhã): duas correções no que já
// existe. (1) Modo foco: as linhas que não estão abertas passam de
// ov-texto-secundario a ov-texto-terciario e peso 400, também no .nome (o
// secundário quase não se via no tema claro); :hover e :focus-visible
// devolvem cor e peso. (2) Visões grandes: a troca .ov-rotulo/.ov-tnum e a
// altura 64/56 olham a largura do próprio controle (@container), não a da
// janela; a 1024 com o painel o subtítulo cortava. Patch: as fixtures da
// v3.18.0 (`test/fixtures/{janelas,telas}-v3.18.0.css`, da tag, fixas) ficam
// iguais regra a regra, fora as alteradas pelo nome. Desde a v3.18.2, as
// telas daqui são a fixture da v3.18.1 (fixture com fixture), e a versão e a
// tag ficam com o teste da versão mais nova.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { regras } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const ATUAL = { janelas: ler('css/janelas.css'), telas: ler('test/fixtures/telas-v3.18.1.css') };
const ANTES = { janelas: ler('test/fixtures/janelas-v3.18.0.css'), telas: ler('test/fixtures/telas-v3.18.0.css') };
const tokens = ler('css/tokens.css');
const exemplo = ler('exemplo/index.html');
const leiame = ler('README.md');

const COMPUTADOR = '@media (min-width: 1024px)';
const CELULAR = '@media (max-width: 767px)';
const ESTREITO = '@container ov-visoes (width < 398px)';
const FUNDO = '[data-painel="foco"]:has(> .ov-painel) .ov-tabela tbody tr:not([aria-selected="true"], :hover, :focus-visible, :has(:focus-visible))';
const FUNDO_NOME = `${FUNDO} .nome`;
const GRANDE = '.ov-visoes[data-tamanho="grande"]';
const VISAO = `${GRANDE} > .ov-visao`;
const ROTULO = `${GRANDE} .ov-rotulo`;
const NUMERO = `${GRANDE} .ov-tnum`;

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- patch: tudo da v3.18.0 igual, fora as alteradas pelo nome ----------

// Alteradas: a chave (bloco|seletor) continua, as declarações mudam.
// Saídas: a chave some (o número sai do @media para o @container).
// Novas: chaves que não existiam.
const MUDANCAS = {
  janelas: {
    alteradas: [`${COMPUTADOR}|${FUNDO}`],
    saidas: [],
    novas: [`${COMPUTADOR}|${FUNDO_NOME}`],
  },
  telas: {
    alteradas: [`|${GRANDE}`, `|${VISAO}`, `${CELULAR}|${GRANDE}`],
    saidas: [`${CELULAR}|${VISAO}`, `${CELULAR}|${ROTULO}`, `${CELULAR}|${NUMERO}`],
    novas: [`${ESTREITO}|${VISAO}`, `${ESTREITO}|${ROTULO}`, `${ESTREITO}|${NUMERO}`],
  },
};

for (const nome of ['janelas', 'telas']) {
  test(`patch: toda regra do ${nome}.css da v3.18.0 igual, fora as alteradas pelo nome`, () => {
    const { alteradas, saidas, novas } = MUDANCAS[nome];
    const fora = new Set([...alteradas, ...saidas]);
    for (const r of regras(ANTES[nome])) {
      for (const s of r.seletores) {
        if (fora.has(`${r.media}|${s}`)) continue;
        assert.deepEqual(declaracoesEm(ATUAL[nome], r.media, s), declaracoesEm(ANTES[nome], r.media, s), `${r.media}|${s}`);
      }
    }
    const velhas = new Set(chaves(ANTES[nome]));
    const agora = new Set(chaves(ATUAL[nome]));
    assert.deepEqual(chaves(ATUAL[nome]).filter((c) => !velhas.has(c)), novas);
    assert.deepEqual(chaves(ANTES[nome]).filter((c) => !agora.has(c)), saidas);
    for (const c of alteradas) assert.ok(velhas.has(c) && agora.has(c), c);
  });
}

test('os outros CSS com os bytes da v3.18.0; as fixtures da tag', () => {
  const SHA = {
    casca: 'e416342d156f26fe70a17d52b390e144e33079d78aa31b78d949511fe15961d0',
    tokens: 'fefa160e9e66f8c7529b9efa3208d1561a8d1ef7acbaf92d521f1b4989b2afd1',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    controles: 'e18ae6db69fc02205e45929f09afbd1b61e33212bf0aaf64d030c5c9edbfe9de',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
  };
  for (const [nome, sha] of Object.entries(SHA)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
  assert.equal(sha256('test/fixtures/janelas-v3.18.0.css'), '8ab843278eafba3adb4923e70c818e56adf5abc0509467f6cc6c5b7d1f0da038');
  assert.equal(sha256('test/fixtures/telas-v3.18.0.css'), '8dd002efe39253a1c601a458dce50bae472d8d92bee6d82bbacadff5f8ad56f4');
  assert.equal(sha256('test/fixtures/telas-v3.18.1.css'), '8eb57da191c50eb42d401a814611d3df660c8b463c3309bab4ab882dbee4939c');
});

// ---------- (1) Modo foco ----------

test('modo foco: as linhas não abertas em ov-texto-terciario e 400, o .nome também; nunca opacity', () => {
  const j = ATUAL.janelas;
  assert.deepEqual(declaracoesEm(ANTES.janelas, COMPUTADOR, FUNDO), ['color: var(--ov-texto-secundario)']);
  assert.deepEqual(declaracoesEm(j, COMPUTADOR, FUNDO), ['color: var(--ov-texto-terciario)', 'font-weight: 400']);
  assert.deepEqual(declaracoesEm(j, COMPUTADOR, FUNDO_NOME), ['font-weight: 400']);
  // O .nome tem peso próprio (telas.css): por isso a regra dele.
  assert.ok(declaracoesEm(ATUAL.telas, '', '.ov-tabela .nome').includes('font-weight: 500'));
  // Logo depois da regra da linha, e nada de opacity no bloco.
  const o = regras(j).filter((r) => r.media === COMPUTADOR).map((r) => r.seletores.join(', '));
  assert.equal(o.indexOf(FUNDO_NOME), o.indexOf(FUNDO) + 1);
  for (const r of regras(j).filter((x) => x.media === COMPUTADOR)) assert.doesNotMatch(r.corpo, /opacity/);
});

// ---------- (2) Visões grandes ----------

test('visões grandes: o controle é contêiner, sem altura; a altura nas visões, 62 (64 com o contorno)', () => {
  const t = ATUAL.telas;
  assert.deepEqual(declaracoesEm(t, '', GRANDE), [
    'position: sticky', 'top: var(--ov-barra-superior)', 'z-index: var(--ov-z-flutuante)',
    'display: grid', 'grid-auto-flow: column', 'grid-auto-columns: minmax(0, 1fr)', 'gap: 0', 'box-sizing: border-box',
    'overflow: hidden', 'container-type: inline-size', 'container-name: ov-visoes',
    'border: 1px solid var(--ov-borda)', 'border-radius: var(--ov-raio-md)', 'background: var(--ov-superficie)',
  ]);
  // O de antes, menos a altura (que foi para as visões).
  assert.deepEqual(declaracoesEm(ANTES.telas, '', GRANDE).filter((d) => d !== 'height: 64px'), declaracoesEm(t, '', GRANDE).filter((d) => !d.startsWith('container-')));
  // O sticky e o z-index ficam.
  assert.ok(declaracoesEm(t, '', GRANDE).includes('position: sticky'));
  assert.ok(declaracoesEm(t, '', GRANDE).includes('z-index: var(--ov-z-flutuante)'));
  assert.deepEqual(declaracoesEm(t, '', VISAO), declaracoesEm(ANTES.telas, '', VISAO).map((d) => (d === 'height: auto' ? 'height: 62px' : d)));
});

test('visões grandes: no @media do celular fica só o top com a área segura; a troca vai para o @container de 398px', () => {
  const t = ATUAL.telas;
  assert.deepEqual(declaracoesEm(t, CELULAR, GRANDE), ['top: calc(var(--ov-barra-superior) + env(safe-area-inset-top, 0px))']);
  assert.deepEqual(declaracoesEm(t, ESTREITO, VISAO), ['flex-wrap: nowrap', 'height: 54px', 'padding: 0 8px']);
  assert.deepEqual(declaracoesEm(t, ESTREITO, ROTULO), declaracoesEm(ANTES.telas, CELULAR, ROTULO));
  assert.deepEqual(declaracoesEm(t, ESTREITO, NUMERO), declaracoesEm(ANTES.telas, CELULAR, NUMERO));
  // Nenhum outro @container no pacote, e nenhum outro CSS fala do nome.
  for (const nome of ['casca', 'janelas', 'telas', 'controles', 'onevessel', 'relatorio', 'previa', 'impressao']) {
    const cs = regras(nome === 'telas' ? ATUAL.telas : ler(`css/${nome}.css`)).filter((r) => r.media.startsWith('@container'));
    assert.equal(cs.length, nome === 'telas' ? 3 : 0, nome);
    for (const r of cs) for (const s of r.seletores) assert.ok(s.startsWith(GRANDE), s);
  }
});

// ---------- Contraste do terciário, pelos tokens, nos dois temas ----------

const bloco = (cabeca) => {
  const i = tokens.indexOf(cabeca);
  const c = tokens.slice(tokens.indexOf('{', i) + 1, tokens.indexOf('}', i));
  return Object.fromEntries([...c.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};
const escuro = bloco(':root,\n[data-theme="escuro"]');
const TEMAS = { escuro, claro: { ...escuro, ...bloco('[data-theme="claro"] {') } };
const cor = (v) => [0, 2, 4].map((i) => parseInt(v.match(/^#([0-9a-f]{6})$/i)[1].slice(i, i + 2), 16));
const luminancia = (c) => {
  const [r, g, b] = c.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

for (const [tema, t] of Object.entries(TEMAS)) {
  test(`contraste no tema ${tema}: o terciário das linhas em segundo plano passa do AA na superfície da tabela e no fundo`, () => {
    for (const fundo of ['ov-superficie', 'ov-fundo']) {
      const r = contraste(cor(t['ov-texto-terciario']), cor(t[fundo]));
      assert.ok(r >= 4.5, `${tema}: terciário sobre ${fundo} com ${r.toFixed(2)}:1`);
    }
  });
}
// Os números do registro (28/10): 5,9:1 no claro e 5,8:1 no escuro, na superfície.
test('contraste: 5,9:1 no claro e 5,8:1 no escuro, sobre ov-superficie', () => {
  assert.equal(contraste(cor(TEMAS.claro['ov-texto-terciario']), cor(TEMAS.claro['ov-superficie'])).toFixed(1), '5.9');
  assert.equal(contraste(cor(TEMAS.escuro['ov-texto-terciario']), cor(TEMAS.escuro['ov-superficie'])).toFixed(1), '5.8');
});

// ---------- Exemplo, README, versão ----------

test('exemplo: seção da coluna estreita depois das visões grandes, nos dois temas, com o painel simulado', () => {
  const i = exemplo.indexOf('<section class="visoes-coluna">');
  assert.ok(i > exemplo.indexOf('<section class="visoes-grandes">'), 'depois das visões grandes');
  const secao = exemplo.slice(i, exemplo.indexOf('\n</section>', i));
  const molduras = secao.split('<div class="moldura" ').slice(1);
  assert.deepEqual(molduras.map((m) => m.slice(0, m.indexOf('>'))), ['data-theme="escuro"', 'data-theme="claro"']);
  for (const m of molduras) {
    assert.match(m, /<div class="ov-visoes" data-tamanho="grande" role="tablist" aria-label="Parada">/);
    assert.equal((m.match(/<span class="ov-rotulo">\d+ atividades [^<]+<\/span><span class="ov-tnum">\d+<\/span><\/button>/g) ?? []).length, 2);
    assert.match(m, /class="painel-simulado"/);
  }
  assert.match(exemplo, /\.coluna-e-painel > \.coluna \{ flex: 0 0 var\(--coluna, 232px\)/);
});

test('README com as duas correções e por que é patch', () => {
  assert.match(leiame, /\*\*Modo foco, segundo plano revisto\*\* \(v3\.18\.1\)/);
  assert.match(leiame, /\*\*Visões grandes pela largura do controle\*\* \(v3\.18\.1\)/);
  assert.match(leiame, /\*\*Por que a v3\.18\.1 é patch:\*\*/);
});

// ---------- As medidas, no navegador ----------

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
    // O controle é contêiner: o Chrome refaz o estilo das visões depois do
    // layout dele, e com movimento reduzido o onevessel.css dá a tudo uma
    // transição de .01ms (a divisória chegava a ser lida em 2px, a borda do
    // botão do navegador); um quadro de espera.
    await pagina.waitForTimeout(50);
    return await fn(pagina);
  } finally {
    await navegador.close();
  }
};
const hex = (c) => `#${c.match(/\d+/g).slice(0, 3).map((v) => Number(v).toString(16).padStart(2, '0')).join('')}`;

// Cada faixa de uma seção: altura, o que aparece, se o texto cabe, e o
// sticky depois de rolar a moldura.
const faixas = (secao) => [...document.querySelectorAll(`${secao} .moldura`)].map((moldura) => {
  const faixa = moldura.querySelector('[data-tamanho="grande"]');
  const e = (el) => getComputedStyle(el);
  const visivel = (el) => e(el).display !== 'none' && el.getBoundingClientRect().width > 0;
  const antes = {
    largura: faixa.getBoundingClientRect().width,
    altura: faixa.getBoundingClientRect().height,
    contem: e(faixa).containerType,
    visoes: [...faixa.children].map((v) => ({
      rotulo: visivel(v.querySelector('.ov-rotulo')),
      numero: visivel(v.querySelector('.ov-tnum')),
      rotuloCabe: v.querySelector('.ov-rotulo').scrollWidth <= v.querySelector('.ov-rotulo').clientWidth,
    })),
  };
  const conteudo = moldura.querySelector('.ov-conteudo');
  const barra = moldura.querySelector(innerWidth < 768 ? '.ov-cabecalho-movel' : '.ov-superior');
  moldura.scrollIntoView({ block: 'start' });
  conteudo.scrollTop = 300;
  const f = faixa.getBoundingClientRect();
  const ponto = document.elementFromPoint(f.left + 4, f.top + f.height / 2);
  return { ...antes, posicao: e(faixa).position, z: e(faixa).zIndex, rolou: conteudo.scrollTop, topo: f.top, base: barra.getBoundingClientRect().bottom, emCima: faixa.contains(ponto) };
});

const confereSticky = (m) => {
  assert.equal(m.posicao, 'sticky');
  assert.equal(m.z, '20');
  assert.ok(m.rolou > 0);
  assert.equal(m.topo, m.base, 'presa sob a barra');
  assert.ok(m.emCima, 'por cima dos cards');
};

test('medida a 1440: controle largo, 64px e o subtítulo inteiro; sticky com o contêiner', { skip: chromium ? false : motivo }, async () => {
  const ms = await abrir(1440, (p) => p.evaluate(faixas, '.visoes-grandes'));
  assert.equal(ms.length, 2);
  for (const m of ms) {
    assert.ok(m.largura >= 400);
    assert.equal(m.contem, 'inline-size');
    assert.equal(m.altura, 64);
    for (const v of m.visoes) assert.deepEqual(v, { rotulo: true, numero: false, rotuloCabe: true });
    confereSticky(m);
  }
});

test('medida a 375: 56px e o número, presa sob a barra do celular', { skip: chromium ? false : motivo }, async () => {
  const ms = await abrir(375, (p) => p.evaluate(faixas, '.visoes-grandes'));
  for (const m of ms) {
    assert.ok(m.largura < 400);
    assert.equal(m.altura, 56);
    for (const v of m.visoes) assert.deepEqual([v.rotulo, v.numero], [false, true]);
    confereSticky(m);
  }
});

test('medida a 1440, coluna estreita (232px, o Paradas a 1024 com o painel): 56px e o número, mesmo com a janela larga; sticky', { skip: chromium ? false : motivo }, async () => {
  const ms = await abrir(1440, (p) => p.evaluate(faixas, '.visoes-coluna'));
  assert.equal(ms.length, 2);
  for (const m of ms) {
    assert.equal(m.largura, 232);
    assert.equal(m.altura, 56);
    for (const v of m.visoes) assert.deepEqual([v.rotulo, v.numero], [false, true]);
    confereSticky(m);
  }
});

test('medida: o limite é 400px de controle (399 estreito, 400 largo), na janela de 1440', { skip: chromium ? false : motivo }, async () => {
  for (const [coluna, altura, rotulo] of [[399, 56, false], [400, 64, true]]) {
    const ms = await abrir(1440, async (p) => {
      // A coluna estreita do exemplo em outra largura (o --coluna). Com
      // movimento reduzido, o onevessel.css dá a tudo uma transição de
      // .01ms: a largura chega no quadro seguinte.
      await p.evaluate((c) => { for (const el of document.querySelectorAll('.visoes-coluna .coluna')) el.style.setProperty('--coluna', `${c}px`); }, coluna);
      await p.waitForTimeout(50);
      return p.evaluate(faixas, '.visoes-coluna');
    });
    for (const m of ms) {
      assert.equal(m.largura, coluna);
      assert.equal(m.altura, altura, `${coluna}`);
      for (const v of m.visoes) assert.deepEqual([v.rotulo, v.numero], [rotulo, !rotulo], `${coluna}`);
      if (rotulo) for (const v of m.visoes) assert.ok(v.rotuloCabe, `${coluna}: subtítulo cabe`);
    }
  }
});

// O modo foco: cor e peso das linhas, e o que o :hover e o foco devolvem.
const linhasDoFoco = () => [...document.querySelectorAll('.foco .moldura')].slice(0, 2).map((m) => {
  const raiz = getComputedStyle(m);
  const linhas = [...m.querySelectorAll('[data-painel="foco"] tbody tr')];
  return {
    texto: raiz.getPropertyValue('--ov-texto').trim(),
    terciario: raiz.getPropertyValue('--ov-texto-terciario').trim(),
    linhas: linhas.map((l) => ({ aberta: l.getAttribute('aria-selected') === 'true', cor: getComputedStyle(l).color, peso: getComputedStyle(l).fontWeight, nome: getComputedStyle(l.querySelector('.nome')).fontWeight, opacidade: getComputedStyle(l).opacity })),
  };
});

test('medida a 1440, modo foco: as linhas não abertas em terciário e 400 (nome também); a aberta em ov-texto e o nome em 500', { skip: chromium ? false : motivo }, async () => {
  const ms = await abrir(1440, (p) => p.evaluate(linhasDoFoco));
  assert.equal(ms.length, 2);
  for (const m of ms) {
    assert.equal(m.linhas.filter((l) => l.aberta).length, 1);
    for (const l of m.linhas) {
      assert.equal(l.opacidade, '1');
      if (l.aberta) {
        assert.equal(hex(l.cor), m.texto);
        assert.equal(l.nome, '500');
      } else {
        assert.equal(hex(l.cor), m.terciario);
        assert.deepEqual([l.peso, l.nome], ['400', '400']);
      }
    }
  }
});

test('medida a 1440, modo foco: :hover e :focus-visible devolvem a cor e o peso (nome em 500)', { skip: chromium ? false : motivo }, async () => {
  const r = await abrir(1440, async (p) => {
    const linha = p.locator('.foco .moldura').first().locator('tbody tr').nth(4);
    const ler = () => linha.evaluate((l) => ({ cor: getComputedStyle(l).color, nome: getComputedStyle(l.querySelector('.nome')).fontWeight, visivel: l.matches(':focus-visible') }));
    await linha.scrollIntoViewIfNeeded();
    await linha.hover();
    await p.waitForTimeout(50);
    const hover = await ler();
    await p.mouse.move(0, 0);
    await p.waitForTimeout(50);
    const solto = await ler();
    await p.keyboard.press('Tab');
    await linha.evaluate((l) => l.focus());
    await p.waitForTimeout(50);
    const foco = await ler();
    const tokens = await p.locator('.foco .moldura').first().evaluate((m) => ['--ov-texto', '--ov-texto-terciario'].map((n) => getComputedStyle(m).getPropertyValue(n).trim()));
    return { hover, solto, foco, tokens };
  });
  const [texto, terciario] = r.tokens;
  assert.deepEqual([hex(r.hover.cor), r.hover.nome], [texto, '500']);
  assert.deepEqual([hex(r.solto.cor), r.solto.nome], [terciario, '400']);
  assert.ok(r.foco.visivel);
  assert.deepEqual([hex(r.foco.cor), r.foco.nome], [texto, '500']);
});

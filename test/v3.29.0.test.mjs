// v3.29.0 (T3, T7 e T8 de 26/11, revistos pelo Salim no F4-5 do Materiais):
// o interruptor com a palavra antes do trilho, o trilho na borda direita, o
// apagado por aria-disabled e o motivo sob o controle, mostrado pelo app.
// Minor: a fixture da v3.28.0 (`test/fixtures/controles-v3.28.0.css`, da
// tag, fixa) fica igual regra a regra, fora as alteradas pelo nome; o que
// nasce é a lista.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize } from 'node:path';

import { problemasDeBase, regras, semComentario } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');
const exemplo = ler('exemplo/index.html');

const ATUAL = ler('css/controles.css');
const ANTES = ler('test/fixtures/controles-v3.28.0.css');

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

const IT = '.ov-interruptor';
const HOVER_ANTES = '.ov-interruptor:hover:not(:disabled):not([aria-busy="true"])';
const HOVER = '.ov-interruptor:hover:not(:disabled):not([aria-busy="true"]):not([aria-disabled="true"])';
const PALAVRA = '.ov-interruptor-palavra';
const APAGADO = '.ov-interruptor[aria-disabled="true"]';
const APAGADO_FILHOS = '.ov-interruptor[aria-disabled="true"] > *';
const MOTIVO = '.ov-interruptor + .ov-motivo';
const MOTIVO_VISIVEL = '.ov-interruptor + .ov-motivo[data-visivel="true"]';

// As alteradas pelo nome, com o antes e o depois.
const ALTERADAS = {
  [`|${IT}`]: {
    antes: ['margin: 0', 'padding: 0 6px 0 4px'],
    depois: ['margin: 0 -4px 0 0', 'padding: 0 4px 0 6px'],
  },
  [`|${PALAVRA}`]: { antes: [], depois: ['text-align: end'] },
};

test('controles.css, minor: toda regra da v3.28.0 igual, fora as alteradas pelo nome; o hover troca de seletor com a mesma declaração; nasce só a lista', () => {
  for (const r of regras(ANTES)) {
    for (const s of r.seletores) {
      const chave = `${r.media}|${s}`;
      if (s === HOVER_ANTES) continue;
      const antes = declaracoesEm(ANTES, r.media, s);
      const agora = declaracoesEm(ATUAL, r.media, s);
      const alt = ALTERADAS[chave];
      if (!alt) { assert.deepEqual(agora, antes, chave); continue; }
      assert.deepEqual(antes.filter((d) => !alt.antes.includes(d)), agora.filter((d) => !alt.depois.includes(d)), `${chave}: o resto igual`);
      for (const d of alt.antes) assert.ok(antes.includes(d) && !agora.includes(d), `${chave}: saiu ${d}`);
      for (const d of alt.depois) assert.ok(agora.includes(d), `${chave}: entrou ${d}`);
    }
  }
  assert.equal(declaracoesEm(ATUAL, '', HOVER_ANTES), null, 'o hover de antes saiu');
  assert.deepEqual(declaracoesEm(ATUAL, '', HOVER), declaracoesEm(ANTES, '', HOVER_ANTES), 'o hover novo, a mesma declaração');
  const velhas = chaves(ANTES).map((c) => (c === `|${HOVER_ANTES}` ? `|${HOVER}` : c));
  const agora = chaves(ATUAL);
  assert.deepEqual(agora.filter((c) => !velhas.includes(c)), [`|${APAGADO}`, `|${APAGADO_FILHOS}`, `|${MOTIVO}`, `|${MOTIVO_VISIVEL}`], 'o que nasce');
  assert.deepEqual(agora.filter((c) => velhas.includes(c)), velhas, 'a ordem das velhas');
});

test('interruptor: a folga do lado do trilho (padding-right) volta inteira na margem negativa; a palavra alinhada à direita na reserva de "Inativo"', () => {
  const botao = declaracoesEm(ATUAL, '', IT);
  const padding = botao.find((d) => d.startsWith('padding:')).slice(9).split(' ').map((v) => parseFloat(v));
  const margem = botao.find((d) => d.startsWith('margin:')).slice(8).split(' ').map((v) => parseFloat(v));
  assert.equal(padding[1], 4);
  assert.equal(margem[1], -padding[1], 'margem direita = -padding direito');
  assert.deepEqual([margem[0], margem[2], margem[3]], [0, 0, 0]);
  assert.deepEqual(declaracoesEm(ATUAL, '', PALAVRA), ['display: inline-block', 'text-align: end']);
  assert.deepEqual(declaracoesEm(ATUAL, '', `${PALAVRA}::after`), ['content: "Inativo"', 'display: block', 'height: 0', 'overflow: hidden', 'visibility: hidden']);
});

test('interruptor apagado: aria-disabled com o .6 nos filhos (o anel inteiro) e not-allowed; o :disabled continua; o motivo sob o controle e o data-visivel', () => {
  assert.deepEqual(declaracoesEm(ATUAL, '', APAGADO), ['cursor: not-allowed']);
  assert.deepEqual(declaracoesEm(ATUAL, '', APAGADO_FILHOS), ['opacity: .6']);
  assert.deepEqual(declaracoesEm(ATUAL, '', '.ov-interruptor:disabled'), ['opacity: .6', 'cursor: not-allowed'], 'o disabled de antes');
  assert.deepEqual(declaracoesEm(ATUAL, '', MOTIVO), ['text-align: end', 'white-space: normal']);
  assert.deepEqual(declaracoesEm(ATUAL, '', MOTIVO_VISIVEL), ['display: block']);
  assert.deepEqual(declaracoesEm(ATUAL, '(pointer: coarse)', '.ov-motivo') ?? declaracoesEm(ATUAL, '@media (pointer: coarse)', '.ov-motivo'), ['display: block'], 'no toque, sempre');
  // Nenhuma regra nova num @media: o data-visivel vale em qualquer ponteiro.
  for (const r of regras(ATUAL).filter((x) => x.seletores.some((s) => /aria-disabled|ov-interruptor \+/.test(s)))) assert.equal(r.media, '');
});

test('controles.css importável sozinho, sem outline: none nem !important novo', () => {
  const importantes = (t) => (semComentario(t).match(/!important/g) ?? []).length;
  assert.deepEqual(problemasDeBase('controles.css', ATUAL), []);
  assert.doesNotMatch(ATUAL, /outline:\s*(none|0)\b/);
  assert.equal(importantes(ATUAL), importantes(ANTES));
});

const DA_V3280 = {
  'css/casca.css': 'dec8032af2c2ca28e82bdfe576d867610c546bb768a9fdc0a1728e24ae0be338',
  'css/fontes.css': '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
  'css/impressao.css': 'caa847f2a4f114828ac12e95ddbc68e47b89ec6b616bf5014121d0f28c52deaf',
  'css/janelas.css': 'a29143557a341d047f2e8797d17f22db6d7486be92d2828f9cf709a8bd9cbab3',
  'css/onevessel.css': 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
  'css/previa.css': '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
  'css/relatorio.css': '4e541be44ca429a6f113b4fe29478477f9c914af709fddcd2f4556cf22ac50b1',
  'css/telas.css': 'aca9e4153479af32f7a1170dc146e40e41705a5b9ba244994e56be27a6f6e177',
  'css/tokens.css': '5c4b6eec97edf1d5a498e754e1506db51d2979c73c9ef328b4660b79014d5470',
  'tailwind/preset.js': '9adaa96a15e4741e0aa5c9386bc87dd894159e7e04774ae854a5b0c04eb4af0a',
};
test('os outros CSS, os tokens e o preset com os bytes da v3.28.0; a fixture da tag', () => {
  for (const [arquivo, sha] of Object.entries(DA_V3280)) assert.equal(sha256(arquivo), sha, arquivo);
  const css = readdirSync(url('css')).filter((n) => n.endsWith('.css')).map((n) => `css/${n}`).sort();
  assert.deepEqual(css, [...Object.keys(DA_V3280).filter((a) => a.startsWith('css/')), 'css/controles.css'].sort(), 'nenhum CSS nasce nem some');
  assert.equal(sha256('test/fixtures/controles-v3.28.0.css'), '43468567c33a2d90f17ba181cbcc0e52ce0977624cfe42cdcc87a13c6576fb52');
});

test('exemplo: todo interruptor com a palavra antes do trilho; o apagado com aria-disabled, title e motivo logo depois; a tabela nos dois temas', () => {
  const botoes = [...exemplo.matchAll(/<button type="button" role="switch" class="ov-interruptor"([^>]*)>(.*?)<\/button>/g)];
  assert.equal(botoes.length, 24, '16 nos painéis e 8 nas tabelas');
  for (const [, , dentro] of botoes) assert.equal(dentro, `<span class="ov-interruptor-palavra" aria-hidden="true">${dentro.match(/>(Ativo|Inativo)</)[1]}</span><span class="ov-interruptor-trilho" aria-hidden="true"></span>`);
  const apagados = botoes.filter(([, a]) => /aria-disabled="true"/.test(a));
  assert.equal(apagados.length, 6);
  for (const [todo, a] of apagados) {
    const id = a.match(/aria-describedby="([^"]+)"/)[1];
    const titulo = a.match(/title="([^"]+)"/)[1];
    assert.ok(exemplo.includes(`${todo}<p class="ov-motivo" id="${id}">${titulo}</p>`), id);
  }
  assert.doesNotMatch(exemplo, /class="ov-interruptor"[^>]* disabled[ >]/, 'nenhum disabled nativo no exemplo');
  for (const tema of ['escuro', 'claro']) assert.match(exemplo, new RegExp(`<table class="ov-tabela tabela-interruptor" aria-label="Setores · tema ${tema}">`));
  assert.match(exemplo, /setAttribute\('data-visivel', 'true'\)/);
});

test('package.json 3.29.0 sem export novo; README com a tag, a seção, a marcação nova e o contrato', () => {
  assert.equal(pacote.version, '3.29.0');
  assert.equal(Object.keys(pacote.exports).length, 32);
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.29\.0"/);
  assert.match(leiame, /### Interruptor revisto \(v3\.29\.0\)/);
  assert.match(leiame, /\*\*Alteradas pelo nome:\*\* `\.ov-interruptor` \(`margin: 0` → `margin: 0 -4px 0 0`; `padding: 0 6px 0 4px` → `padding: 0 4px 0 6px`\)/);
  assert.match(leiame, /\*\*Por que a v3\.29\.0 é minor:\*\*/);
  assert.doesNotMatch(leiame, /Por que patch/);
  const controles = leiame.slice(leiame.indexOf('### Controles'), leiame.indexOf('### Telas'));
  assert.match(controles, /o pacote não esconde: o motivo mostrado fica visível até a regra deixar de valer, quando a tela recarrega, ou até a pessoa sair da tela/);
  assert.match(controles, /<span class="ov-interruptor-palavra" aria-hidden="true">Ativo<\/span>\n\s*<span class="ov-interruptor-trilho" aria-hidden="true"><\/span>/);
  assert.match(controles, /\*\*Apagado pela regra\*\* \(v3\.29\.0[^\n]*`aria-disabled="true"`[^\n]*`data-visivel="true"`/);
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

// Para cada interruptor: a borda direita do conteúdo do contêiner (a dd, a
// td), o fim do trilho, o fim de um valor de texto da mesma coluna, as
// folgas da bolinha, quanto o botão passa da borda e o motivo.
const medir = () => {
  const fimDoTexto = (e) => { const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect().right; };
  const borda = (c) => { const cs = getComputedStyle(c); return c.getBoundingClientRect().right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth); };
  return [...document.querySelectorAll('.interruptor-ex dd .ov-interruptor, .interruptor-tabela-ex td .ov-interruptor')].map((it) => {
    const c = it.parentElement;
    const trilho = it.querySelector('.ov-interruptor-trilho');
    const t = trilho.getBoundingClientRect();
    const e = getComputedStyle(trilho, '::before');
    const b = parseFloat(getComputedStyle(trilho).borderTopWidth);
    const lado = parseFloat(e.width);
    const ligado = it.getAttribute('aria-checked') === 'true';
    const x = parseFloat(e.left) + (ligado ? new DOMMatrix(e.transform).m41 : 0);
    const y = parseFloat(e.top);
    // O valor de texto de cima (a dd anterior do painel) ou da coluna ao lado (Pessoas).
    const vizinho = c.tagName === 'DD' ? c.parentElement.previousElementSibling.querySelector('dd') : c.previousElementSibling;
    const m = document.getElementById(it.getAttribute('aria-describedby') ?? '');
    return {
      onde: c.tagName, ligado, apagado: it.getAttribute('aria-disabled') === 'true',
      dif: borda(c) - t.right,
      difVizinho: c.tagName === 'DD' ? borda(vizinho) - fimDoTexto(vizinho) : null,
      passa: it.getBoundingClientRect().right - borda(c),
      folgas: [y, t.width - 2 * b - x - lado, t.height - 2 * b - y - lado, x],
      opacidade: getComputedStyle(it).opacity,
      motivo: m ? { display: getComputedStyle(m).display, dif: borda(c) - fimDoTexto(m), abaixo: m.getBoundingClientRect().top - it.getBoundingClientRect().bottom } : null,
    };
  });
};

for (const [nome, opcoes, toque] of [
  ['computador, 1280', { viewport: { width: 1280, height: 900 } }, false],
  ['toque, 375', { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true }, true],
]) {
  test(`interruptor medido (${nome}): o trilho termina a 0px da borda direita, como os outros valores, ligado e desligado; a bolinha centrada; o motivo sob o controle`, { skip: chromium ? false : motivo }, async () => {
    const [antes, depois] = await abrir(opcoes, async (pagina) => {
      const a = await pagina.evaluate(medir);
      if (!toque) {
        // No computador o motivo aparece pelo app: clique num, Espaço no outro.
        const apagados = pagina.locator('.ov-interruptor[aria-disabled="true"]');
        for (let i = 0; i < await apagados.count(); i++) {
          if (i % 2) await apagados.nth(i).click({ force: true });
          else { await apagados.nth(i).focus(); await pagina.keyboard.press('Space'); }
        }
      }
      return [a, await pagina.evaluate(medir)];
    });
    assert.equal(depois.length, 24);
    assert.ok(depois.some((m) => m.ligado) && depois.some((m) => !m.ligado));
    for (const m of depois) {
      const rot = `${m.onde} ${m.ligado ? 'ligado' : 'desligado'}`;
      assert.equal(+m.dif.toFixed(2), 0, `${rot}: o trilho na borda`);
      if (m.difVizinho !== null) assert.equal(+m.difVizinho.toFixed(2), 0, `${rot}: o valor de cima na mesma borda`);
      assert.equal(+m.passa.toFixed(2), 4, `${rot}: o botão (hover, anel) passa 4px`);
      const f = m.folgas.map((x) => +x.toFixed(2));
      assert.deepEqual([f[0], f[2], f[m.ligado ? 1 : 3]], [2, 2, 2], `${rot}: bolinha ${f}`);
      if (m.apagado) {
        assert.equal(m.opacidade, '1', 'o botão inteiro, o anel inteiro');
        assert.equal(m.motivo.display, 'block');
        assert.ok(Math.abs(m.motivo.dif) < 0.5, `${rot}: o motivo termina na borda (${m.motivo.dif})`);
        assert.ok(m.motivo.abaixo >= 0, 'o motivo na linha de baixo');
      }
    }
    // No computador, escondido até o app mostrar; no toque, sempre.
    for (const m of antes.filter((x) => x.apagado)) assert.equal(m.motivo.display, toque ? 'block' : 'none');
  });
}

// v3.18.2 (decidido pelo Salim em 28/10, AJ1): guarda do sublinhado na
// tabela. O pacote não sublinhava nada na .ov-tabela; o sublinhado vinha do
// hover:underline dos apps. Uma regra só: o data-abre-linha (o botão ou link
// da célula que faz o mesmo que clicar na linha) não sublinha, nem no hover.
// O link de célula que leva a outro lugar não leva o atributo e continua
// sublinhando. O td no seletor dá a especificidade (0,2,1) que vence o
// hover:underline (0,2,0) do Tailwind 3 do Paradas, fora de camada e depois
// do pacote; no Tailwind 4 da Bordo a utilidade está em @layer utilities e
// perde para o pacote, que entra fora de camada. Patch: a fixture da v3.18.1
// (`test/fixtures/telas-v3.18.1.css`, da tag, fixa) fica igual regra a
// regra; só nasce a regra daqui.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { regras, semComentario } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const telas = ler('css/telas.css');
const antes = ler('test/fixtures/telas-v3.18.1.css');
const exemplo = ler('exemplo/index.html');
const leiame = ler('README.md');
const pacote = JSON.parse(ler('package.json'));

const ACAO = '.ov-tabela td [data-abre-linha]';

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- patch: tudo da v3.18.1 igual, só nasce a regra da ação ----------

test('patch: toda regra do telas.css da v3.18.1 igual; nasce só a da ação da linha', () => {
  for (const r of regras(antes)) {
    for (const s of r.seletores) assert.deepEqual(declaracoesEm(telas, r.media, s), declaracoesEm(antes, r.media, s), `${r.media}|${s}`);
  }
  const velhas = new Set(chaves(antes));
  const agora = new Set(chaves(telas));
  assert.deepEqual(chaves(telas).filter((c) => !velhas.has(c)), [`|${ACAO}`]);
  assert.deepEqual(chaves(antes).filter((c) => !agora.has(c)), []);
});

test('os outros CSS com os bytes da v3.18.1; a fixture da tag', () => {
  const SHA = {
    janelas: '52a2ea6c682b07d060dd98b389ffae31961b55c79dcfb48cebb3b74e1c582361',
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
  assert.equal(sha256('test/fixtures/telas-v3.18.1.css'), '8eb57da191c50eb42d401a814611d3df660c8b463c3309bab4ab882dbee4939c');
});

// ---------- A regra ----------

test('a ação da linha: só text-decoration: none, sem !important, fora de @media, no bloco da tabela', () => {
  assert.deepEqual(declaracoesEm(telas, '', ACAO), ['text-decoration: none']);
  assert.doesNotMatch(semComentario(telas), /!important/);
  // Logo depois da última regra da tabela, antes da barra de ações em massa.
  const o = regras(telas).filter((r) => r.media === '').map((r) => r.seletores.join(', '));
  assert.equal(o.indexOf(ACAO), o.indexOf('.ov-tabela .ov-so-no-celular') + 1);
  // O :hover de nenhuma outra regra muda (o patch acima), e nenhum outro CSS
  // fala do atributo.
  for (const nome of ['casca', 'janelas', 'controles', 'onevessel', 'relatorio', 'previa', 'impressao']) {
    assert.doesNotMatch(ler(`css/${nome}.css`), /data-abre-linha/, nome);
  }
  assert.equal((telas.match(/\[data-abre-linha\]/g) ?? []).length, 1);
});

// ---------- Exemplo, README, versão ----------

test('exemplo: seção da ação da linha depois da coluna estreita, nos dois temas, com o botão marcado e o link de fora', () => {
  const i = exemplo.indexOf('<section class="acao-linha">');
  assert.ok(i > exemplo.indexOf('<section class="visoes-coluna">'), 'depois da coluna estreita');
  const secao = exemplo.slice(i, exemplo.indexOf('\n</section>', i));
  const molduras = secao.split('<div class="controles-moldura" ').slice(1);
  assert.deepEqual(molduras.map((m) => m.slice(0, m.indexOf('>'))), ['data-theme="escuro"', 'data-theme="claro"']);
  for (const m of molduras) {
    assert.equal((m.match(/<td class="nome"><button type="button" data-abre-linha class="hover:underline">/g) ?? []).length, 3);
    assert.equal((m.match(/<a href="#" class="hover:underline">/g) ?? []).length, 3);
    assert.doesNotMatch(m, /<a [^>]*data-abre-linha/);
  }
  // O hover:underline simulado como o Tailwind 3 compila, sem prefixo.
  assert.match(exemplo, /\n {2}\.hover\\:underline:hover \{ text-decoration-line: underline; \}/);
});

test('package.json 3.18.2; README com a tag, a ação da linha e por que é patch', () => {
  assert.equal(pacote.version, '3.18.2');
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.18\.2"/);
  assert.match(leiame, /\*\*Ação da linha sem sublinhado\*\* \(v3\.18\.2\)/);
  assert.match(leiame, /\*\*Por que a v3\.18\.2 é patch:\*\*/);
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

const comNavegador = async (fn) => {
  const navegador = await chromium.launch();
  try {
    return await fn(await navegador.newPage({ viewport: { width: 1440, height: 900 } }));
  } finally {
    await navegador.close();
  }
};
const sublinhado = (alvo) => alvo.evaluate((e) => getComputedStyle(e).textDecorationLine);
const passar = async (p, alvo) => {
  await alvo.scrollIntoViewIfNeeded();
  await alvo.hover();
  await p.waitForTimeout(50);
  return sublinhado(alvo);
};

test('medida no exemplo: o botão da linha não sublinha no hover; o link de fora sublinha', { skip: chromium ? false : motivo }, async () => {
  const r = await comNavegador(async (p) => {
    await p.goto(url('exemplo/index.html').href);
    const saida = [];
    for (const moldura of await p.locator('.acao-linha .controles-moldura').all()) {
      const botao = moldura.locator('[data-abre-linha]').first();
      const link = moldura.locator('tbody a').first();
      saida.push({ botao: await passar(p, botao), link: await passar(p, link) });
    }
    return saida;
  });
  assert.deepEqual(r, [{ botao: 'none', link: 'underline' }, { botao: 'none', link: 'underline' }]);
});

// Os dois consumidores, com o hover:underline como cada Tailwind o compila
// (o 3.4 do Paradas e o 4 da Bordo, conferidos em 28/10) e o pacote na
// posição em que cada app o importa.
const TW3 = '.hover\\:underline:hover { text-decoration-line: underline }';
const TW4 = '@layer utilities { @media (hover: hover) { .hover\\:underline:hover { text-decoration-line: underline; } } }';
const CONSUMIDORES = {
  // index.css: o pacote antes do @tailwind utilities, tudo fora de camada.
  paradas: [telas, TW3],
  // globals.css: @import "tailwindcss" (camadas) e o pacote fora de camada.
  bordo: ['@layer theme, base, components, utilities;', telas, TW4],
};
const LINHA = '<table class="ov-tabela"><tbody><tr><td class="nome"><button type="button" data-abre-linha class="hover:underline">Linha</button></td><td><a href="#" class="hover:underline">Outro lugar</a></td></tr></tbody></table>';

for (const [app, folhas] of Object.entries(CONSUMIDORES)) {
  test(`medida na ordem do ${app}: a regra do pacote vence o hover:underline; o link de fora sublinha`, { skip: chromium ? false : motivo }, async () => {
    const r = await comNavegador(async (p) => {
      await p.setContent(`<!doctype html>${folhas.map((f) => `<style>${f}</style>`).join('')}${LINHA}`);
      return { botao: await passar(p, p.locator('[data-abre-linha]')), link: await passar(p, p.locator('a')) };
    });
    assert.deepEqual(r, { botao: 'none', link: 'underline' });
  });
}

// O seletor sem o td (0,2,0) perdia no Paradas: a guarda do porquê do td.
test('medida: sem o td, a regra perderia na ordem do Paradas', { skip: chromium ? false : motivo }, async () => {
  const r = await comNavegador(async (p) => {
    await p.setContent(`<!doctype html><style>.ov-tabela [data-abre-linha] { text-decoration: none; }</style><style>${TW3}</style>${LINHA}`);
    return passar(p, p.locator('[data-abre-linha]'));
  });
  assert.equal(r, 'underline');
});

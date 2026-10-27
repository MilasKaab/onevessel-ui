// v3.16.0 (decidido pelo Salim em 27/10): telas de lista ou grade usam a
// largura disponível; formulário, leitura e painel ficam em 1280px. Um
// token novo, --ov-conteudo-largo (1864px = 1920 − 56: num 1920 a tela larga
// ganha todo o espaço da lateral recolhida), a regra
// .ov-tela[data-largura="larga"] na casca e, nas telas, a partir de 1024px,
// o .nome da tabela sem o teto de 320px dentro dela. Minor: as fixtures da v3.15.1
// (`test/fixtures/{casca,telas,tokens}-v3.15.1.css`, da tag, fixas) ficam
// iguais regra a regra; só nasce o que está aqui.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { regras } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const exemplo = ler('exemplo/index.html');
const leiame = ler('README.md');
const pacote = JSON.parse(ler('package.json'));
const tokensJson = JSON.parse(ler('tokens/tokens.json'));

const LARGA = '.ov-tela[data-largura="larga"]';
const NOME = `${LARGA} .ov-tabela .nome`;

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));
const ordem = (texto) => regras(texto).map((r) => `${r.media}|${r.seletores.join(', ')}`);

// ---------- minor: tudo da v3.15.1 igual; só nasce o novo ----------

const COMPUTADOR = '@media (min-width: 1024px)';
const NOVAS = { casca: [`|${LARGA}`], telas: [`${COMPUTADOR}|${NOME}`] };

for (const nome of ['casca', 'telas']) {
  test(`minor: toda regra do ${nome}.css da v3.15.1 igual, e só nasce ${NOVAS[nome][0]}`, () => {
    const antes = ler(`test/fixtures/${nome}-v3.15.1.css`);
    const agora = ler(`css/${nome}.css`);
    for (const r of regras(antes)) {
      for (const s of r.seletores) assert.deepEqual(declaracoesEm(agora, r.media, s), declaracoesEm(antes, r.media, s), `${r.media}|${s}`);
    }
    const velhas = new Set(chaves(antes));
    assert.deepEqual(chaves(agora).filter((c) => !velhas.has(c)), NOVAS[nome]);
    // A ordem das velhas não muda (a força é a mesma, a ordem decide).
    const nova = NOVAS[nome][0];
    assert.deepEqual(ordem(agora).filter((c) => c !== nova), ordem(antes));
  });
}

test('minor: tokens.css da v3.15.1 mais uma linha, --ov-conteudo-largo; o conteudo-max continua 1280', () => {
  const antes = ler('test/fixtures/tokens-v3.15.1.css').split('\n');
  const agora = ler('css/tokens.css').split('\n');
  assert.deepEqual(agora.filter((l) => !antes.includes(l)), ['  --ov-conteudo-largo: 1864px;']);
  assert.deepEqual(antes.filter((l) => !agora.includes(l)), []);
  assert.equal(agora.indexOf('  --ov-conteudo-largo: 1864px;'), agora.indexOf('  --ov-conteudo-max: 1280px;') + 1);
  const larguras = tokensJson.larguras?.tokens ?? Object.values(tokensJson).flatMap((g) => g?.tokens ?? []);
  assert.equal(larguras.find((t) => t.name === 'ov-conteudo-max').value, '1280px');
  assert.equal(larguras.find((t) => t.name === 'ov-conteudo-largo').value, '1864px');
});

test('os outros CSS com os bytes da v3.15.1', () => {
  const SHA = {
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    janelas: '015a5e82157558910b90cf1237f0404fbca2de89a036def4a87370b7e156d763',
    controles: 'e18ae6db69fc02205e45929f09afbd1b61e33212bf0aaf64d030c5c9edbfe9de',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
  };
  for (const [nome, sha] of Object.entries(SHA)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
});

// ---------- O novo ----------

test('a tela larga: só o teto, no token novo, fora de @media', () => {
  assert.deepEqual(declaracoesEm(ler('css/casca.css'), '', LARGA), ['max-width: var(--ov-conteudo-largo)']);
  // Vem depois da .ov-tela, que segue no teto de leitura.
  const o = ordem(ler('css/casca.css'));
  assert.ok(o.indexOf(`|${LARGA}`) > o.indexOf('|.ov-tela'));
  assert.match(declaracoesEm(ler('css/casca.css'), '', '.ov-tela').join('; '), /max-width: var\(--ov-conteudo-max\)/);
  // Nenhuma outra regra fala do atributo.
  for (const nome of ['casca', 'janelas', 'telas', 'controles', 'onevessel']) {
    for (const r of regras(ler(`css/${nome}.css`))) {
      for (const s of r.seletores) if (/data-largura/.test(s)) assert.ok([`|${LARGA}`, `${COMPUTADOR}|${NOME}`].includes(`${r.media}|${s}`), `${nome}: ${r.media}|${s}`);
    }
  }
});

test('a tabela na tela larga: o nome sem teto só a partir de 1024px, sem table-layout fixo; nowrap das células como estava', () => {
  const telas = ler('css/telas.css');
  assert.deepEqual(declaracoesEm(telas, COMPUTADOR, NOME), ['max-width: none']);
  assert.equal(declaracoesEm(telas, '', NOME), null);
  assert.ok(declaracoesEm(telas, '', '.ov-tabela .nome').includes('max-width: 320px'));
  assert.ok(declaracoesEm(telas, '', '.ov-tabela td').includes('white-space: nowrap'));
  assert.doesNotMatch(telas, /table-layout/);
  // Logo depois da regra do .nome.
  const o = ordem(telas);
  assert.equal(o.indexOf(`${COMPUTADOR}|${NOME}`), o.indexOf('|.ov-tabela .nome') + 1);
});

test('exemplo: telas larga (escuro e claro) com .ov-tabela e uma de 1280 sem o atributo, fora da .pagina', () => {
  const i = exemplo.indexOf('<section class="largura">');
  assert.ok(i > exemplo.indexOf('</main>\n\n'), 'depois da .pagina');
  const secao = exemplo.slice(i, exemplo.indexOf('</section>', i));
  const molduras = secao.split('<div class="moldura" ').slice(1);
  assert.deepEqual(molduras.map((m) => m.slice(0, m.indexOf('>'))), ['data-theme="escuro"', 'data-theme="claro"', 'data-theme="claro"']);
  for (const m of molduras.slice(0, 2)) {
    assert.match(m, /<main class="ov-tela" data-largura="larga">/);
    assert.match(m, /<table class="ov-tabela"/);
    assert.match(m, /<td class="nome">/);
  }
  assert.match(molduras[2], /<main class="ov-tela">/);
  assert.doesNotMatch(molduras[2], /data-largura/);
});

test('package.json 3.16.0; README com a tag, a regra na Casca e a linha na Tabela', () => {
  assert.equal(pacote.version, '3.16.0');
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.16\.0"/);
  assert.ok(leiame.includes('Cada tela declara a largura: `data-largura="larga"` nas telas de lista ou grade (tabelas, conveses, históricos); sem o atributo, o teto de leitura de 1280px (formulários, painéis, texto, cartões de resumo). Recolher a lateral dá à tela larga o espaço da lateral; a de 1280 só cresce se a janela for estreita.'));
  assert.match(leiame, /\*\*Tabela numa tela larga\*\* \(v3\.16\.0\)/);
  assert.match(leiame, /\*\*Por que a v3\.16\.0 é minor:\*\*/);
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

// Largura de cada .ov-tela da seção, e do maior .nome da tabela.
const medir = async (largura, recolhida) => {
  const navegador = await chromium.launch();
  try {
    const pagina = await navegador.newPage({ viewport: { width: largura, height: 900 } });
    await pagina.goto(url('exemplo/index.html').href);
    await pagina.evaluate((r) => { for (const c of document.querySelectorAll('.ov-casca')) c.dataset.lateral = r ? 'recolhida' : 'aberta'; }, recolhida);
    return await pagina.evaluate(() => [...document.querySelectorAll('.largura .ov-tela')].map((t) => ({
      larga: t.dataset.largura === 'larga',
      tela: t.getBoundingClientRect().width,
      disponivel: t.parentElement.getBoundingClientRect().width,
      nome: Math.max(0, ...[...t.querySelectorAll('td.nome')].map((n) => n.getBoundingClientRect().width)),
      nomeCabe: [...t.querySelectorAll('td.nome')].every((n) => n.scrollWidth <= n.clientWidth),
    })));
  } finally {
    await navegador.close();
  }
};

test('medida: a 1920, a larga ocupa o disponível e a outra fica em 1280; recolher dá o espaço só à larga', { skip: chromium ? false : motivo }, async () => {
  const aberta = await medir(1920, false);
  const recolhida = await medir(1920, true);
  assert.equal(aberta.length, 3);
  for (const [i, t] of aberta.entries()) {
    if (t.larga) {
      assert.ok(t.disponivel > 1280 && t.disponivel < 1864, `disponível ${t.disponivel}`);
      assert.equal(t.tela, t.disponivel);
      // Recolhida, ganha todo o espaço da lateral (o teto só age acima de 1920).
      assert.equal(recolhida[i].disponivel - t.disponivel, 240 - 56);
      assert.equal(recolhida[i].tela, recolhida[i].disponivel);
      assert.equal(recolhida[i].tela - t.tela, 240 - 56);
      // O nome longo cabe inteiro (sem elipse) e passa dos 320px.
      assert.ok(t.nomeCabe);
      assert.ok(t.nome > 320, `nome com ${t.nome}px`);
    } else {
      assert.equal(t.tela, 1280);
      assert.equal(recolhida[i].tela, 1280);
    }
  }
});

test('medida: a 2560, a larga para no teto de 1864', { skip: chromium ? false : motivo }, async () => {
  for (const t of await medir(2560, true)) assert.equal(t.tela, t.larga ? 1864 : 1280);
});

test('medida: abaixo de 1024px (900), as três do mesmo tamanho', { skip: chromium ? false : motivo }, async () => {
  const ts = await medir(900, false);
  for (const t of ts) assert.equal(t.tela, ts[0].tela);
  assert.ok(ts[0].tela < 1280);
});

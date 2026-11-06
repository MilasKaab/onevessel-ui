// v3.24.2 (achado do Salim na barra de Pessoas da Bordo, decidido em 05/11):
// a borda do .ov-btn-secundario passa da ov-borda-forte, decorativa, à
// ov-borda-controle, a dos campos, também no ::before do Salvando. Patch: a
// fixture da v3.24.1 (`test/fixtures/controles-v3.24.1.css`, da tag, fixa)
// fica igual regra a regra, fora as duas alteradas pelo nome. Desde a
// v3.24.3, as janelas são conferidas pelo hash da fixture da v3.24.2, e a
// versão e a tag ficam com o teste da versão mais nova.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { problemasDeBase, regras, seletores, semComentario } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));
const leiame = ler('README.md');

const controles = ler('css/controles.css');
const antes = ler('test/fixtures/controles-v3.24.1.css');

const SECUNDARIO = '.ov-btn-secundario';
const SALVANDO = '.ov-btn-secundario[aria-busy="true"]:not(:disabled)::before';

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- patch: tudo da v3.24.1 igual, fora as alteradas pelo nome ----------

const ALTERADAS = {
  [`|${SECUNDARIO}`]: ['background: var(--ov-superficie-elevada)', 'border-color: var(--ov-borda-controle)', 'color: var(--ov-texto)'],
  [`|${SALVANDO}`]: ['background: var(--ov-superficie-elevada)', 'border-color: var(--ov-borda-controle)'],
};

test('patch: toda regra do controles.css da v3.24.1 igual, fora as duas do secundário', () => {
  for (const r of regras(antes)) {
    for (const s of r.seletores) {
      const chave = `${r.media}|${s}`;
      if (s.startsWith('@')) { assert.ok(seletores(controles).has(s), `sumiu: ${s}`); continue; }
      if (chave in ALTERADAS) continue;
      assert.deepEqual(declaracoesEm(controles, r.media, s), declaracoesEm(antes, r.media, s), chave);
    }
  }
  // Nada nasce nem some, e a ordem é a mesma.
  assert.deepEqual(chaves(controles), chaves(antes));
});

test('as alteradas pelo nome: só a borda vai de ov-borda-forte a ov-borda-controle', () => {
  for (const [chave, esperado] of Object.entries(ALTERADAS)) {
    const s = chave.slice(1);
    const agora = declaracoesEm(controles, '', s);
    const era = declaracoesEm(antes, '', s);
    assert.deepEqual(agora, esperado, s);
    assert.deepEqual(era.filter((d, i) => d !== agora[i]), ['border-color: var(--ov-borda-forte)'], s);
    assert.deepEqual(agora.filter((d, i) => d !== era[i]), ['border-color: var(--ov-borda-controle)'], s);
  }
});

test('nenhuma regra do pacote desenha o secundário com a ov-borda-forte', () => {
  for (const nome of readdirSync(url('css')).filter((n) => n.endsWith('.css'))) {
    for (const r of regras(ler(`css/${nome}`))) {
      if (!r.seletores.some((s) => s.includes('ov-btn-secundario'))) continue;
      assert.doesNotMatch(r.corpo, /--ov-borda-forte/, `${nome}: ${r.seletores.join(', ')}`);
    }
  }
});

test('controles.css continua importável sozinho, sem outline: none nem !important novo', () => {
  assert.deepEqual(problemasDeBase('controles.css', controles), []);
  assert.doesNotMatch(controles, /outline:\s*(none|0)\b/);
  const importantes = (t) => (semComentario(t).match(/!important/g) ?? []).length;
  assert.equal(importantes(controles), importantes(antes));
});

test('os outros CSS, o tokens.json e os js com os bytes da v3.24.1; a fixture da tag', () => {
  const CSS = {
    casca: 'dec8032af2c2ca28e82bdfe576d867610c546bb768a9fdc0a1728e24ae0be338',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    telas: '1c98875ecc5f9cab5a28332d87b9089153465b9c74884f8f505fdae09c0c83c4',
    tokens: 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92',
  };
  assert.deepEqual(readdirSync(url('css')).filter((n) => n.endsWith('.css')).sort(), [...Object.keys(CSS), 'controles', 'janelas'].map((n) => `${n}.css`).sort(), 'nenhum CSS nasce nem some');
  for (const [nome, sha] of Object.entries(CSS)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
  assert.equal(sha256('tokens/tokens.json'), '00e88f37d561d821f96fa505b1cd794326d70bb5df6453a531e24cf667463b1d');
  assert.equal(sha256('test/fixtures/controles-v3.24.1.css'), '0ae47b7685f1f6be95e2836f917e0b35692fded9908a21b9016880b8d855b12b');
  assert.equal(sha256('test/fixtures/janelas-v3.24.2.css'), 'b58dbd1036562b661422456fb185117d0286470ea02ec74494bb636e4d16fdae');
});

// ---------- Versão e README ----------

test('package.json sem export novo; README com a seção, as alteradas pelo nome e o que muda na tela', () => {
  assert.equal(Object.keys(pacote.exports).length, 29);
  assert.match(leiame, /### Botão secundário com a borda dos campos \(v3\.24\.2\)/);
  assert.match(leiame, /\*\*Alteradas pelo nome\*\*[^\n]*`border-color: var\(--ov-borda-forte\)` → `border-color: var\(--ov-borda-controle\)`/);
  assert.match(leiame, /\*\*Por que a v3\.24\.2 é patch:\*\*/);
  assert.match(leiame, /\*\*O que muda na tela dos apps ao adotar:\*\* todo botão secundário da suíte ganha o contorno dos campos/);
});

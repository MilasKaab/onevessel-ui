// v3.24.3 (D6, decidido pelo Salim em 06/11): a folha cheia ganha 4px acima
// do cabeçalho, somados à área segura, para o anel do foco (2px + 2px de
// recuo) de um botão de 48px não sair da tela; o painel cheio (abaixo de
// 1024px) ganha 5px, porque o .ov-painel-cab tem 48px com a borda de baixo e
// o botão passa meio pixel acima dele. Patch: a fixture da v3.24.2
// (`test/fixtures/janelas-v3.24.2.css`, da tag, fixa) fica igual regra a
// regra, fora as duas alteradas pelo nome.
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

const janelas = ler('css/janelas.css');
const antes = ler('test/fixtures/janelas-v3.24.2.css');

const MOVEL = '@media (max-width: 1023px)';
const FOLHA = '.ov-folha[data-altura="cheia"]';
const PAINEL = '.ov-painel[data-altura="cheia"]';
const ERA = 'padding-top: env(safe-area-inset-top, 0px)';
const FOLHA_AGORA = 'padding-top: calc(env(safe-area-inset-top, 0px) + 4px)';
const PAINEL_AGORA = 'padding-top: calc(env(safe-area-inset-top, 0px) + 5px)';

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- patch: tudo da v3.24.2 igual, fora as alteradas pelo nome ----------

const ALTERADAS = {
  [`|${FOLHA}`]: ['height: 100vh', 'height: 100dvh', 'max-height: none', FOLHA_AGORA, 'border-radius: 0'],
  [`${MOVEL}|${PAINEL}`]: ['height: 100vh', 'height: 100dvh', PAINEL_AGORA, 'border-radius: 0'],
};

test('patch: toda regra do janelas.css da v3.24.2 igual, fora as duas cheias', () => {
  for (const r of regras(antes)) {
    for (const s of r.seletores) {
      const chave = `${r.media}|${s}`;
      if (s.startsWith('@')) { assert.ok(seletores(janelas).has(s), `sumiu: ${s}`); continue; }
      if (chave in ALTERADAS) continue;
      assert.deepEqual(declaracoesEm(janelas, r.media, s), declaracoesEm(antes, r.media, s), chave);
    }
  }
  // Nada nasce nem some, e a ordem é a mesma.
  assert.deepEqual(chaves(janelas), chaves(antes));
});

test('as alteradas pelo nome: só o padding-top muda (4px na folha, 5px no painel)', () => {
  for (const [chave, esperado] of Object.entries(ALTERADAS)) {
    const [media, s] = [chave.slice(0, chave.indexOf('|')), chave.slice(chave.indexOf('|') + 1)];
    const agora = declaracoesEm(janelas, media, s);
    const era = declaracoesEm(antes, media, s);
    assert.deepEqual(agora, esperado, chave);
    assert.deepEqual(era.filter((d, i) => d !== agora[i]), [ERA], chave);
    assert.deepEqual(agora.filter((d, i) => d !== era[i]), [s === FOLHA ? FOLHA_AGORA : PAINEL_AGORA], chave);
  }
});

test('a folha de 90% e o painel do computador não mudam', () => {
  for (const [media, s] of [['', '.ov-folha[data-altura="detalhe"]'], ['', '.ov-folha'], ['', '.ov-painel'], [MOVEL, '.ov-painel']]) {
    assert.deepEqual(declaracoesEm(janelas, media, s), declaracoesEm(antes, media, s), `${media}|${s}`);
  }
});

test('janelas.css continua importável sozinho, sem outline: none nem !important novo', () => {
  assert.deepEqual(problemasDeBase('janelas.css', janelas), []);
  assert.doesNotMatch(janelas, /outline:\s*(none|0)\b/);
  const importantes = (t) => (semComentario(t).match(/!important/g) ?? []).length;
  assert.equal(importantes(janelas), importantes(antes));
});

test('os outros CSS e o tokens.json com os bytes da v3.24.2; a fixture da tag', () => {
  const CSS = {
    casca: 'dec8032af2c2ca28e82bdfe576d867610c546bb768a9fdc0a1728e24ae0be338',
    controles: 'af238d42d9e6a8393bd92ab8a3e24f7146932e3dd101c800b4303edb552ae4c5',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    telas: '1c98875ecc5f9cab5a28332d87b9089153465b9c74884f8f505fdae09c0c83c4',
    tokens: 'd15afe46e2ed18570720fe09b63af5eca75a9d266103619833d2547f44c7cd92',
  };
  assert.deepEqual(readdirSync(url('css')).filter((n) => n.endsWith('.css')).sort(), [...Object.keys(CSS), 'janelas'].map((n) => `${n}.css`).sort(), 'nenhum CSS nasce nem some');
  for (const [nome, sha] of Object.entries(CSS)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
  assert.equal(sha256('tokens/tokens.json'), '00e88f37d561d821f96fa505b1cd794326d70bb5df6453a531e24cf667463b1d');
  assert.equal(sha256('test/fixtures/janelas-v3.24.2.css'), 'b58dbd1036562b661422456fb185117d0286470ea02ec74494bb636e4d16fdae');
});

// ---------- Versão e README ----------

test('package.json 3.24.3, sem export novo; README com a tag, a seção, as alteradas pelo nome e o que muda na tela', () => {
  assert.equal(pacote.version, '3.24.3');
  assert.equal(Object.keys(pacote.exports).length, 29);
  assert.match(leiame, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.24\.3"/);
  assert.match(leiame, /### Folga de 4px em cima da folha cheia \(v3\.24\.3\)/);
  assert.match(leiame, /\*\*Alteradas pelo nome\*\*[^\n]*`padding-top: env\(safe-area-inset-top, 0px\)` → `padding-top: calc\(env\(safe-area-inset-top, 0px\) \+ 4px\)`[^\n]*`padding-top: calc\(env\(safe-area-inset-top, 0px\) \+ 5px\)`/);
  assert.match(leiame, /\*\*Por que a v3\.24\.3 é patch:\*\*/);
  assert.match(leiame, /\*\*O que muda na tela dos apps ao adotar:\*\*/);
});

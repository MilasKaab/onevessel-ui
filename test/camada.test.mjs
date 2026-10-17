// A pilha de camadas modais (js/camada.js): estaNoTopo, a trava de rolagem do
// <html> só na primeira camada e o retorno na última, e o caso sem `document`
// (o Paradas protege com `typeof document`). Sem DOM: o `document` é um
// objeto com o `style` do <html>. O caso da folha com o Diálogo por cima é o
// de `test/paineis.test.mjs` da Bordo ("a pilha").
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { abrirCamada, camadasAbertas } from '../js/camada.js';

const comDocument = (overflow) => {
  const estilo = { overflow };
  globalThis.document = { documentElement: { style: estilo } };
  return estilo;
};

test('pilha: a folha espera o Diálogo por cima e volta ao topo quando ele fecha', () => {
  comDocument('');
  const folha = abrirCamada();
  assert.equal(folha.estaNoTopo(), true);
  // O "Descartar alterações?" sobre a folha (C9): a folha espera.
  const dialogo = abrirCamada();
  assert.equal(camadasAbertas(), 2);
  assert.equal(folha.estaNoTopo(), false);
  assert.equal(dialogo.estaNoTopo(), true);
  dialogo();
  assert.equal(dialogo.estaNoTopo(), false, 'fechada não está no topo');
  assert.equal(folha.estaNoTopo(), true);
  folha.fechar();
  assert.equal(camadasAbertas(), 0);
  assert.equal(folha.estaNoTopo(), false);
  delete globalThis.document;
});

test('fechar duas vezes não desconta outra camada', () => {
  comDocument('');
  const a = abrirCamada();
  const b = abrirCamada();
  a();
  a();
  a.fechar();
  assert.equal(camadasAbertas(), 1);
  assert.equal(b.estaNoTopo(), true);
  b();
  assert.equal(camadasAbertas(), 0);
  delete globalThis.document;
});

test('fechar fora de ordem: a de baixo sai, a de cima continua no topo', () => {
  comDocument('');
  const baixo = abrirCamada();
  const cima = abrirCamada();
  baixo();
  assert.equal(cima.estaNoTopo(), true);
  assert.equal(camadasAbertas(), 1);
  cima();
  delete globalThis.document;
});

test('rolagem: a primeira camada trava o <html>, só a última devolve o overflow de antes', () => {
  const estilo = comDocument('auto');
  const folha = abrirCamada();
  assert.equal(estilo.overflow, 'hidden');
  // A segunda não guarda o `hidden` como "de antes".
  const dialogo = abrirCamada();
  assert.equal(estilo.overflow, 'hidden');
  dialogo();
  assert.equal(estilo.overflow, 'hidden', 'com a folha aberta a página continua travada');
  folha();
  assert.equal(estilo.overflow, 'auto');
  delete globalThis.document;
});

test('sem document (servidor, teste): a pilha conta e nada quebra', () => {
  assert.equal(typeof document, 'undefined');
  const a = abrirCamada();
  const b = abrirCamada();
  assert.equal(camadasAbertas(), 2);
  assert.equal(b.estaNoTopo(), true);
  b();
  a();
  assert.equal(camadasAbertas(), 0);
});

test('a camada não importa nada nem conhece React', async () => {
  const { readFileSync } = await import('node:fs');
  const fonte = readFileSync(new URL('../js/camada.js', import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(fonte, /^\s*import\s/m);
  assert.doesNotMatch(fonte, /\b(React|useEffect|useRef|useCallback)\b/);
});

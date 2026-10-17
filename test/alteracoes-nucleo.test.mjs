// "Há alterações nesta tela" (js/alteracoes-nucleo.js): marcar, remover, ha e
// o filho que conta no pai como uma chave só. Os casos do registro são os de
// `test/paineis.test.mjs` da Bordo. E o texto único do Descartar (C16),
// congelado.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { DESCARTAR, criarRegistroDeAlteracoes } from '../js/alteracoes-nucleo.js';
import * as nucleo from '../js/alteracoes-nucleo.js';

test('o registro: marcar, desmarcar e remover', () => {
  const tela = criarRegistroDeAlteracoes();
  const campo = {};
  assert.equal(tela.ha(), false);
  tela.marcar(campo, true);
  assert.equal(tela.ha(), true);
  tela.marcar(campo, false);
  assert.equal(tela.ha(), false);
  tela.marcar(campo, true);
  tela.remover(campo);
  assert.equal(tela.ha(), false);
});

test('marcar a mesma chave duas vezes conta uma', () => {
  const tela = criarRegistroDeAlteracoes();
  const campo = {};
  tela.marcar(campo, true);
  tela.marcar(campo, true);
  tela.marcar(campo, false);
  assert.equal(tela.ha(), false);
});

test('o painel conta na tela, e a tela não conta no painel', () => {
  const tela = criarRegistroDeAlteracoes();
  const painel = tela.filho();
  const nomeDoTemplate = {};
  const fichaDoCamarote = {};

  // Nome do template digitado na tela: a casca pergunta, o painel não.
  tela.marcar(nomeDoTemplate, true);
  assert.equal(tela.ha(), true);
  assert.equal(painel.ha(), false);

  tela.marcar(nomeDoTemplate, false);
  painel.marcar(fichaDoCamarote, true);
  assert.equal(painel.ha(), true);
  assert.equal(tela.ha(), true, 'o painel alterado deixa a tela alterada');

  // O painel desmonta (fechou): a tela fica sem alteração.
  painel.remover(fichaDoCamarote);
  assert.equal(tela.ha(), false);
});

test('o painel com duas chaves só fica limpo quando as duas limpam (ficha e leito)', () => {
  const tela = criarRegistroDeAlteracoes();
  const painel = tela.filho();
  const ficha = {};
  const leito = {};
  painel.marcar(ficha, true);
  painel.marcar(leito, true);
  painel.marcar(ficha, false);
  assert.equal(tela.ha(), true);
  painel.marcar(leito, false);
  assert.equal(tela.ha(), false);
});

test('o neto propaga até a raiz, e a tela segue alterada pelo que é dela', () => {
  const tela = criarRegistroDeAlteracoes();
  const painel = tela.filho();
  const dialogo = painel.filho();
  const campoDaTela = {};
  const campoDoDialogo = {};
  dialogo.marcar(campoDoDialogo, true);
  assert.equal(painel.ha(), true);
  assert.equal(tela.ha(), true);
  tela.marcar(campoDaTela, true);
  dialogo.remover(campoDoDialogo);
  assert.equal(painel.ha(), false);
  assert.equal(tela.ha(), true, 'o campo da tela continua');
});

test('DESCARTAR: o texto único, congelado', () => {
  assert.deepEqual({ ...DESCARTAR }, {
    titulo: 'Descartar alterações?',
    frase: 'O que você digitou não foi salvo e vai se perder.',
    continuar: 'Continuar editando',
    descartar: 'Descartar',
  });
  assert.equal(Object.isFrozen(DESCARTAR), true);
  assert.throws(() => { DESCARTAR.titulo = 'outro'; }, TypeError);
  assert.equal(DESCARTAR.titulo, 'Descartar alterações?');
});

test('só o registro e o texto: o retrato de cada app fica no app', () => {
  assert.deepEqual(Object.keys(nucleo).sort(), ['DESCARTAR', 'criarRegistroDeAlteracoes']);
});

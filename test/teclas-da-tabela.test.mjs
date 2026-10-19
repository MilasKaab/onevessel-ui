// O teclado da linha da .ov-tabela (js/teclas-da-tabela.js, v3.8.0), sem
// DOM. Os casos são os que os dois apps testavam: da Bordo,
// `test/pessoas-tabela.test.mjs` (↑↓, Enter, campo, modificadores, destino,
// Tab) e `test/embarque-tabela.test.mjs` (o X com e sem seleção); do
// Paradas, `test/historico.test.mjs`, que repete os da Pessoas e acrescenta o
// Caps Lock na linha. A prova de que a tabela de cada app usa este arquivo
// fica no teste do app.
import { test } from "node:test";
import assert from "node:assert/strict";

import { acaoDaTeclaNaLinha, linhaDeDestino, linhaDoTab } from "../js/teclas-da-tabela.js";

const tecla = (key, mods = {}) => ({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods });

test("↑↓ na linha só movem o foco; Enter abre só na linha", () => {
  assert.equal(acaoDaTeclaNaLinha(tecla("ArrowUp"), "linha"), "anterior");
  assert.equal(acaoDaTeclaNaLinha(tecla("ArrowDown"), "linha"), "proximo");
  assert.equal(acaoDaTeclaNaLinha(tecla("Enter"), "linha"), "abrir");
  // O Excluir da linha: o Enter é dele; as setas ainda andam entre linhas.
  assert.equal(acaoDaTeclaNaLinha(tecla("Enter"), "outro-controle"), null);
  assert.equal(acaoDaTeclaNaLinha(tecla("ArrowDown"), "outro-controle"), "proximo");
  assert.equal(acaoDaTeclaNaLinha(tecla("x"), "linha"), null, "sem coluna de seleção, o X não faz nada");
});

test("dentro de campo as teclas são do campo; tecla modificadora não é da linha", () => {
  for (const key of ["ArrowUp", "ArrowDown", "Enter"]) assert.equal(acaoDaTeclaNaLinha(tecla(key), "campo"), null, key);
  for (const mod of ["ctrlKey", "metaKey", "altKey", "shiftKey"]) {
    assert.equal(acaoDaTeclaNaLinha(tecla("ArrowDown", { [mod]: true }), "linha"), null, mod);
  }
});

test("X marca só onde há seleção; nunca dentro de campo nem com modificador", () => {
  assert.equal(acaoDaTeclaNaLinha(tecla("x"), "linha", true), "marcar");
  assert.equal(acaoDaTeclaNaLinha(tecla("X"), "linha", true), "marcar", "com seleção, o Caps Lock marca igual");
  assert.equal(acaoDaTeclaNaLinha(tecla("X"), "outro-controle", true), "marcar", "Caps Lock");
  assert.equal(acaoDaTeclaNaLinha(tecla("x"), "linha", false), null);
  assert.equal(acaoDaTeclaNaLinha(tecla("x"), "linha"), null, "sem o terceiro argumento, sem seleção");
  assert.equal(acaoDaTeclaNaLinha(tecla("x"), "campo", true), null);
  assert.equal(acaoDaTeclaNaLinha(tecla("x", { ctrlKey: true }), "linha", true), null);
  assert.equal(acaoDaTeclaNaLinha(tecla("ArrowDown"), "outro-controle", true), "proximo");
});

test("o destino não dá a volta, e foco fora da lista vai para a primeira", () => {
  const ids = ["a", "b", "c"];
  assert.equal(linhaDeDestino(ids, "b", "anterior"), "a");
  assert.equal(linhaDeDestino(ids, "b", "proximo"), "c");
  assert.equal(linhaDeDestino(ids, "a", "anterior"), "a");
  assert.equal(linhaDeDestino(ids, "c", "proximo"), "c");
  assert.equal(linhaDeDestino(ids, "sumiu", "proximo"), "a");
  assert.equal(linhaDeDestino([], "a", "proximo"), null);
});

test("uma parada de Tab: a marcada, senão a última com foco, senão a primeira", () => {
  const ids = ["a", "b", "c"];
  assert.equal(linhaDoTab(ids, "c", "b"), "c");
  assert.equal(linhaDoTab(ids, "fora", "b"), "b");
  assert.equal(linhaDoTab(ids, null, "fora"), "a");
  assert.equal(linhaDoTab([], null, null), null);
});

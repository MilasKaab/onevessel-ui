// O teclado da Lista de cards (js/teclas-da-lista.js, v3.20.0, C10), sem
// DOM: a ação de cada tecla em cada lugar do foco, e o card do Tab.
import { test } from "node:test";
import assert from "node:assert/strict";

import { acaoDaTeclaNaLista, cardDoTab } from "../js/teclas-da-lista.js";

const tecla = (key, mods = {}) => ({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods });

test("no card: ↑↓ sem volta, Home, End", () => {
  assert.deepEqual(acaoDaTeclaNaLista(tecla("ArrowDown"), 1, 4), { foco: 2 });
  assert.deepEqual(acaoDaTeclaNaLista(tecla("ArrowUp"), 1, 4), { foco: 0 });
  assert.equal(acaoDaTeclaNaLista(tecla("ArrowUp"), 0, 4), null, "no primeiro, ↑ não faz nada");
  assert.equal(acaoDaTeclaNaLista(tecla("ArrowDown"), 3, 4), null, "no último, ↓ não faz nada");
  assert.deepEqual(acaoDaTeclaNaLista(tecla("Home"), 2, 4), { foco: 0 });
  assert.deepEqual(acaoDaTeclaNaLista(tecla("End"), 1, 4), { foco: 3 });
  assert.equal(acaoDaTeclaNaLista(tecla("Home"), 0, 4), null, "já no primeiro");
  assert.equal(acaoDaTeclaNaLista(tecla("End"), 3, 4), null, "já no último");
});

test("no card: Enter abre ou fecha; Esc não é do card", () => {
  assert.deepEqual(acaoDaTeclaNaLista(tecla("Enter"), 2, 4), { alternar: 2 });
  assert.deepEqual(acaoDaTeclaNaLista(tecla("Enter"), 2, 4, "card"), { alternar: 2 });
  assert.equal(acaoDaTeclaNaLista(tecla("Escape"), 2, 4), null);
  for (const key of [" ", "Tab", "ArrowLeft", "x"]) assert.equal(acaoDaTeclaNaLista(tecla(key), 2, 4), null, key);
});

test("num botão do card: as setas andam entre cards, o Enter é do botão, Esc volta ao card", () => {
  assert.deepEqual(acaoDaTeclaNaLista(tecla("ArrowDown"), 1, 4, "controle"), { foco: 2 });
  assert.deepEqual(acaoDaTeclaNaLista(tecla("ArrowUp"), 1, 4, "controle"), { foco: 0 });
  assert.equal(acaoDaTeclaNaLista(tecla("ArrowUp"), 0, 4, "controle"), null);
  assert.deepEqual(acaoDaTeclaNaLista(tecla("Home"), 0, 4, "controle"), { foco: 0 }, "do botão ao próprio card");
  assert.equal(acaoDaTeclaNaLista(tecla("Enter"), 1, 4, "controle"), null);
  assert.deepEqual(acaoDaTeclaNaLista(tecla("Escape"), 1, 4, "controle"), { voltarAoCard: 1 });
});

test("num campo de texto do card: só o Esc é do núcleo", () => {
  for (const key of ["ArrowUp", "ArrowDown", "Home", "End", "Enter", " "]) {
    assert.equal(acaoDaTeclaNaLista(tecla(key), 1, 4, "campo"), null, key);
  }
  assert.deepEqual(acaoDaTeclaNaLista(tecla("Escape"), 1, 4, "campo"), { voltarAoCard: 1 });
});

test("com modificador a tecla não é da lista; índice fora da lista é null", () => {
  for (const mod of ["ctrlKey", "metaKey", "altKey", "shiftKey"]) {
    assert.equal(acaoDaTeclaNaLista(tecla("ArrowDown", { [mod]: true }), 1, 4), null, mod);
    assert.equal(acaoDaTeclaNaLista(tecla("Enter", { [mod]: true }), 1, 4), null, mod);
    assert.equal(acaoDaTeclaNaLista(tecla("Escape", { [mod]: true }), 1, 4, "campo"), null, mod);
  }
  assert.equal(acaoDaTeclaNaLista(tecla("ArrowDown"), 0, 0), null);
  assert.equal(acaoDaTeclaNaLista(tecla("ArrowDown"), -1, 4), null);
  assert.equal(acaoDaTeclaNaLista(tecla("Enter"), 4, 4), null);
});

test("uma parada de Tab: o último com foco, senão o primeiro", () => {
  assert.equal(cardDoTab(4, 2), 2);
  assert.equal(cardDoTab(4, null), 0);
  assert.equal(cardDoTab(4, 9), 0, "o card sumiu num filtro");
  assert.equal(cardDoTab(0, null), -1);
});

// O teclado do Menu (js/menu-nucleo.js, v3.20.0, bloco D), sem DOM. Os
// casos são os do aoTeclar e do Esc do casca/Menu.jsx do Paradas e do
// casca/menu.tsx da Bordo, iguais.
import { test } from "node:test";
import assert from "node:assert/strict";

import { acaoDaTeclaNoMenu } from "../js/menu-nucleo.js";

const tecla = (key, mods = {}) => ({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods });

test("↑↓ com volta, Home e End", () => {
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("ArrowDown"), 0, 3), { foco: 1 });
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("ArrowDown"), 2, 3), { foco: 0 }, "do último ao primeiro");
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("ArrowUp"), 1, 3), { foco: 0 });
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("ArrowUp"), 0, 3), { foco: 2 }, "do primeiro ao último");
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("Home"), 2, 3), { foco: 0 });
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("End"), 0, 3), { foco: 2 });
});

test("Esc fecha e devolve o foco ao gatilho; Tab fecha sem prender", () => {
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("Escape"), 1, 3), { fechar: true, devolverFoco: true });
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("Escape"), -1, 3), { fechar: true, devolverFoco: true }, "o foco ainda fora do menu");
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("Tab"), 1, 3), { fechar: true, devolverFoco: false });
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("Tab", { shiftKey: true }), 1, 3), { fechar: true, devolverFoco: false }, "Shift Tab também");
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("Escape"), 0, 0), { fechar: true, devolverFoco: true }, "menu vazio fecha igual");
});

test("Enter e Espaço são do próprio item", () => {
  assert.equal(acaoDaTeclaNoMenu(tecla("Enter"), 1, 3), null);
  assert.equal(acaoDaTeclaNoMenu(tecla(" "), 1, 3), null);
  assert.equal(acaoDaTeclaNoMenu(tecla("a"), 1, 3), null);
});

test("com modificador as setas não são do menu", () => {
  for (const mod of ["ctrlKey", "metaKey", "altKey", "shiftKey"]) {
    assert.equal(acaoDaTeclaNoMenu(tecla("ArrowDown", { [mod]: true }), 0, 3), null, mod);
    assert.equal(acaoDaTeclaNoMenu(tecla("Home", { [mod]: true }), 2, 3), null, mod);
  }
});

test("foco fora dos itens (-1): ↓ vai ao primeiro e ↑ ao último; um item só fica nele", () => {
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("ArrowDown"), -1, 3), { foco: 0 });
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("ArrowUp"), -1, 3), { foco: 2 });
  assert.deepEqual(acaoDaTeclaNoMenu(tecla("ArrowDown"), 0, 1), { foco: 0 }, "o aviso do + Filtro, sozinho");
  assert.equal(acaoDaTeclaNoMenu(tecla("ArrowDown"), -1, 0), null);
});

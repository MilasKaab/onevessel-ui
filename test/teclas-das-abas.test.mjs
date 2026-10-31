// O teclado das abas (js/teclas-das-abas.js, v3.20.0, C19), sem DOM. Os
// casos são os das quatro cópias: ←→ com volta, Home e End (as visões da
// Bordo e do Paradas, o Abas.jsx; o aoTeclarNasAbas do PainelDaTt.jsx só
// tinha as setas).
import { test } from "node:test";
import assert from "node:assert/strict";

import { abaDeDestino } from "../js/teclas-das-abas.js";

const tecla = (key, mods = {}) => ({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods });

test("←→ andam com volta", () => {
  assert.equal(abaDeDestino(0, 3, tecla("ArrowRight")), 1);
  assert.equal(abaDeDestino(2, 3, tecla("ArrowRight")), 0, "da última, → vai à primeira");
  assert.equal(abaDeDestino(1, 3, tecla("ArrowLeft")), 0);
  assert.equal(abaDeDestino(0, 3, tecla("ArrowLeft")), 2, "da primeira, ← vai à última");
});

test("Home e End", () => {
  assert.equal(abaDeDestino(1, 3, tecla("Home")), 0);
  assert.equal(abaDeDestino(1, 3, tecla("End")), 2);
});

test("o resto é null: ↑↓, Enter, Espaço, Tab, letras", () => {
  for (const key of ["ArrowUp", "ArrowDown", "Enter", " ", "Tab", "Escape", "a"]) assert.equal(abaDeDestino(1, 3, tecla(key)), null, key);
});

test("com modificador a tecla não é das abas (Alt ← é o voltar do navegador)", () => {
  for (const mod of ["ctrlKey", "metaKey", "altKey", "shiftKey"]) {
    assert.equal(abaDeDestino(1, 3, tecla("ArrowLeft", { [mod]: true })), null, mod);
    assert.equal(abaDeDestino(1, 3, tecla("End", { [mod]: true })), null, mod);
  }
});

test("sem aba ativa (-1): → vai à primeira e ← à última; sem abas, null", () => {
  assert.equal(abaDeDestino(-1, 3, tecla("ArrowRight")), 0);
  assert.equal(abaDeDestino(-1, 3, tecla("ArrowLeft")), 2);
  assert.equal(abaDeDestino(7, 3, tecla("ArrowLeft")), 2, "índice fora da lista conta como nenhum");
  assert.equal(abaDeDestino(0, 0, tecla("ArrowRight")), null);
  assert.equal(abaDeDestino(0, 1, tecla("ArrowRight")), 0, "uma aba só: fica nela");
});

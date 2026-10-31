// O plural (js/texto.js, v3.20.0, C8): nunca "(s)", zero com número e
// plural, o milhar em pt-BR.
import { test } from "node:test";
import assert from "node:assert/strict";

import { palavra, plural } from "../js/texto.js";

test("plural: 0, 1, 2 e milhar, com o número em pt-BR", () => {
  assert.equal(plural(0, "atividade", "atividades"), "0 atividades");
  assert.equal(plural(1, "pessoa", "pessoas"), "1 pessoa");
  assert.equal(plural(2, "pessoa", "pessoas"), "2 pessoas");
  assert.equal(plural(3, "pessoa", "pessoas"), "3 pessoas");
  assert.equal(plural(1234, "pessoa", "pessoas"), "1.234 pessoas");
  assert.equal(plural(1000000, "leito", "leitos"), "1.000.000 leitos");
});

test("palavra: só a palavra, singular só para 1", () => {
  assert.equal(palavra(0, "dia", "dias"), "dias");
  assert.equal(palavra(1, "dia", "dias"), "dia");
  assert.equal(palavra(2, "dia", "dias"), "dias");
  assert.equal(palavra(1234, "dia", "dias"), "dias");
});

test("nunca (s)", () => {
  for (const n of [0, 1, 2, 1234]) assert.doesNotMatch(plural(n, "pessoa", "pessoas"), /\(s\)/);
});

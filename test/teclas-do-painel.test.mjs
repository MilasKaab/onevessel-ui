// O teclado do Painel lateral (js/teclas-do-painel.js): ↑↓ e Esc (C13), sem
// DOM. Os casos são os de `test/paineis.test.mjs` da Bordo, o mais completo
// dos dois (o Paradas tem os mesmos em `test/painel.test.mjs`, menos o Esc
// num registro novo e o ehCampo de botão e link); do Paradas veio só o ←→,
// que é das abas. A prova de que o painel de cada app usa este arquivo fica
// no teste do app.
import { test } from "node:test";
import assert from "node:assert/strict";

import { acaoDaTecla, ehCampo, ondeEstaOFoco, vizinho } from "../js/teclas-do-painel.js";

const tecla = (key, mod = {}) => ({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mod });
const situacao = (s = {}) => ({ foco: "painel", camadaPorCima: false, menuAberto: false, registroNovo: false, ...s });

test("↑↓ trocam de registro com o foco no painel ou no body", () => {
  assert.equal(acaoDaTecla(tecla("ArrowUp"), situacao()), "anterior");
  assert.equal(acaoDaTecla(tecla("ArrowDown"), situacao()), "proximo");
  assert.equal(acaoDaTecla(tecla("ArrowDown"), situacao({ foco: "body" })), "proximo");
});

test("↑↓ não agem com o foco num campo nem fora do painel (a planta rola pelas setas)", () => {
  assert.equal(acaoDaTecla(tecla("ArrowDown"), situacao({ foco: "campo" })), null);
  assert.equal(acaoDaTecla(tecla("ArrowUp"), situacao({ foco: "fora" })), null);
});

test("↑↓ não agem com modificador, com camada ou menu por cima, nem num registro novo", () => {
  for (const mod of ["ctrlKey", "metaKey", "altKey", "shiftKey"]) {
    assert.equal(acaoDaTecla(tecla("ArrowDown", { [mod]: true }), situacao()), null, mod);
  }
  assert.equal(acaoDaTecla(tecla("ArrowDown"), situacao({ camadaPorCima: true })), null);
  assert.equal(acaoDaTecla(tecla("ArrowDown"), situacao({ menuAberto: true })), null);
  assert.equal(acaoDaTecla(tecla("ArrowDown"), situacao({ registroNovo: true })), null);
});

test("Esc fecha de qualquer lugar, inclusive de um campo, menos com menu ou camada modal", () => {
  for (const foco of ["painel", "body", "campo", "fora"]) {
    assert.equal(acaoDaTecla(tecla("Escape"), situacao({ foco })), "fechar", foco);
  }
  assert.equal(acaoDaTecla(tecla("Escape"), situacao({ registroNovo: true })), "fechar");
  assert.equal(acaoDaTecla(tecla("Escape"), situacao({ menuAberto: true })), null);
  assert.equal(acaoDaTecla(tecla("Escape"), situacao({ camadaPorCima: true })), null);
  assert.equal(acaoDaTecla(tecla("Enter"), situacao()), null);
  assert.equal(acaoDaTecla(tecla("ArrowLeft"), situacao()), null, "←→ são das abas");
});

test("campo é input, textarea, select ou contenteditable", () => {
  for (const tagName of ["INPUT", "textarea", "SELECT"]) assert.equal(ehCampo({ tagName }), true, tagName);
  assert.equal(ehCampo({ tagName: "DIV", isContentEditable: true }), true);
  assert.equal(ehCampo({ tagName: "BUTTON" }), false);
  assert.equal(ehCampo({ tagName: "A" }), false);
});

test("onde está o foco: body, campo, dentro do painel ou fora", () => {
  const body = { tagName: "BODY" };
  const botaoDoPainel = { tagName: "BUTTON" };
  const campoDoPainel = { tagName: "INPUT" };
  const planta = { tagName: "DIV" };
  const dentro = (elemento) => elemento === botaoDoPainel || elemento === campoDoPainel;
  assert.equal(ondeEstaOFoco(null, body, dentro), "body");
  assert.equal(ondeEstaOFoco(body, body, dentro), "body");
  assert.equal(ondeEstaOFoco(botaoDoPainel, body, dentro), "painel");
  assert.equal(ondeEstaOFoco(campoDoPainel, body, dentro), "campo");
  assert.equal(ondeEstaOFoco(planta, body, dentro), "fora");
});

test("vizinho: anterior e próximo na ordem da lista, sem dar a volta", () => {
  const lista = ["a", "b", "c"];
  assert.equal(vizinho(lista, "b", -1), "a");
  assert.equal(vizinho(lista, "b", 1), "c");
  assert.equal(vizinho(lista, "a", -1), null);
  assert.equal(vizinho(lista, "c", 1), null);
  assert.equal(vizinho(lista, "x", 1), null);
});

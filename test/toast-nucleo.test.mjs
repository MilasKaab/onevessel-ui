// O núcleo do Toast (js/toast-nucleo.js): fila de 3, prazo de 8 s com pausa
// por motivo, erro sem prazo e o filtro do Ctrl Z. Sem DOM: o relógio vem de
// fora. Os casos são os de `test/toast-nucleo.test.mjs`, iguais na Bordo e no
// Paradas (só o import mudava); veio o do Paradas, que já era .js.
import { test } from "node:test";
import assert from "node:assert/strict";

const n = await import("../js/toast-nucleo.js");

const tecla = (mais = {}) => ({
  key: "z",
  ctrlKey: true,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  isComposing: false,
  alvoEhCampo: false,
  ...mais,
});

function com(...novos) {
  let fila = n.filaVazia();
  const ids = [];
  for (const novo of novos) {
    const r = n.acrescentar(fila, novo, 0);
    fila = r.fila;
    ids.push(r.id);
  }
  return { fila, ids };
}

test("acrescentar: ids crescentes, sucesso com prazo, erro sem prazo", () => {
  const { fila, ids } = com({ tipo: "sucesso", dados: "a" }, { tipo: "erro", dados: "b" });
  assert.deepEqual(ids, [1, 2]);
  assert.equal(fila.toasts[0].restanteMs, n.DURACAO_PADRAO_MS);
  assert.equal(fila.toasts[1].restanteMs, null);
  assert.equal(n.DURACAO_PADRAO_MS, 8000);
});

test("no máximo 3: o quarto empurra o mais antigo", () => {
  const { fila } = com(
    { tipo: "sucesso", dados: 1 },
    { tipo: "erro", dados: 2 },
    { tipo: "sucesso", dados: 3 },
    { tipo: "sucesso", dados: 4 },
  );
  assert.deepEqual(fila.toasts.map((t) => t.dados), [2, 3, 4]);
});

test("vencer: sucesso sai no prazo, erro fica", () => {
  const { fila } = com({ tipo: "sucesso", dados: "s" }, { tipo: "erro", dados: "e" });
  assert.equal(n.vencer(fila, 7999).toasts.length, 2);
  assert.deepEqual(n.vencer(fila, 8000).toasts.map((t) => t.dados), ["e"]);
  assert.equal(n.vencer(fila, 10 ** 9).toasts.length, 1);
});

test("pausa e retoma: o que faltava continua, não recomeça", () => {
  let { fila, ids } = com({ tipo: "sucesso", dados: "s" });
  fila = n.pausar(fila, ids[0], "ponteiro", 3000);
  assert.equal(n.proximoVencimento(fila, 3000), null);
  assert.equal(n.vencer(fila, 60000).toasts.length, 1);
  fila = n.retomar(fila, ids[0], "ponteiro", 60000);
  assert.equal(n.proximoVencimento(fila, 60000), 5000);
  assert.equal(n.vencer(fila, 64999).toasts.length, 1);
  assert.equal(n.vencer(fila, 65000).toasts.length, 0);
});

test("dois motivos: só retoma quando os dois acabam", () => {
  let { fila, ids } = com({ tipo: "sucesso", dados: "s" });
  fila = n.pausar(fila, ids[0], "ponteiro", 1000);
  fila = n.pausar(fila, ids[0], "foco", 2000);
  fila = n.retomar(fila, ids[0], "ponteiro", 3000);
  assert.equal(n.proximoVencimento(fila, 3000), null);
  fila = n.retomar(fila, ids[0], "foco", 4000);
  assert.equal(n.proximoVencimento(fila, 4000), 7000);
});

test("pausar duas vezes pelo mesmo motivo não desconta de novo", () => {
  let { fila, ids } = com({ tipo: "sucesso", dados: "s" });
  fila = n.pausar(fila, ids[0], "foco", 2000);
  fila = n.pausar(fila, ids[0], "foco", 5000);
  fila = n.retomar(fila, ids[0], "foco", 5000);
  assert.equal(n.proximoVencimento(fila, 5000), 6000);
});

test("proximoVencimento: o menor entre os que correm; erro não conta", () => {
  let fila = n.filaVazia();
  fila = n.acrescentar(fila, { tipo: "sucesso", dados: 1 }, 0).fila;
  fila = n.acrescentar(fila, { tipo: "erro", dados: 2 }, 0).fila;
  fila = n.acrescentar(fila, { tipo: "sucesso", dados: 3 }, 2000).fila;
  assert.equal(n.proximoVencimento(fila, 2000), 6000);
  assert.equal(n.proximoVencimento(n.filaVazia(), 0), null);
  assert.equal(n.proximoVencimento(com({ tipo: "erro", dados: 1 }).fila, 0), null);
});

test("duração trocada (o --ov-toast-duracao do app)", () => {
  const fila = n.acrescentar(n.filaVazia(), { tipo: "sucesso", dados: 1 }, 0, 3000).fila;
  assert.equal(n.vencer(fila, 3000).toasts.length, 0);
});

test("remover e limpar", () => {
  const { fila, ids } = com({ tipo: "sucesso", dados: 1 }, { tipo: "erro", dados: 2 });
  assert.deepEqual(n.remover(fila, ids[0]).toasts.map((t) => t.dados), [2]);
  assert.equal(n.limpar(fila).toasts.length, 0);
  assert.equal(n.limpar(fila).proximoId, fila.proximoId);
});

test("Ctrl Z: o mais recente com Desfazer", () => {
  const { fila, ids } = com(
    { tipo: "sucesso", dados: 1, desfazivel: true },
    { tipo: "sucesso", dados: 2, desfazivel: true },
    { tipo: "sucesso", dados: 3 },
  );
  assert.equal(n.toastDoCtrlZ(fila, tecla(), false), ids[1]);
  assert.equal(n.toastDoCtrlZ(fila, tecla({ ctrlKey: false, metaKey: true }), false), ids[1]);
  assert.equal(n.toastDoCtrlZ(fila, tecla({ key: "Z" }), false), ids[1]);
});

test("Ctrl Z: nada sem toast desfazível, e erro nunca desfaz", () => {
  assert.equal(n.toastDoCtrlZ(n.filaVazia(), tecla(), false), null);
  const { fila } = com({ tipo: "sucesso", dados: 1 }, { tipo: "erro", dados: 2, desfazivel: true });
  assert.equal(fila.toasts[1].desfazivel, false);
  assert.equal(n.toastDoCtrlZ(fila, tecla(), false), null);
});

test("Ctrl Z: fica com o campo, a composição, o refazer e a camada modal", () => {
  const { fila } = com({ tipo: "sucesso", dados: 1, desfazivel: true });
  assert.equal(n.toastDoCtrlZ(fila, tecla({ alvoEhCampo: true }), false), null);
  assert.equal(n.toastDoCtrlZ(fila, tecla({ isComposing: true }), false), null);
  assert.equal(n.toastDoCtrlZ(fila, tecla({ shiftKey: true }), false), null);
  assert.equal(n.toastDoCtrlZ(fila, tecla({ altKey: true }), false), null);
  assert.equal(n.toastDoCtrlZ(fila, tecla({ ctrlKey: false }), false), null);
  assert.equal(n.toastDoCtrlZ(fila, tecla({ key: "y" }), false), null);
  assert.equal(n.toastDoCtrlZ(fila, tecla(), true), null);
});

test("ehCampo: input, textarea, select e contenteditable", () => {
  assert.equal(n.ehCampo({ tagName: "INPUT" }), true);
  assert.equal(n.ehCampo({ tagName: "textarea" }), true);
  assert.equal(n.ehCampo({ tagName: "SELECT" }), true);
  assert.equal(n.ehCampo({ tagName: "DIV", isContentEditable: true }), true);
  assert.equal(n.ehCampo({ tagName: "BUTTON" }), false);
  assert.equal(n.ehCampo({ tagName: "BODY" }), false);
  assert.equal(n.ehCampo(null), false);
});

test("o núcleo não importa nada (D1: sem dependência)", async () => {
  const { readFileSync } = await import("node:fs");
  const fonte = readFileSync(new URL("../js/toast-nucleo.js", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  assert.doesNotMatch(fonte, /^\s*import\s/m);
  assert.doesNotMatch(fonte, /\b(window|document|React)\b/);
});

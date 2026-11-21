// O núcleo do cookie do navio (js/embarcacao-nucleo.js, v3.26.0, MC17): o id
// do ov-embarcacao, a gravação como o Paradas e a Bordo gravam e o escopo.
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  MAX_AGE_EMBARCACAO,
  NOME_COOKIE_EMBARCACAO,
  OPCOES_DO_COOKIE_EMBARCACAO,
  cookieDeEmbarcacao,
  embarcacaoDoCookie,
  idNoEscopo,
  idsNoEscopo,
  lerIdDeEmbarcacao,
} from "../js/embarcacao-nucleo.js";

test("lerIdDeEmbarcacao: só inteiro positivo, até 15 dígitos", () => {
  assert.equal(lerIdDeEmbarcacao("1"), 1);
  assert.equal(lerIdDeEmbarcacao("42"), 42);
  assert.equal(lerIdDeEmbarcacao("999999999999999"), 999999999999999);
  for (const v of ["0", "01", "-1", "1.5", "1e3", " 1", "1 ", "", "abc", "1234567890123456", undefined, null, 1, {}]) {
    assert.equal(lerIdDeEmbarcacao(v), null, String(v));
  }
});

test("embarcacaoDoCookie: acha o ov-embarcacao no meio dos outros, sem validar o escopo", () => {
  assert.equal(embarcacaoDoCookie("ov-embarcacao=7"), 7);
  assert.equal(embarcacaoDoCookie("a=1; ov-embarcacao=12; b=2"), 12);
  assert.equal(embarcacaoDoCookie("  ov-embarcacao = 3 ;x=y"), 3);
  assert.equal(embarcacaoDoCookie("xov-embarcacao=5; ov-embarcacaox=6"), null);
  assert.equal(embarcacaoDoCookie("ov-embarcacao=abc"), null, "malformado");
  assert.equal(embarcacaoDoCookie("ov-embarcacao=abc; ov-embarcacao=4"), null, "o primeiro decide, como no Paradas");
  for (const v of ["", "a=1", undefined, null, 5]) assert.equal(embarcacaoDoCookie(v), null, String(v));
});

test("cookieDeEmbarcacao: o texto exato que o Paradas grava", () => {
  assert.equal(NOME_COOKIE_EMBARCACAO, "ov-embarcacao");
  assert.equal(MAX_AGE_EMBARCACAO, 31536000);
  assert.equal(cookieDeEmbarcacao(5), "ov-embarcacao=5; Path=/; Max-Age=31536000; Secure; SameSite=Lax");
  assert.doesNotMatch(cookieDeEmbarcacao(5), /HttpOnly/i);
  for (const v of [0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER * 10]) assert.equal(cookieDeEmbarcacao(v), null, String(v));
  assert.equal(embarcacaoDoCookie(cookieDeEmbarcacao(9).split(";")[0]), 9, "o que grava, lê");
});

test("OPCOES_DO_COOKIE_EMBARCACAO: as opções da Bordo, congeladas", () => {
  assert.deepEqual(OPCOES_DO_COOKIE_EMBARCACAO, { path: "/", maxAge: 31536000, secure: true, sameSite: "lax", httpOnly: false });
  assert.ok(Object.isFrozen(OPCOES_DO_COOKIE_EMBARCACAO));
});

const ORG = [3, 1, 8];

test("escopo de frota: todas as da organização, na ordem dela", () => {
  assert.deepEqual(idsNoEscopo({ frota: true }, ORG), [3, 1, 8]);
  assert.deepEqual(idsNoEscopo({ frota: true, embarcacoes: [1] }, ORG), [3, 1, 8], "frota ignora a lista");
  assert.notEqual(idsNoEscopo({ frota: true }, ORG), ORG, "cópia, não a mesma lista");
  assert.ok(idNoEscopo(8, { frota: true }, ORG));
  assert.equal(idNoEscopo(9, { frota: true }, ORG), false, "frota não inventa navio fora da organização");
});

test("escopo em lista: só as listadas que existem na organização, na ordem da organização", () => {
  const escopo = { frota: false, embarcacoes: [8, 3, 99] };
  assert.deepEqual(idsNoEscopo(escopo, ORG), [3, 8]);
  assert.ok(idNoEscopo(3, escopo, ORG));
  assert.equal(idNoEscopo(1, escopo, ORG), false, "da organização, fora do escopo");
  assert.equal(idNoEscopo(99, escopo, ORG), false, "no escopo, fora da organização");
});

test("sem escopo, sem lista ou id que não é número: nada (falha fechado)", () => {
  for (const e of [null, undefined, {}, { frota: false }, { embarcacoes: null }]) {
    assert.deepEqual(idsNoEscopo(e, ORG), [], JSON.stringify(e));
  }
  assert.deepEqual(idsNoEscopo({ frota: true }, null), []);
  assert.equal(idNoEscopo("3", { frota: true }, ORG), false);
  assert.equal(idNoEscopo(null, { frota: true }, ORG), false);
  assert.equal(idNoEscopo(1.5, { frota: true }, [1.5]), false);
});

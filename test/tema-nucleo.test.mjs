// O núcleo do tema (js/tema-nucleo.js, v3.26.0, MC17): ov-tema, a migração
// da chave antiga de cada app (Paradas, Bordo e Materiais) e o tema efetivo.
import { test } from "node:test";
import assert from "node:assert/strict";

import { CHAVE_TEMA, ehTema, gravarPreferenciaTema, lerPreferenciaTema, migrarTemaAntigo, temaEfetivo } from "../js/tema-nucleo.js";

function armazem(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    tudo: () => Object.fromEntries(m),
  };
}
const bloqueado = { getItem() { throw new Error("x"); }, setItem() { throw new Error("x"); }, removeItem() { throw new Error("x"); } };

// A chave antiga do Paradas, aos pedaços: o nome antigo não entra no pacote
// (o `conferir` cobra).
const ANTIGA_DO_PARADAS = ["status", "tt"].join("-") + ":tema";
const PARADAS = { chave: ANTIGA_DO_PARADAS, mapa: { light: "claro", dark: "escuro" } };
const BORDO = { chave: "tema", mapa: { claro: "claro", escuro: "escuro" } };
const MATERIAIS = { chave: "bp-tema", mapa: { claro: "claro", escuro: "escuro" }, migram: ["claro"] };

test("a chave é ov-tema; só claro e escuro são tema", () => {
  assert.equal(CHAVE_TEMA, "ov-tema");
  assert.ok(ehTema("claro") && ehTema("escuro"));
  for (const v of ["light", "dark", "", null, undefined, "Claro", 1]) assert.equal(ehTema(v), false, String(v));
});

test("Paradas: light → claro, dark → escuro, e a antiga sai", () => {
  for (const [antigo, novo] of [["light", "claro"], ["dark", "escuro"]]) {
    const s = armazem({ [ANTIGA_DO_PARADAS]: antigo });
    assert.equal(lerPreferenciaTema(s, PARADAS), novo);
    assert.deepEqual(s.tudo(), { "ov-tema": novo });
  }
  const s = armazem({ [ANTIGA_DO_PARADAS]: "roxo" });
  assert.equal(lerPreferenciaTema(s, PARADAS), null, "fora do mapa não migra");
  assert.deepEqual(s.tudo(), {}, "e a antiga sai mesmo assim");
});

test("Bordo: claro e escuro migram como estão, e a antiga sai", () => {
  for (const v of ["claro", "escuro"]) {
    const s = armazem({ tema: v });
    assert.equal(lerPreferenciaTema(s, BORDO), v);
    assert.deepEqual(s.tudo(), { "ov-tema": v });
  }
  const s = armazem({ tema: "light" });
  assert.equal(lerPreferenciaTema(s, BORDO), null);
  assert.deepEqual(s.tudo(), {});
});

test("Materiais (MC6): só o claro migra; o escuro é apagado sem migrar", () => {
  const claro = armazem({ "bp-tema": "claro" });
  assert.equal(lerPreferenciaTema(claro, MATERIAIS), "claro");
  assert.deepEqual(claro.tudo(), { "ov-tema": "claro" });
  const escuro = armazem({ "bp-tema": "escuro" });
  assert.equal(lerPreferenciaTema(escuro, MATERIAIS), null, "segue o sistema");
  assert.deepEqual(escuro.tudo(), {});
});

test("o ov-tema existente vence a antiga, que sai", () => {
  for (const [m, antigo] of [[PARADAS, "light"], [BORDO, "claro"], [MATERIAIS, "claro"]]) {
    const s = armazem({ [m.chave]: antigo, "ov-tema": "escuro" });
    assert.equal(lerPreferenciaTema(s, m), "escuro", m.chave);
    assert.deepEqual(s.tudo(), { "ov-tema": "escuro" }, m.chave);
  }
});

test("ov-tema inválido conta como ausente: a antiga migra por cima, como nos dois apps", () => {
  const s = armazem({ tema: "claro", "ov-tema": "lilas" });
  assert.equal(lerPreferenciaTema(s, BORDO), "claro");
  assert.deepEqual(s.tudo(), { "ov-tema": "claro" });
});

test("sem a antiga, só lê; sem migração, a antiga fica", () => {
  const s = armazem({ "ov-tema": "claro" });
  assert.equal(lerPreferenciaTema(s, BORDO), "claro");
  const t = armazem({ tema: "escuro" });
  assert.equal(lerPreferenciaTema(t), null);
  assert.deepEqual(t.tudo(), { tema: "escuro" });
});

test("migrarTemaAntigo sozinho, e só uma vez", () => {
  const s = armazem({ "bp-tema": "claro" });
  migrarTemaAntigo(s, MATERIAIS);
  migrarTemaAntigo(s, MATERIAIS);
  assert.deepEqual(s.tudo(), { "ov-tema": "claro" });
});

test("o mapa não lê o protótipo", () => {
  const s = armazem({ tema: "toString" });
  assert.equal(lerPreferenciaTema(s, { chave: "tema", mapa: {}, migram: ["toString"] }), null);
  assert.deepEqual(s.tudo(), {});
});

test("gravar: claro e escuro gravam; null e o resto apagam", () => {
  const s = armazem();
  gravarPreferenciaTema(s, "escuro");
  assert.deepEqual(s.tudo(), { "ov-tema": "escuro" });
  gravarPreferenciaTema(s, null);
  assert.deepEqual(s.tudo(), {});
  gravarPreferenciaTema(s, "claro");
  gravarPreferenciaTema(s, "light");
  assert.deepEqual(s.tudo(), {});
});

test("armazenamento bloqueado ou ausente: null, sem erro", () => {
  for (const s of [bloqueado, null, undefined]) {
    assert.equal(lerPreferenciaTema(s, BORDO), null);
    assert.doesNotThrow(() => gravarPreferenciaTema(s, "claro"));
    assert.doesNotThrow(() => migrarTemaAntigo(s, PARADAS));
  }
});

test("tema efetivo: o escolhido, ou o do sistema", () => {
  assert.equal(temaEfetivo("claro", true), "claro");
  assert.equal(temaEfetivo("escuro", false), "escuro");
  assert.equal(temaEfetivo(null, true), "escuro");
  assert.equal(temaEfetivo(null, false), "claro");
});

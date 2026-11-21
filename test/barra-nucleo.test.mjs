// O núcleo da barra inferior (js/barra-nucleo.js, v3.26.0, MC17): os casos
// do Paradas e da Bordo, com o fora do turno e as 3 seções por parâmetro.
import { test } from "node:test";
import assert from "node:assert/strict";

import { DESTINOS_NA_BARRA, SECOES_NA_BARRA, destinosDaBarra } from "../js/barra-nucleo.js";

const s = (...chaves) => chaves.map((chave) => ({ chave }));
const chaves = (lista) => lista.map((x) => x.chave);
const ver = (r) => ({ temBarra: r.temBarra, naBarra: chaves(r.naBarra), noMais: chaves(r.noMais) });

test("4 destinos, 3 seções: o 4º é do Buscar", () => {
  assert.equal(DESTINOS_NA_BARRA, 4);
  assert.equal(SECOES_NA_BARRA, 3);
});

test("uma seção ou nenhuma: sem barra", () => {
  assert.deepEqual(destinosDaBarra([]), { temBarra: false, naBarra: [], noMais: [] });
  assert.deepEqual(destinosDaBarra(s("parada"), { foraDoTurno: ["admin"] }), { temBarra: false, naBarra: [], noMais: [] });
});

test("Paradas: admin fora do turno vai para o Mais", () => {
  const P = { foraDoTurno: new Set(["admin"]) };
  assert.deepEqual(ver(destinosDaBarra(s("parada", "admin"), P)), { temBarra: true, naBarra: ["parada"], noMais: ["admin"] });
  assert.deepEqual(ver(destinosDaBarra(s("parada", "historico", "indicadores", "admin"), P)), { temBarra: true, naBarra: ["parada", "historico", "indicadores"], noMais: ["admin"] });
});

test("Bordo: tabela-mestra, despacho e templates no Mais; o que passa de 3 também", () => {
  const B = { foraDoTurno: new Set(["tabela-mestra", "despacho", "templates"]) };
  const todas = s("conves", "embarque", "pessoas", "tabela-mestra", "despacho", "templates");
  assert.deepEqual(ver(destinosDaBarra(todas, B)), { temBarra: true, naBarra: ["conves", "embarque", "pessoas"], noMais: ["tabela-mestra", "despacho", "templates"] });
  assert.deepEqual(ver(destinosDaBarra(s("conves", "tabela-mestra"), B)), { temBarra: true, naBarra: ["conves"], noMais: ["tabela-mestra"] });
});

test("o que não cabe vai para o Mais antes das fora do turno, na ordem das seções", () => {
  const r = destinosDaBarra(s("a", "x", "b", "c", "d", "e"), { foraDoTurno: ["x"] });
  assert.deepEqual(ver(r), { temBarra: true, naBarra: ["a", "b", "c"], noMais: ["d", "e", "x"] });
});

test("naBarra como parâmetro; sem fora do turno, todas são do turno", () => {
  assert.deepEqual(ver(destinosDaBarra(s("a", "b", "c"), { naBarra: 2 })), { temBarra: true, naBarra: ["a", "b"], noMais: ["c"] });
  assert.deepEqual(ver(destinosDaBarra(s("a", "b"))), { temBarra: true, naBarra: ["a", "b"], noMais: [] });
});

test("só fora do turno: barra vazia e tudo no Mais (como nos dois apps)", () => {
  assert.deepEqual(ver(destinosDaBarra(s("x", "y"), { foraDoTurno: ["x", "y"] })), { temBarra: true, naBarra: [], noMais: ["x", "y"] });
});

test("devolve os objetos das seções, não cópias", () => {
  const lista = s("a", "b");
  const r = destinosDaBarra(lista);
  assert.equal(r.naBarra[0], lista[0]);
});

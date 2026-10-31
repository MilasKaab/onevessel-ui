// O "+ Filtro" (js/filtro-nucleo.js, v3.20.0, bloco D): os campos livres
// com duas opções ou mais, e o aviso quando não sobra nenhum. O botão nunca
// some (AJ4, 28/10); o critério do aviso é o do Paradas #104.
import { test } from "node:test";
import assert from "node:assert/strict";

import { NADA_PARA_FILTRAR, TODOS_EM_USO, menuDoFiltro } from "../js/filtro-nucleo.js";

const OPCOES = { tipo: ["Tripulante", "Visitante"], empresa: ["BRAM", "Outra", "Mais uma"], turno: ["12 x 12"] };
const opcoes = (c) => OPCOES[c] ?? [];
const CAMPOS = ["tipo", "empresa", "turno"];

test("os textos dos avisos", () => {
  assert.equal(TODOS_EM_USO, "Todos os filtros em uso");
  assert.equal(NADA_PARA_FILTRAR, "Nada para filtrar nesta lista");
});

test("oferece os livres com duas opções ou mais, na ordem dos campos", () => {
  assert.deepEqual(menuDoFiltro(CAMPOS, [], opcoes), { itens: ["tipo", "empresa"], aviso: null });
  assert.deepEqual(menuDoFiltro(CAMPOS, ["tipo"], opcoes), { itens: ["empresa"], aviso: null });
  assert.deepEqual(menuDoFiltro(CAMPOS, new Set(["empresa"]), opcoes), { itens: ["tipo"], aviso: null }, "emUso aceita Set");
});

test("com todos em uso: Todos os filtros em uso", () => {
  assert.deepEqual(menuDoFiltro(CAMPOS, CAMPOS, opcoes), { itens: [], aviso: TODOS_EM_USO });
});

test("algum em uso e os que sobram com uma opção só: Todos os filtros em uso (critério do #104)", () => {
  assert.deepEqual(menuDoFiltro(CAMPOS, ["tipo", "empresa"], opcoes), { itens: [], aviso: TODOS_EM_USO });
});

test("nenhum em uso e nenhum campo com duas opções: Nada para filtrar nesta lista", () => {
  const umaSo = () => ["única"];
  assert.deepEqual(menuDoFiltro(CAMPOS, [], umaSo), { itens: [], aviso: NADA_PARA_FILTRAR });
  assert.deepEqual(menuDoFiltro(CAMPOS, [], () => []), { itens: [], aviso: NADA_PARA_FILTRAR }, "lista vazia");
  assert.deepEqual(menuDoFiltro([], [], opcoes), { itens: [], aviso: NADA_PARA_FILTRAR }, "visão sem campos");
});

test("um campo em uso que não é da visão não conta", () => {
  assert.deepEqual(menuDoFiltro(["turno"], ["tipo"], opcoes), { itens: [], aviso: NADA_PARA_FILTRAR });
});

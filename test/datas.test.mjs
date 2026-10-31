// Data e hora (js/datas.js, v3.20.0, C18): sempre no fuso de Brasília,
// 24 h, sem segundos, sem "h" na hora. O relógio do processo vai a UTC (o da
// Vercel) e depois a Tóquio: a saída não muda, porque nada lê o fuso do
// aparelho.
process.env.TZ = "UTC";

import { test } from "node:test";
import assert from "node:assert/strict";

import { FUSO_DE_BRASILIA, data, dataHora, dataHoraCurta, decorrido, diaRelativo, title } from "../js/datas.js";

const MIN = 60 * 1000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;

test("o fuso é o de Brasília", () => {
  assert.equal(FUSO_DE_BRASILIA, "America/Sao_Paulo");
  assert.equal(new Date("2026-10-26T12:00:00Z").getHours(), 12, "o processo do teste está em UTC");
});

test("data e dataHora: 24 h, sem segundos, sem h", () => {
  assert.equal(data("2026-10-26T12:00:00Z"), "26/10/2026");
  assert.equal(dataHora("2026-10-26T12:00:00Z"), "26/10/2026 09:00");
  assert.equal(dataHora("2026-10-26T12:00:59.999Z"), "26/10/2026 09:00", "segundos não arredondam nem aparecem");
  assert.equal(dataHora("2026-10-26T23:05:00Z"), "26/10/2026 20:05", "24 h");
  assert.equal(dataHora("2026-10-26T03:00:00Z"), "26/10/2026 00:00", "meia-noite é 00, não 24");
  assert.doesNotMatch(dataHora("2026-10-26T12:34:56Z"), /h|:\d\d:\d\d/);
});

test("virada do dia em Brasília com o relógio em UTC: 02:30Z ainda é o dia anterior", () => {
  assert.equal(data("2026-10-27T02:30:00Z"), "26/10/2026");
  assert.equal(dataHora("2026-10-27T02:30:00Z"), "26/10/2026 23:30");
  assert.equal(data("2026-10-27T03:00:00Z"), "27/10/2026");
});

test("virada do ano em Brasília: 01/01 02:59Z ainda é 31/12", () => {
  assert.equal(dataHora("2027-01-01T02:59:00Z"), "31/12/2026 23:59");
  assert.equal(dataHora("2027-01-01T03:00:00Z"), "01/01/2027 00:00");
  // A curta olha o ano de Brasília, não o de UTC.
  assert.equal(dataHoraCurta("2026-12-31T20:00:00Z", "2027-01-01T02:00:00Z"), "31/12, 17:00");
  assert.equal(dataHoraCurta("2026-12-31T20:00:00Z", "2027-01-01T03:00:00Z"), "31/12/2026 17:00");
});

test("dataHoraCurta: vírgula no ano corrente; de outro ano, a completa", () => {
  const agora = new Date("2026-10-31T15:00:00Z");
  assert.equal(dataHoraCurta("2026-10-27T23:00:00Z", agora), "27/10, 20:00");
  assert.equal(dataHoraCurta("2025-10-27T23:00:00Z", agora), "27/10/2025 20:00");
  assert.equal(dataHoraCurta("2027-03-01T12:00:00Z", agora), "01/03/2027 09:00");
});

test("aceita Date, ISO e milissegundos; vazio ou inválido é vazio", () => {
  const ms = Date.parse("2026-10-26T12:00:00Z");
  assert.equal(dataHora(new Date(ms)), "26/10/2026 09:00");
  assert.equal(dataHora(ms), "26/10/2026 09:00");
  assert.equal(dataHora("2026-10-26T09:00:00-03:00"), "26/10/2026 09:00");
  for (const vazio of [null, undefined, "", "amanhã", Number.NaN, Infinity, new Date("x")]) {
    assert.equal(data(vazio), "", String(vazio));
    assert.equal(dataHora(vazio), "", String(vazio));
    assert.equal(dataHoraCurta(vazio), "", String(vazio));
    assert.equal(diaRelativo(vazio), "", String(vazio));
    assert.equal(title(vazio), "", String(vazio));
  }
});

test("texto só com a data é o dia de Brasília que ele nomeia", () => {
  assert.equal(data("2026-10-26"), "26/10/2026", "lido como UTC, seria 25/10");
  assert.equal(dataHora("2026-10-26"), "26/10/2026 00:00");
  assert.equal(diaRelativo("2026-10-26", "2026-10-27T02:30:00Z"), "hoje");
});

test("decorrido: cada faixa", () => {
  assert.equal(decorrido(0), "agora");
  assert.equal(decorrido(59 * 1000), "agora");
  assert.equal(decorrido(-5 * MIN), "agora", "relógio adiantado");
  assert.equal(decorrido(MIN), "há 1 min");
  assert.equal(decorrido(45 * MIN), "há 45 min");
  assert.equal(decorrido(59 * MIN + 59 * 1000), "há 59 min");
  assert.equal(decorrido(HORA), "há 1h");
  assert.equal(decorrido(3 * HORA), "há 3h");
  assert.equal(decorrido(3 * HORA + 5 * MIN), "há 3h05");
  assert.equal(decorrido(3 * HORA + 45 * MIN), "há 3h45");
  assert.equal(decorrido(23 * HORA + 59 * MIN), "há 23h59");
  assert.equal(decorrido(DIA), "há 1 dia");
  assert.equal(decorrido(2 * DIA + 5 * HORA), "há 2 dias");
  assert.equal(decorrido(1234 * DIA), "há 1.234 dias");
  for (const vazio of [null, undefined, Number.NaN, Infinity]) assert.equal(decorrido(vazio), "", String(vazio));
});

test("diaRelativo: hoje, ontem ou a data, pelo dia de Brasília", () => {
  const agora = "2026-10-27T02:30:00Z"; // 26/10 23:30 em Brasília
  assert.equal(diaRelativo("2026-10-26T03:00:00Z", agora), "hoje");
  assert.equal(diaRelativo("2026-10-27T01:00:00Z", agora), "hoje");
  assert.equal(diaRelativo("2026-10-26T02:59:00Z", agora), "ontem", "25/10 23:59 em Brasília");
  assert.equal(diaRelativo("2026-10-25T03:00:00Z", agora), "ontem");
  assert.equal(diaRelativo("2026-10-24T12:00:00Z", agora), "24/10/2026");
  assert.equal(diaRelativo("2026-10-28T12:00:00Z", agora), "28/10/2026", "futuro é a data");
  // Ontem atravessa o mês e o ano.
  assert.equal(diaRelativo("2026-12-31T12:00:00Z", "2027-01-01T12:00:00Z"), "ontem");
  assert.equal(diaRelativo("2026-02-28T12:00:00Z", "2026-03-01T12:00:00Z"), "ontem");
});

test("title é a dataHora", () => {
  assert.equal(title("2026-10-26T12:00:00Z"), "26/10/2026 09:00");
});

test("o fuso do aparelho não muda nada", () => {
  process.env.TZ = "Asia/Tokyo";
  try {
    assert.equal(new Date("2026-10-26T12:00:00Z").getHours(), 21, "o processo está em Tóquio");
    assert.equal(dataHora("2026-10-27T02:30:00Z"), "26/10/2026 23:30");
    assert.equal(data("2026-10-26"), "26/10/2026");
    assert.equal(diaRelativo("2026-10-26T02:59:00Z", "2026-10-27T02:30:00Z"), "ontem");
  } finally {
    process.env.TZ = "UTC";
  }
});

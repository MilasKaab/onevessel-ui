/**
 * Plural certo, nunca "(s)" (`livro-da-marca.md` · Tom e escrita; C8 de
 * 31/10). Zero leva número e plural ("0 atividades"); o número sai em pt-BR,
 * com o ponto do milhar ("1.234 pessoas").
 *
 * Do onevessel-ui (`js/`, v3.20.0): substitui as cinco cópias do Paradas —
 * três só com a palavra (`UploadPanel.jsx`, `IndiceDeDias.jsx`,
 * `Historico.jsx`, que viram `palavra`) e duas com o número
 * (`lib/indicadoresDoDia.js`, `lib/pendencias.js`, que viram `plural`). As
 * cinco já diziam singular só para 1; o que muda é o milhar.
 */

const NUMERO = new Intl.NumberFormat('pt-BR')

/**
 * Só a palavra: `um` quando `n` é 1, `varios` em todo outro caso (0 inclusive).
 * @param {number} n
 * @param {string} um
 * @param {string} varios
 * @returns {string}
 */
export function palavra(n, um, varios) {
  return n === 1 ? um : varios
}

/**
 * O número em pt-BR e a palavra: "1 pessoa", "3 pessoas", "1.234 pessoas".
 * @param {number} n
 * @param {string} um
 * @param {string} varios
 * @returns {string}
 */
export function plural(n, um, varios) {
  return `${NUMERO.format(n)} ${palavra(n, um, varios)}`
}

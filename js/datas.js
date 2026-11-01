/**
 * Data e hora na tela (`livro-da-marca.md` · Tom e escrita; C18 de 31/10):
 * 24 h, sem segundos, sem "h" na hora. Data `26/10/2026`; completa
 * `26/10/2026 09:00` (registro histórico); curta `27/10, 20:00` (ano
 * corrente, operação do dia); relativa `há 3h · hoje · ontem` (decorrido e
 * status), sempre com a completa no `title`; duração `2h05` (o que falta,
 * v3.21.0). Vírgula na etiqueta; o "às" da frase é do app.
 *
 * **Sempre no fuso de Brasília** (`America/Sao_Paulo`, V2 de 31/10), nunca no
 * do aparelho nem no do processo: igual à Bordo (`FUSO_DE_BRASILIA`, A2 da
 * F5) e ao "dia de Brasília" da suíte. Na Vercel o processo roda em UTC, e o
 * instante 02:30Z ainda é o dia anterior em Brasília.
 *
 * Aceita `Date`, texto ISO e milissegundos; vazio ou inválido devolve `""`.
 * Texto só com a data (`"2026-10-26"`, a chave de dia do Paradas) é o dia de
 * Brasília que ele nomeia, à meia-noite — lido como instante UTC, cairia no
 * dia anterior. Um `Date` é sempre instante: a data de `type="date"` gravada
 * à meia-noite UTC (os documentos da Bordo) não passa por aqui.
 *
 * Do onevessel-ui (`js/`, v3.20.0).
 */
import { plural } from './texto.js'

export const FUSO_DE_BRASILIA = 'America/Sao_Paulo'

const PARTES = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO_DE_BRASILIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const SO_DATA = /^\d{4}-\d{2}-\d{2}$/

/**
 * @typedef {Date | string | number | null | undefined} Instante
 * @typedef {{ ano: string, mes: string, dia: string, hora: string, minuto: string }} PartesDeBrasilia
 */

/**
 * @param {Instante} instante
 * @returns {Date | null}
 */
function paraDate(instante) {
  if (instante === null || instante === undefined || instante === '') return null
  let d
  if (instante instanceof Date) d = instante
  else if (typeof instante === 'number') d = Number.isFinite(instante) ? new Date(instante) : null
  else if (typeof instante === 'string') d = new Date(SO_DATA.test(instante) ? `${instante}T00:00:00-03:00` : instante)
  else d = null
  return d && !Number.isNaN(d.getTime()) ? d : null
}

/**
 * @param {Instante} instante
 * @returns {PartesDeBrasilia | null}
 */
function emBrasilia(instante) {
  const d = paraDate(instante)
  if (!d) return null
  const p = Object.fromEntries(PARTES.formatToParts(d).map((x) => [x.type, x.value]))
  return { ano: p.year, mes: p.month, dia: p.day, hora: p.hour, minuto: p.minute }
}

/** "AAAA-MM-DD" do dia de Brasília, para comparar dias. */
const chaveDoDia = (/** @type {PartesDeBrasilia} */ p) => `${p.ano}-${p.mes}-${p.dia}`

/**
 * "26/10/2026".
 * @param {Instante} instante
 * @returns {string}
 */
export function data(instante) {
  const p = emBrasilia(instante)
  return p ? `${p.dia}/${p.mes}/${p.ano}` : ''
}

/**
 * "26/10/2026 09:00" — o registro histórico, e o `title` de toda forma curta
 * ou relativa.
 * @param {Instante} instante
 * @returns {string}
 */
export function dataHora(instante) {
  const p = emBrasilia(instante)
  return p ? `${p.dia}/${p.mes}/${p.ano} ${p.hora}:${p.minuto}` : ''
}

/**
 * "27/10, 20:00" quando o ano (em Brasília) é o de `agora`; de outro ano, a
 * `dataHora`.
 * @param {Instante} instante
 * @param {Instante} [agora]
 * @returns {string}
 */
export function dataHoraCurta(instante, agora = new Date()) {
  const p = emBrasilia(instante)
  if (!p) return ''
  const a = emBrasilia(agora)
  if (!a || a.ano !== p.ano) return dataHora(instante)
  return `${p.dia}/${p.mes}, ${p.hora}:${p.minuto}`
}

/**
 * O tempo, em milissegundos, sem o "há": "menos de 1 min", "45 min" (menos de
 * 60 min), "3h" ou "3h05" (menos de 24 h; os minutos com dois dígitos, só
 * quando não são zero), "1 dia", "2 dias". Negativo ou o que não é número,
 * `""`. Serve ao que falta ("Jornada: faltam 2h05"; o "falta/faltam" é do
 * app). Desde a v3.21.0.
 * @param {number | null | undefined} ms
 * @returns {string}
 */
export function duracao(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return ''
  const minutos = Math.floor(ms / 60000)
  if (minutos < 1) return 'menos de 1 min'
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) {
    const resto = minutos % 60
    return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`
  }
  return plural(Math.floor(horas / 24), 'dia', 'dias')
}

/**
 * O tempo decorrido, em milissegundos: "agora" (menos de 1 min) ou "há " e a
 * `duracao` — "há 45 min", "há 3h", "há 3h05", "há 1 dia", "há 2 dias".
 * Negativo (o relógio do aparelho adiantado) é "agora"; o que não é número,
 * `""`.
 * @param {number | null | undefined} ms
 * @returns {string}
 */
export function decorrido(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return ''
  if (ms < 60000) return 'agora'
  return `há ${duracao(ms)}`
}

/**
 * "hoje", "ontem" ou a `data`, pelo dia de Brasília (um dia futuro também é a
 * data).
 * @param {Instante} instante
 * @param {Instante} [agora]
 * @returns {string}
 */
export function diaRelativo(instante, agora = new Date()) {
  const p = emBrasilia(instante)
  if (!p) return ''
  const a = emBrasilia(agora)
  if (!a) return data(instante)
  const hoje = chaveDoDia(a)
  if (chaveDoDia(p) === hoje) return 'hoje'
  // A véspera pelo calendário (meio-dia UTC: nenhum fuso muda o dia).
  const ontem = new Date(`${hoje}T12:00:00Z`)
  ontem.setUTCDate(ontem.getUTCDate() - 1)
  if (chaveDoDia(p) === ontem.toISOString().slice(0, 10)) return 'ontem'
  return data(instante)
}

/**
 * O `title` de toda forma curta ou relativa: a `dataHora`.
 * @param {Instante} instante
 * @returns {string}
 */
export function title(instante) {
  return dataHora(instante)
}

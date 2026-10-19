/**
 * O teclado da linha da `.ov-tabela` (`componentes.md` · Tabela; D7 da F5):
 * ↑↓ **só movem o foco** entre linhas — não trocam o registro do painel
 * aberto, que tem as setas dele (`teclas-do-painel.js`, com o foco no
 * painel ou no `body`); Enter na linha abre o painel ou troca o registro
 * dele; dentro de um campo da linha, as teclas são do campo. Uma regra para
 * cada foco, sem sobreposição. O X marca a linha só onde há coluna de
 * seleção (`comSelecao`).
 *
 * Do onevessel-ui (`js/`, V10 e V12 da v3.8.0): era
 * `src/lib/teclas-da-tabela.ts` na Bordo (F5-4, F5-5) e
 * `src/lib/teclas-da-tabela.js` no Paradas (T5, H2), iguais linha a linha sem
 * os tipos e os comentários (só o tipo de aspas mudava). Entra como está: o
 * corpo é o do Paradas, com os tipos em JSDoc; os tipos para TypeScript, em
 * `teclas-da-tabela.d.ts`, saíram da Bordo. Quem diz onde está o foco dentro
 * da linha (`alvoNaLinha`) é cada tabela, no app (V13).
 *
 * @typedef {import('./teclas-do-painel.js').TeclaPressionada} TeclaPressionada
 * @typedef {'anterior' | 'proximo' | 'abrir' | 'marcar' | null} AcaoDaLinha
 * @typedef {'campo' | 'linha' | 'outro-controle'} AlvoNaLinha
 */

/**
 * `alvo`: onde está o foco dentro da linha — `'campo'` (as teclas são dele),
 * `'linha'` (a própria linha ou o controle que a abre, o nome) ou
 * `'outro-controle'` (o Enter é dele).
 * @param {TeclaPressionada} tecla
 * @param {AlvoNaLinha} alvo
 * @param {boolean} [comSelecao]
 * @returns {AcaoDaLinha}
 */
export function acaoDaTeclaNaLinha(tecla, alvo, comSelecao = false) {
  if (tecla.ctrlKey || tecla.metaKey || tecla.altKey || tecla.shiftKey) return null
  if (alvo === 'campo') return null
  if (tecla.key === 'ArrowUp') return 'anterior'
  if (tecla.key === 'ArrowDown') return 'proximo'
  if (tecla.key === 'Enter' && alvo === 'linha') return 'abrir'
  // "X" maiúsculo sem Shift é o Caps Lock: marca do mesmo jeito.
  if (comSelecao && (tecla.key === 'x' || tecla.key === 'X')) return 'marcar'
  return null
}

/**
 * Para onde o foco vai: a linha antes ou depois, sem dar a volta (na
 * primeira, ↑ fica; na última, ↓ fica). Foco fora da lista (a linha sumiu
 * num filtro) vai para a primeira.
 * @template T
 * @param {readonly T[]} linhas
 * @param {T | null} atual
 * @param {'anterior' | 'proximo'} acao
 * @returns {T | null}
 */
export function linhaDeDestino(linhas, atual, acao) {
  if (linhas.length === 0) return null
  const posicao = atual === null ? -1 : linhas.indexOf(atual)
  if (posicao === -1) return linhas[0]
  const destino = posicao + (acao === 'anterior' ? -1 : 1)
  return linhas[Math.min(Math.max(destino, 0), linhas.length - 1)]
}

/**
 * A linha que recebe o Tab (tabindex itinerante: uma parada de Tab para a
 * tabela inteira): a marcada, se estiver na lista; senão a última que teve
 * o foco; senão a primeira.
 * @template T
 * @param {readonly T[]} linhas
 * @param {T | null} marcada
 * @param {T | null} ultimaComFoco
 * @returns {T | null}
 */
export function linhaDoTab(linhas, marcada, ultimaComFoco) {
  if (marcada !== null && linhas.includes(marcada)) return marcada
  if (ultimaComFoco !== null && linhas.includes(ultimaComFoco)) return ultimaComFoco
  return linhas[0] ?? null
}

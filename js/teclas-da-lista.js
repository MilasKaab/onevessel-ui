/**
 * O teclado da Lista de cards (`componentes.md` · Lista de cards; C10 de
 * 31/10): uma parada de Tab por lista (o card ativo); ↑↓ andam entre cards
 * **sem dar a volta** (no primeiro, ↑ não faz nada; no último, ↓), Home vai
 * ao primeiro e End ao último; Enter abre ou fecha o card em foco; Esc dentro
 * do card devolve o foco ao card. O núcleo devolve a ação; o app aplica
 * (foco, `tabindex`, abrir e fechar).
 *
 * Onde está o foco (`alvo`), como na `.ov-tabela` (`teclas-da-tabela.js`):
 * - `'card'`: o próprio card (o elemento que leva o `tabindex`). ↑↓, Home,
 *   End e Enter.
 * - `'controle'`: um botão ou link dentro do card. ↑↓, Home e End ainda
 *   andam entre cards (como da Excluir na linha da tabela); o Enter é do
 *   controle; Esc volta ao card.
 * - `'campo'`: um campo de texto ou de escolha dentro do card. As setas,
 *   Home, End e Enter são do campo (o cursor, a quebra de linha do
 *   `textarea`); só o Esc é do núcleo e volta ao card. Um campo que usa o
 *   Esc (uma lista aberta) chama `preventDefault`, e o app não pergunta ao
 *   núcleo quando `defaultPrevented`.
 *
 * Com Ctrl, ⌘, Alt ou Shift a tecla não é da lista (como nos outros núcleos
 * de teclado do pacote).
 *
 * Do onevessel-ui (`js/`, v3.20.0). O Paradas ia começar num hook (o
 * `aoTeclarNasAbas` do `PainelDaTt.jsx` era o ponto de partida); nenhum dos
 * dois apps tinha o teclado da lista ainda.
 *
 * @typedef {import('./teclas-do-painel.js').TeclaPressionada} TeclaPressionada
 * @typedef {'card' | 'controle' | 'campo'} AlvoNaLista
 * @typedef {{ foco: number } | { alternar: number } | { voltarAoCard: number } | null} AcaoDaLista
 */

/**
 * A ação de uma tecla. `indice` é o card onde está o foco (o próprio ou o
 * que contém o controle ou o campo). `null`: a tecla não é da lista, e o app
 * não chama `preventDefault`.
 * @param {TeclaPressionada} tecla
 * @param {number} indice
 * @param {number} total
 * @param {AlvoNaLista} [alvo]
 * @returns {AcaoDaLista}
 */
export function acaoDaTeclaNaLista(tecla, indice, total, alvo = 'card') {
  if (total <= 0 || indice < 0 || indice >= total) return null
  if (tecla.ctrlKey || tecla.metaKey || tecla.altKey || tecla.shiftKey) return null
  if (tecla.key === 'Escape') return alvo === 'card' ? null : { voltarAoCard: indice }
  if (alvo === 'campo') return null
  if (tecla.key === 'Enter') return alvo === 'card' ? { alternar: indice } : null
  let destino = null
  if (tecla.key === 'ArrowUp') destino = indice - 1
  else if (tecla.key === 'ArrowDown') destino = indice + 1
  else if (tecla.key === 'Home') destino = 0
  else if (tecla.key === 'End') destino = total - 1
  if (destino === null || destino < 0 || destino >= total) return null
  // Já no card de destino: nada a fazer. De um controle, ir ao próprio card
  // (Home no primeiro) ainda move o foco.
  if (alvo === 'card' && destino === indice) return null
  return { foco: destino }
}

/**
 * O card que recebe o Tab (uma parada por lista): o último que teve o foco,
 * se ainda estiver na lista; senão o primeiro; -1 com a lista vazia.
 * @param {number} total
 * @param {number | null} ultimoComFoco
 * @returns {number}
 */
export function cardDoTab(total, ultimoComFoco) {
  if (total <= 0) return -1
  if (ultimoComFoco !== null && ultimoComFoco >= 0 && ultimoComFoco < total) return ultimoComFoco
  return 0
}

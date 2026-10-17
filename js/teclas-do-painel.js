/**
 * O teclado do Painel lateral (`componentes.md`, Painel lateral; regra 1;
 * C13 da F4-5), sem React e sem DOM de verdade: o componente descreve a
 * tecla e a situação, e esta função diz o que fazer.
 *
 * - Esc fecha de qualquer lugar da página, menos com um menu aberto (ele é
 *   quem fecha) ou com uma camada modal por cima do painel (ela é quem
 *   fecha). Fechar com dados digitados pergunta — isso é do componente.
 * - ↑ e ↓ trocam de registro só com o foco dentro do painel, fora de campo,
 *   ou no `body` (ninguém com o foco); nunca com tecla modificadora, com
 *   camada modal ou menu por cima, nem num registro novo. Em qualquer outro
 *   lugar (um campo, a planta que rola pelas setas, um botão da página) a
 *   seta faz o que já fazia.
 *
 * Do onevessel-ui (`js/`, V1 da v3.6.0): era `src/lib/teclas-do-painel.ts`
 * na Bordo (F4-5) e `src/lib/teclas-do-painel.js` no Paradas (F4, J5),
 * iguais linha a linha sem os tipos (só o tipo de aspas mudava). Entra como
 * está: o corpo é o do Paradas, com os tipos em JSDoc; os tipos para
 * TypeScript, em `teclas-do-painel.d.ts`, saíram da Bordo.
 *
 * @typedef {'anterior' | 'proximo' | 'fechar' | null} AcaoDaTecla
 * @typedef {'campo' | 'painel' | 'body' | 'fora'} OndeEstaOFoco
 */

/**
 * @param {{ key: string, ctrlKey: boolean, metaKey: boolean, altKey: boolean, shiftKey: boolean }} tecla
 * @param {{ foco: OndeEstaOFoco, camadaPorCima: boolean, menuAberto: boolean, registroNovo: boolean }} situacao
 * @returns {AcaoDaTecla}
 */
export function acaoDaTecla(tecla, situacao) {
  if (situacao.camadaPorCima || situacao.menuAberto) return null
  if (tecla.key === 'Escape') return 'fechar'
  if (tecla.key !== 'ArrowUp' && tecla.key !== 'ArrowDown') return null
  if (tecla.ctrlKey || tecla.metaKey || tecla.altKey || tecla.shiftKey) return null
  if (situacao.registroNovo) return null
  if (situacao.foco !== 'painel' && situacao.foco !== 'body') return null
  return tecla.key === 'ArrowUp' ? 'anterior' : 'proximo'
}

/**
 * Campo de texto ou de escolha: as setas e o Esc são dele.
 * @param {{ tagName: string, isContentEditable?: boolean }} elemento
 */
export function ehCampo(elemento) {
  const tag = elemento.tagName.toUpperCase()
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || elemento.isContentEditable === true
}

/**
 * @template E
 * @param {E | null} ativo
 * @param {E | null} body
 * @param {(elemento: E) => boolean} dentroDoPainel
 * @returns {OndeEstaOFoco}
 */
export function ondeEstaOFoco(ativo, body, dentroDoPainel) {
  if (ativo === null || ativo === body) return 'body'
  if (ehCampo(ativo)) return 'campo'
  return dentroDoPainel(ativo) ? 'painel' : 'fora'
}

/**
 * O registro antes (`-1`) ou depois (`1`) do atual, sem dar a volta. Fora
 * da lista (a atividade que o filtro escondeu, N7), não há vizinho.
 * @template T
 * @param {readonly T[]} lista
 * @param {T} atual
 * @param {-1 | 1} passo
 * @returns {T | null}
 */
export function vizinho(lista, atual, passo) {
  const posicao = lista.indexOf(atual)
  if (posicao === -1) return null
  return lista[posicao + passo] ?? null
}

/**
 * O teclado do Menu (`componentes.md` · Menu; bloco D, livro v4 de 31/10): o
 * mesmo no ⋮, no "+ Filtro", no "Exibir", no seletor de embarcação e no
 * menu da conta. ↑↓ andam pelos itens **com volta**; Home vai ao primeiro,
 * End ao último; Esc fecha e devolve o foco ao gatilho; Tab (e Shift Tab)
 * fecha sem prender o foco, que segue para onde o Tab o levaria; Enter e
 * Espaço são do próprio item (um botão ou um link de verdade), e o núcleo
 * não os toca.
 *
 * Lógica pura de índice e ação. Abrir, posicionar, pôr o foco no primeiro
 * item ao abrir, fechar no clique fora, na rolagem e no redimensionar, e
 * devolver o foco ficam no app. O Esc o app ouve no `document`, para fechar
 * mesmo quando o foco não entrou no menu (clique e tecla logo em seguida).
 * O aviso do "+ Filtro" (`menuitem` com `aria-disabled`) conta como item:
 * recebe o foco das setas, e é assim que o leitor de tela o lê.
 *
 * Do onevessel-ui (`js/`, v3.20.0): o `aoTeclar` do `casca/Menu.jsx` do
 * Paradas e do `casca/menu.tsx` da Bordo, iguais. Duas diferenças das
 * cópias: com Ctrl, ⌘, Alt ou Shift as setas, Home e End não são do menu
 * (Esc e Tab fecham com qualquer modificador), e com o foco fora dos itens
 * (`atual` -1) ↑ vai ao último, não ao penúltimo.
 *
 * @typedef {import('./teclas-do-painel.js').TeclaPressionada} TeclaPressionada
 * @typedef {{ foco: number } | { fechar: true, devolverFoco: boolean } | null} AcaoDoMenu
 */

/**
 * A ação de uma tecla no menu aberto. `atual` é o índice do item em foco (-1
 * se nenhum). `{ foco }`: o app chama `preventDefault` e foca o item;
 * `{ fechar, devolverFoco: true }` (Esc): fecha e foca o gatilho;
 * `{ fechar, devolverFoco: false }` (Tab): fecha **sem** `preventDefault`;
 * `null`: a tecla não é do menu.
 * @param {TeclaPressionada} tecla
 * @param {number} atual
 * @param {number} total
 * @returns {AcaoDoMenu}
 */
export function acaoDaTeclaNoMenu(tecla, atual, total) {
  if (tecla.key === 'Escape') return { fechar: true, devolverFoco: true }
  if (tecla.key === 'Tab') return { fechar: true, devolverFoco: false }
  if (total <= 0) return null
  if (tecla.ctrlKey || tecla.metaKey || tecla.altKey || tecla.shiftKey) return null
  const posicao = atual >= 0 && atual < total ? atual : -1
  if (tecla.key === 'ArrowDown') return { foco: (posicao + 1) % total }
  if (tecla.key === 'ArrowUp') return { foco: posicao === -1 ? total - 1 : (posicao - 1 + total) % total }
  if (tecla.key === 'Home') return { foco: 0 }
  if (tecla.key === 'End') return { foco: total - 1 }
  return null
}

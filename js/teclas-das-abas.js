/**
 * O teclado das abas (`componentes.md` · Visões e filtros e Painel lateral,
 * abas internas; C19 de 31/10): ←→ andam com volta (da última, → vai à
 * primeira), Home vai à primeira, End à última; o resto não é das abas. Serve
 * às visões (`.ov-visoes`) e às abas internas do painel
 * (`.ov-abas-internas`).
 *
 * **A troca acontece no foco:** o app ativa a aba de destino e põe o foco
 * nela, no mesmo passo. **Só a ativa entra no Tab** (`tabindex="0"` nela,
 * `-1` nas outras), e isso é do app, como o `role="tablist"`, o
 * `aria-selected` e o `aria-controls`.
 *
 * Do onevessel-ui (`js/`, v3.20.0): o contrato que já estava escrito três
 * vezes — `AbasDeVisao` da Bordo (`visoes-e-filtros.tsx`) e do Paradas
 * (`VisoesEFiltros.jsx`), `Abas.jsx` do Paradas — e uma quarta sem Home/End
 * (`aoTeclarNasAbas`, no `PainelDaTt.jsx`). Duas diferenças das cópias: com
 * Ctrl, ⌘, Alt ou Shift a tecla não é das abas (como nos outros núcleos de
 * teclado do pacote; Alt ← é o voltar do navegador), e sem aba ativa na
 * lista (`atual` -1) ← vai à última, não à penúltima.
 *
 * @typedef {import('./teclas-do-painel.js').TeclaPressionada} TeclaPressionada
 */

/**
 * O índice da aba de destino, ou `null` quando a tecla não é das abas (o app
 * não chama `preventDefault`). `atual` é o índice da ativa (-1 se nenhuma).
 * @param {number} atual
 * @param {number} total
 * @param {TeclaPressionada} tecla
 * @returns {number | null}
 */
export function abaDeDestino(atual, total, tecla) {
  if (total <= 0) return null
  if (tecla.ctrlKey || tecla.metaKey || tecla.altKey || tecla.shiftKey) return null
  const posicao = atual >= 0 && atual < total ? atual : -1
  if (tecla.key === 'ArrowRight') return (posicao + 1) % total
  if (tecla.key === 'ArrowLeft') return posicao === -1 ? total - 1 : (posicao - 1 + total) % total
  if (tecla.key === 'Home') return 0
  if (tecla.key === 'End') return total - 1
  return null
}

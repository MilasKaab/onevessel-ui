/**
 * O que o "+ Filtro" oferece (`componentes.md` · Visões salvas e filtros;
 * bloco D, livro v4 de 31/10): os campos da visão que ainda não filtram e
 * têm **duas opções ou mais** na lista (filtro que não filtra nada só ocupa
 * espaço), na ordem dos campos. **O botão nunca some** (decidido pelo Salim
 * em 28/10, AJ4): sem campo a oferecer, o menu abre com um aviso no lugar dos
 * itens, para as visões e os chips não andarem.
 *
 * O aviso segue o critério do Paradas #104 (aceito em 29/10): com algum
 * filtro em uso, "Todos os filtros em uso" (também quando os campos que
 * sobram não têm duas opções); sem nenhum, "Nada para filtrar nesta lista".
 *
 * O núcleo não desenha: o aviso é um `menuitem` com `aria-disabled`, focável
 * pelas setas (`menu-nucleo.js`), sem ação. O segundo passo (os valores do
 * campo escolhido, com "Voltar") e os chips são do app.
 *
 * Do onevessel-ui (`js/`, v3.20.0): o `livres` e o `aviso` do `ChipsDeFiltro`
 * do Paradas (`VisoesEFiltros.jsx`). A Bordo (`visoes-e-filtros.tsx`) ainda
 * esconde o "+ Filtro" sem campo livre e oferece campo de uma opção só.
 */

export const TODOS_EM_USO = 'Todos os filtros em uso'
export const NADA_PARA_FILTRAR = 'Nada para filtrar nesta lista'

/**
 * @template C
 * @param {readonly C[]} campos os campos que filtram na visão aberta, na ordem dos chips
 * @param {Iterable<C>} emUso os campos com filtro ligado
 * @param {(campo: C) => readonly unknown[]} opcoes as opções de cada campo na lista
 * @returns {{ itens: C[], aviso: string | null }}
 */
export function menuDoFiltro(campos, emUso, opcoes) {
  const ligados = new Set(emUso)
  const itens = campos.filter((c) => !ligados.has(c) && opcoes(c).length > 1)
  if (itens.length > 0) return { itens, aviso: null }
  const algumEmUso = campos.some((c) => ligados.has(c))
  return { itens, aviso: algumEmUso ? TODOS_EM_USO : NADA_PARA_FILTRAR }
}

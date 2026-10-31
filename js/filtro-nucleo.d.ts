/**
 * Os tipos do "+ Filtro" (`filtro-nucleo.js`, v3.20.0), para os apps em
 * TypeScript.
 */
export declare const TODOS_EM_USO: "Todos os filtros em uso";
export declare const NADA_PARA_FILTRAR: "Nada para filtrar nesta lista";
export interface MenuDoFiltro<C> {
  /** Os campos livres com duas opções ou mais, na ordem dos campos. */
  itens: C[];
  /** Sem itens, o aviso no lugar deles; com itens, `null`. */
  aviso: typeof TODOS_EM_USO | typeof NADA_PARA_FILTRAR | null;
}
export declare function menuDoFiltro<C>(campos: readonly C[], emUso: Iterable<C>, opcoes: (campo: C) => readonly unknown[]): MenuDoFiltro<C>;

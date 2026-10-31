/**
 * Os tipos do teclado da Lista de cards (`teclas-da-lista.js`, v3.20.0),
 * para os apps em TypeScript.
 */
import type { TeclaPressionada } from "./teclas-do-painel.js";

/** Onde está o foco: no card, num botão ou link dele, ou num campo dele. */
export type AlvoNaLista = "card" | "controle" | "campo";
export type AcaoDaLista = { foco: number } | { alternar: number } | { voltarAoCard: number } | null;
/** ↑↓ sem volta, Home, End, Enter no card, Esc de dentro do card; `null` quando a tecla não é da lista. */
export declare function acaoDaTeclaNaLista(tecla: TeclaPressionada, indice: number, total: number, alvo?: AlvoNaLista): AcaoDaLista;
/** O card que recebe o Tab: o último com foco, senão o primeiro; -1 com a lista vazia. */
export declare function cardDoTab(total: number, ultimoComFoco: number | null): number;

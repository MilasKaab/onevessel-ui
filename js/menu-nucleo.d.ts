/**
 * Os tipos do teclado do Menu (`menu-nucleo.js`, v3.20.0), para os apps em
 * TypeScript.
 */
import type { TeclaPressionada } from "./teclas-do-painel.js";

export type AcaoDoMenu = { foco: number } | { fechar: true; devolverFoco: boolean } | null;
/** ↑↓ com volta, Home, End; Esc fecha e devolve o foco; Tab fecha sem prender; Enter e Espaço são do item. */
export declare function acaoDaTeclaNoMenu(tecla: TeclaPressionada, atual: number, total: number): AcaoDoMenu;

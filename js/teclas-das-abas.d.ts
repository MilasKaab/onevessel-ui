/**
 * Os tipos do teclado das abas (`teclas-das-abas.js`, v3.20.0), para os
 * apps em TypeScript.
 */
import type { TeclaPressionada } from "./teclas-do-painel.js";

/** ←→ com volta, Home, End; `null` quando a tecla não é das abas. `atual` -1: nenhuma ativa. */
export declare function abaDeDestino(atual: number, total: number, tecla: TeclaPressionada): number | null;

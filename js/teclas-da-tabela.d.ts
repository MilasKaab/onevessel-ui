/**
 * Os tipos do teclado da linha da `.ov-tabela` (`teclas-da-tabela.js`), para
 * os apps em TypeScript. Saíram do `src/lib/teclas-da-tabela.ts` da Bordo,
 * com os mesmos nomes exportados.
 */
import type { TeclaPressionada } from "./teclas-do-painel.js";

export type AcaoDaLinha = "anterior" | "proximo" | "abrir" | "marcar" | null;
/**
 * Onde está o foco dentro da linha: num campo (as teclas são dele), na
 * própria linha ou no controle que a abre (o nome), ou noutro controle da
 * linha (o Excluir: o Enter é dele).
 */
export type AlvoNaLinha = "campo" | "linha" | "outro-controle";
export declare function acaoDaTeclaNaLinha(tecla: TeclaPressionada, alvo: AlvoNaLinha, comSelecao?: boolean): AcaoDaLinha;
/** A linha antes ou depois, sem dar a volta; fora da lista, a primeira. */
export declare function linhaDeDestino<T>(linhas: readonly T[], atual: T | null, acao: "anterior" | "proximo"): T | null;
/** A linha que recebe o Tab: a marcada, senão a última com foco, senão a primeira. */
export declare function linhaDoTab<T>(linhas: readonly T[], marcada: T | null, ultimaComFoco: T | null): T | null;

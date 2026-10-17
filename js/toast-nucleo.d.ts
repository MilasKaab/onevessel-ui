/**
 * Os tipos do núcleo do Toast (`toast-nucleo.js`), para os apps em
 * TypeScript. Saíram do `src/lib/toast-nucleo.ts` da Bordo, com os mesmos
 * nomes exportados e os mesmos genéricos.
 */
export declare const DURACAO_PADRAO_MS = 8000;
export declare const MAXIMO_DE_TOASTS = 3;
export type TipoDeToast = "sucesso" | "erro";
export type MotivoDePausa = "ponteiro" | "foco";
export interface ToastDaFila<T> {
    id: number;
    tipo: TipoDeToast;
    /** Tem Desfazer que a pessoa pode executar (regra 7: a função da inversa). */
    desfazivel: boolean;
    dados: T;
    /** O que falta do prazo, em ms; `null` é sem prazo (erro). */
    restanteMs: number | null;
    /** Desde quando o prazo corre; `null` enquanto pausado ou sem prazo. */
    correDesde: number | null;
    pausas: readonly MotivoDePausa[];
}
export interface FilaDeToasts<T> {
    toasts: readonly ToastDaFila<T>[];
    proximoId: number;
}
export declare function filaVazia<T>(): FilaDeToasts<T>;
export interface NovoToast<T> {
    tipo: TipoDeToast;
    desfazivel?: boolean;
    dados: T;
}
/** Acrescenta no fim; acima do máximo, os mais antigos saem. */
export declare function acrescentar<T>(fila: FilaDeToasts<T>, novo: NovoToast<T>, agora: number, duracaoMs?: number): {
    fila: FilaDeToasts<T>;
    id: number;
};
export declare function remover<T>(fila: FilaDeToasts<T>, id: number): FilaDeToasts<T>;
/** "Seu acesso mudou", troca de sessão ou de navio: nada fica pendente. */
export declare function limpar<T>(fila: FilaDeToasts<T>): FilaDeToasts<T>;
/** Um motivo de pausa começou (`mouseenter`, `focusin`). */
export declare function pausar<T>(fila: FilaDeToasts<T>, id: number, motivo: MotivoDePausa, agora: number): FilaDeToasts<T>;
/** Um motivo de pausa acabou (`mouseleave`, `focusout`); sem nenhum, o prazo volta a correr. */
export declare function retomar<T>(fila: FilaDeToasts<T>, id: number, motivo: MotivoDePausa, agora: number): FilaDeToasts<T>;
/** Tira os toasts cujo prazo acabou. */
export declare function vencer<T>(fila: FilaDeToasts<T>, agora: number): FilaDeToasts<T>;
/** Em quantos ms o próximo toast vence, ou `null` se nenhum prazo corre. */
export declare function proximoVencimento<T>(fila: FilaDeToasts<T>, agora: number): number | null;
/** O que o filtro do Ctrl Z precisa saber do `keydown`, sem DOM. */
export interface TeclaDoToast {
    key: string;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    isComposing: boolean;
    /** O alvo é `input`, `textarea`, `select` ou `contenteditable`: o Ctrl Z é do campo. */
    alvoEhCampo: boolean;
}
/** Se o alvo do evento é campo de texto, pela etiqueta e pelo `isContentEditable`. */
export declare function ehCampo(alvo: {
    tagName?: string;
    isContentEditable?: boolean;
} | null | undefined): boolean;
/**
 * O id do toast que este `keydown` desfaz, ou `null` (e aí quem chama não
 * faz `preventDefault`). Ctrl ou Cmd + Z, sem Shift (Ctrl Shift Z é refazer)
 * nem Alt.
 */
export declare function toastDoCtrlZ<T>(fila: FilaDeToasts<T>, tecla: TeclaDoToast, camadaModalAberta: boolean): number | null;

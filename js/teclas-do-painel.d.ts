/**
 * Os tipos do teclado do Painel lateral (`teclas-do-painel.js`), para os
 * apps em TypeScript. Saíram do `src/lib/teclas-do-painel.ts` da Bordo, com
 * os mesmos nomes exportados.
 */
export type AcaoDaTecla = "anterior" | "proximo" | "fechar" | null;
/** Onde está o foco, do ponto de vista do painel. */
export type OndeEstaOFoco = "campo" | "painel" | "body" | "fora";
export interface TeclaPressionada {
    key: string;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
}
export interface SituacaoDoPainel {
    foco: OndeEstaOFoco;
    /** Uma camada modal acima do painel (a paleta, um Diálogo). */
    camadaPorCima: boolean;
    menuAberto: boolean;
    /** "Nova pessoa": não há anterior nem próximo. */
    registroNovo: boolean;
}
export declare function acaoDaTecla(tecla: TeclaPressionada, situacao: SituacaoDoPainel): AcaoDaTecla;
/** O mínimo de um elemento que a classificação lê (o teste passa objetos). */
export interface ElementoComFoco {
    tagName: string;
    isContentEditable?: boolean;
}
/** Campo de texto ou de escolha: as setas e o Esc são dele. */
export declare function ehCampo(elemento: ElementoComFoco): boolean;
export declare function ondeEstaOFoco<E extends ElementoComFoco>(ativo: E | null, body: E | null, dentroDoPainel: (elemento: E) => boolean): OndeEstaOFoco;
/** O registro antes (`-1`) ou depois (`1`) do atual, sem dar a volta. */
export declare function vizinho<T>(lista: readonly T[], atual: T, passo: -1 | 1): T | null;

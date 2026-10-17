/**
 * Os tipos da pilha de camadas modais (`camada.js`), para os apps em
 * TypeScript. O `FecharCamada` da Bordo (`camada-modal.ts`) é o `Camada`
 * daqui: a função que fecha, com `estaNoTopo`.
 */
/** Fecha a camada (chamar duas vezes não conta duas); `fechar` é a mesma função. */
export type Camada = (() => void) & {
    fechar: () => void;
    /** Esta camada é a de cima, e ainda está aberta. */
    estaNoTopo: () => boolean;
};
/** Abre uma camada; a primeira trava a rolagem do `<html>`, a última a devolve. */
export declare function abrirCamada(): Camada;
/** Quantas camadas estão abertas agora (0: nenhuma). */
export declare const camadasAbertas: () => number;

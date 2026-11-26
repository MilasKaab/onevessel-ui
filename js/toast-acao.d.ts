/**
 * Os tipos da medida da ação do Toast (`toast-acao.js`, v3.31.0), para os
 * apps em TypeScript.
 */
/** O atributo da marca, na `.ov-toast-linha`. */
export declare const MARCA = "data-acao";
/** O valor da marca com a ação embaixo. */
export declare const EMBAIXO = "embaixo";
/** O texto passa de duas linhas? Em px, com 1 px de folga. */
export declare function passaDeDuasLinhas(altura: number, alturaDaLinha: number): boolean;
/**
 * Liga a medida numa `.ov-toast-linha` (põe ou tira `data-acao="embaixo"`)
 * e devolve a limpeza. Sem `.ov-toast-acao` (fora o X, `data-dispensar`) ou
 * sem `.ov-toast-texto`, não faz nada.
 */
export declare function medirAcaoDoToast(linha: Element | null | undefined): () => void;

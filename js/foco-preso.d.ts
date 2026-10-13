/**
 * Os tipos do foco preso (`foco-preso.js`), para os apps em TypeScript.
 * Saíram do `src/components/casca/foco-preso.ts` da Bordo.
 */
/**
 * O foco preso dos diálogos da casca (a folha do "Mais" e a paleta): de quem
 * o Tab vai para quem, quando sai pela borda. `null` deixa o navegador andar
 * sozinho (o foco está no meio). Sem React e sem DOM: recebe a lista dos
 * focáveis e quem tem o foco.
 */
export declare function focoQueGira<T>(focaveis: readonly T[], ativo: unknown, voltando: boolean): T | null;
/** O que conta como focável dentro de um diálogo. */
export declare const FOCAVEIS = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";

/**
 * Os tipos do registro de alterações (`alteracoes-nucleo.js`), para os apps
 * em TypeScript. Saíram do `src/lib/alteracoes-nucleo.ts` da Bordo; o
 * `DESCARTAR` tem os tipos do `TEXTO_DO_DESCARTE` dela (`as const`).
 */
export interface RegistroDeAlteracoes {
    /** `sujo` verdadeiro: a chave tem dado digitado; falso: não tem mais. */
    marcar(chave: object, sujo: boolean): void;
    /** A chave saiu da tela (desmontou): conta como sem alteração. */
    remover(chave: object): void;
    ha(): boolean;
    /** Um registro filho, que conta neste como uma chave só. */
    filho(): RegistroDeAlteracoes;
}
export declare function criarRegistroDeAlteracoes(pai?: RegistroDeAlteracoes): RegistroDeAlteracoes;
/** O texto único do "Descartar alterações?" nos três apps (C16). */
export declare const DESCARTAR: {
    readonly titulo: "Descartar alterações?";
    readonly frase: "O que você digitou não foi salvo e vai se perder.";
    readonly continuar: "Continuar editando";
    readonly descartar: "Descartar";
};

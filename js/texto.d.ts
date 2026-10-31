/**
 * Os tipos do plural (`texto.js`, v3.20.0), para os apps em TypeScript.
 */
/** Só a palavra: `um` quando `n` é 1, `varios` em todo outro caso (0 inclusive). */
export declare function palavra(n: number, um: string, varios: string): string;
/** O número em pt-BR e a palavra: "1 pessoa", "3 pessoas", "1.234 pessoas". */
export declare function plural(n: number, um: string, varios: string): string;

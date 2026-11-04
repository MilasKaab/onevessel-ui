/**
 * Os tipos de data e hora (`datas.js`, v3.20.0; `duracao` na v3.21.0), para os apps em TypeScript.
 * Tudo no fuso de Brasília; vazio ou inválido devolve "".
 */
export declare const FUSO_DE_BRASILIA: "America/Sao_Paulo";
/** `Date`, texto ISO (só a data é o dia de Brasília que ele nomeia) ou milissegundos. */
export type Instante = Date | string | number | null | undefined;
/** "26/10/2026". */
export declare function data(instante: Instante): string;
/** "26/10/2026 09:00" — o registro histórico. */
export declare function dataHora(instante: Instante): string;
/** "27/10, 20:00" no ano de `agora`; de outro ano, a `dataHora`. */
export declare function dataHoraCurta(instante: Instante, agora?: Instante): string;
/** "menos de 1 min", "45 min", "3h", "3h05", "1 dia", "2 dias"; negativo ou não-número, "" (v3.21.0). */
export declare function duracao(ms: number | null | undefined): string;
/** "agora", "há 45 min", "há 3h", "há 3h05", "há 2 dias". */
export declare function decorrido(ms: number | null | undefined): string;
/** "hoje", "ontem" ou a `data`, pelo dia de Brasília. */
export declare function diaRelativo(instante: Instante, agora?: Instante): string;
/** O `title` de toda forma curta ou relativa: a `dataHora`. */
export declare function title(instante: Instante): string;

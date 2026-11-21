/**
 * Os tipos do núcleo da barra inferior (`barra-nucleo.js`, v3.26.0), para os
 * apps em TypeScript.
 */
/** Destinos da barra, contando o "Buscar". */
export declare const DESTINOS_NA_BARRA = 4;
/** Seções na barra: o 4º lugar é do "Buscar". */
export declare const SECOES_NA_BARRA = 3;
export interface OpcoesDaBarra {
    /** As chaves que vão sempre para o "Mais". */
    foraDoTurno?: Iterable<string>;
    /** Quantas seções vão na barra (3). */
    naBarra?: number;
}
export interface DestinosDaBarra<S> {
    temBarra: boolean;
    naBarra: S[];
    noMais: S[];
}
/** Até `naBarra` seções do turno na barra; o resto e as fora do turno no "Mais". Uma seção ou nenhuma: sem barra. */
export declare function destinosDaBarra<S extends { chave: string }>(secoes: readonly S[], opcoes?: OpcoesDaBarra): DestinosDaBarra<S>;

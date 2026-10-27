/**
 * Os tipos do núcleo da lateral recolhida por escolha (`lateral-nucleo.js`,
 * v3.15.0), para os apps em TypeScript.
 */
export declare const CHAVE_LATERAL = "ov-lateral";
export type EstadoDaLateral = "aberta" | "recolhida";
/** O que se usa do `localStorage`. */
export interface ArmazenamentoDaLateral {
    getItem(chave: string): string | null;
    setItem(chave: string, valor: string): void;
}
/** A escolha guardada no aparelho; sem armazenamento, ausente ou inválida, `"aberta"`. */
export declare function lerLateral(storage: ArmazenamentoDaLateral | null | undefined): EstadoDaLateral;
/** Guarda a escolha; devolve se conseguiu (bloqueado, vale só na página). */
export declare function gravarLateral(storage: ArmazenamentoDaLateral | null | undefined, estado: EstadoDaLateral): boolean;
/**
 * Troca a escolha, grava e devolve o estado novo. `atual` é o estado da
 * página (o `data-lateral` da casca); sem ele, vale o guardado — e com o
 * armazenamento bloqueado o guardado é sempre `"aberta"`.
 */
export declare function alternarLateral(storage: ArmazenamentoDaLateral | null | undefined, atual?: EstadoDaLateral): EstadoDaLateral;
/** Põe `data-lateral` na `.ov-casca`. Sem casca (servidor, teste), nada. */
export declare function aplicarLateral(raiz: {
    setAttribute(nome: string, valor: string): void;
} | null | undefined, estado: EstadoDaLateral): void;
/**
 * O que o botão `.ov-lateral-alternar` mostra em cada estado: o ícone do
 * Lucide, o texto do `.ov-lateral-texto` (v3.15.1), o `aria-label` e o
 * `title`, e o `aria-expanded`.
 */
export interface BotaoDaLateral {
    icone: "panel-left-close" | "panel-left-open";
    /** O mesmo do rótulo. */
    texto: string;
    rotulo: string;
    expandido: boolean;
}
export declare function botaoDaLateral(estado: EstadoDaLateral): BotaoDaLateral;
/** O que se usa do evento `storage`. */
export interface EventoDaLateral {
    /** `null` quando a outra aba limpou o armazenamento. */
    key: string | null;
    newValue: string | null;
}
/** O que se usa da `window`. */
export interface JanelaDaLateral {
    addEventListener(tipo: "storage", ouvinte: (evento: EventoDaLateral) => void): void;
    removeEventListener(tipo: "storage", ouvinte: (evento: EventoDaLateral) => void): void;
}
/**
 * Avisa quando outra aba troca a escolha (o evento `storage` só chega às
 * outras abas da mesma origem). Devolve quem para de ouvir.
 */
export declare function ouvirLateral(janela: JanelaDaLateral | null | undefined, callback: (estado: EstadoDaLateral) => void): () => void;

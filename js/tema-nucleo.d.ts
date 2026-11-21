/**
 * Os tipos do núcleo do tema (`tema-nucleo.js`, v3.26.0), para os apps em
 * TypeScript.
 */
export declare const CHAVE_TEMA = "ov-tema";
export type Tema = "claro" | "escuro";
/** `null` = segue o sistema. */
export type PreferenciaTema = Tema | null;
/** O que se usa do `localStorage`. */
export interface ArmazenamentoDoTema {
    getItem(chave: string): string | null;
    setItem(chave: string, valor: string): void;
    removeItem(chave: string): void;
}
/** A chave antiga de um app e como ela vira `ov-tema`. */
export interface MigracaoDoTema {
    /** A chave antiga. */
    chave: string;
    /** Valor antigo → tema da suíte. */
    mapa: Readonly<Record<string, Tema>>;
    /** Quais valores antigos migram; sem ele, todos os do `mapa`. */
    migram?: readonly string[];
}
export declare const ehTema: (valor: unknown) => valor is Tema;
/**
 * Migra a chave antiga, uma vez: grava o `ov-tema` só se ele não tiver um
 * tema válido e o valor antigo estiver em `migram` e no `mapa`; depois
 * apaga a antiga, sempre. Bloqueado, nada.
 */
export declare function migrarTemaAntigo(storage: ArmazenamentoDoTema | null | undefined, migracao: MigracaoDoTema): void;
/** A preferência guardada (`null` = segue o sistema). Com `migracao`, migra a chave antiga antes de ler. */
export declare function lerPreferenciaTema(storage: ArmazenamentoDoTema | null | undefined, migracao?: MigracaoDoTema): PreferenciaTema;
/** Grava a escolha; `null` volta a seguir o sistema (apaga a chave). */
export declare function gravarPreferenciaTema(storage: ArmazenamentoDoTema | null | undefined, preferencia: PreferenciaTema): void;
/** O tema que vale: o escolhido, ou o do sistema. */
export declare const temaEfetivo: (preferencia: PreferenciaTema, sistemaEscuro: boolean) => Tema;

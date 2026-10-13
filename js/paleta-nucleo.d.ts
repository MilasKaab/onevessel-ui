/**
 * Os tipos do núcleo da Paleta de comandos (`paleta-nucleo.js`), para os apps
 * em TypeScript. Saíram do `src/components/paleta/paleta-nucleo.ts` da Bordo,
 * com os mesmos nomes exportados e os mesmos genéricos.
 */
export { focoQueGira } from "./foco-preso.js";
export interface ItemDaPaleta {
    /** Único dentro do grupo. */
    id: string;
    rotulo: string;
    /** O texto miúdo à direita (o tipo do registro, o convés do camarote). */
    meta?: string;
    /** Atalho da ação, desenhado em `.ov-tecla`. */
    tecla?: string;
    /** Outras palavras que casam com o item, além do rótulo. */
    termos?: readonly string[];
}
export type TipoDeGrupo = "registros" | "acoes" | "ir-para";
export declare const ORDEM_DOS_GRUPOS: readonly TipoDeGrupo[];
export interface GrupoDaPaleta<T extends ItemDaPaleta = ItemDaPaleta> {
    /** Único na paleta. */
    id: string;
    rotulo: string;
    tipo: TipoDeGrupo;
    itens: readonly T[];
    /**
     * Os itens já chegam casados com a consulta (busca feita no servidor):
     * o núcleo não filtra de novo, porque o servidor pode casar por um campo
     * que não volta (o nome de guerra, na Bordo).
     */
    filtrado?: boolean;
    /**
     * Uma linha no lugar dos itens, que aparece mesmo com o grupo vazio:
     * "Buscando…", "Sem conexão para buscar pessoas". Entra no anúncio.
     */
    aviso?: string;
}
export interface EstadoDaPaleta<T extends ItemDaPaleta = ItemDaPaleta> {
    consulta: string;
    /** Os grupos visíveis: filtrados, em ordem, sem os vazios sem aviso. */
    grupos: GrupoDaPaleta<T>[];
    /** A chave (`chaveDoItem`) do item selecionado, ou `null` sem nenhum. */
    selecionado: string | null;
}
/** Sem acento, sem caixa, espaços simples: "  São  JOÃO " → "sao joao". */
export declare function normalizar(texto: string): string;
/** Cada palavra da consulta aparece no rótulo ou num dos termos. Consulta vazia casa com tudo. */
export declare function casa(item: ItemDaPaleta, consulta: string): boolean;
/** Os grupos que aparecem para esta consulta, na ordem registros → ações → "Ir para". */
export declare function filtrar<T extends ItemDaPaleta>(fontes: readonly GrupoDaPaleta<T>[], consulta: string): GrupoDaPaleta<T>[];
export declare const chaveDoItem: (grupo: {
    id: string;
}, item: {
    id: string;
}) => string;
/** Os itens na ordem em que aparecem, cada um com a chave e o grupo. */
export declare function itensEmOrdem<T extends ItemDaPaleta>(grupos: readonly GrupoDaPaleta<T>[]): {
    chave: string;
    grupo: GrupoDaPaleta<T>;
    item: T;
}[];
/** A paleta acabou de abrir: sem texto, o primeiro item selecionado. */
export declare function abrir<T extends ItemDaPaleta>(fontes: readonly GrupoDaPaleta<T>[]): EstadoDaPaleta<T>;
/** O texto mudou: filtra de novo e seleciona o primeiro. */
export declare function digitar<T extends ItemDaPaleta>(fontes: readonly GrupoDaPaleta<T>[], consulta: string): EstadoDaPaleta<T>;
/**
 * As fontes mudaram com o mesmo texto (chegou a resposta do servidor). Quem
 * estava no primeiro continua no primeiro — que pode ser outro, o registro
 * que acabou de chegar; quem já tinha andado fica onde estava, se o item
 * ainda existir.
 */
export declare function atualizar<T extends ItemDaPaleta>(estado: EstadoDaPaleta<T>, fontes: readonly GrupoDaPaleta<T>[]): EstadoDaPaleta<T>;
/** ↑ (−1) e ↓ (+1), dando a volta nas pontas. */
export declare function mover<T extends ItemDaPaleta>(estado: EstadoDaPaleta<T>, passo: 1 | -1): EstadoDaPaleta<T>;
/** O ponteiro passou por cima de um item. */
export declare function selecionar<T extends ItemDaPaleta>(estado: EstadoDaPaleta<T>, chave: string): EstadoDaPaleta<T>;
export declare function itemSelecionado<T extends ItemDaPaleta>(estado: EstadoDaPaleta<T>): {
    grupo: GrupoDaPaleta<T>;
    item: T;
} | null;
export type Efeito<T extends ItemDaPaleta> = {
    tipo: "abrir";
    grupo: GrupoDaPaleta<T>;
    item: T;
} | {
    tipo: "fechar";
} | null;
/**
 * O controlador de teclado do campo. `tratada` diz se a tecla é da paleta
 * (quem desenha chama `preventDefault`); o resto — letras, ←→, Home, End —
 * fica com o campo de texto.
 */
export declare function teclar<T extends ItemDaPaleta>(estado: EstadoDaPaleta<T>, tecla: string): {
    estado: EstadoDaPaleta<T>;
    efeito: Efeito<T>;
    tratada: boolean;
};
/** Ctrl K, ou ⌘K no Mac: abre a paleta de qualquer lugar. */
export declare function ehAtalhoDeAbrir(evento: {
    key: string;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
}): boolean;
/** O nome do atalho no gatilho: "⌘K" no Mac, "Ctrl K" no resto. */
export declare function nomeDoAtalho(plataforma: string): string;
/** O id de cada opção, para o `aria-activedescendant`: a posição na lista, que sempre é um id válido. */
export declare const idDaOpcao: (idDaLista: string, posicao: number) => string;
/** Os atributos ARIA do campo de busca. */
export declare function atributosDoCampo<T extends ItemDaPaleta>(estado: EstadoDaPaleta<T>, idDaLista: string): {
    readonly role: "combobox";
    readonly "aria-controls": string;
    readonly "aria-expanded": true;
    readonly "aria-autocomplete": "list";
    readonly "aria-activedescendant": string | undefined;
};
/** O que o `aria-live` diz: "3 resultados", e os avisos dos grupos. */
export declare function anuncio<T extends ItemDaPaleta>(estado: EstadoDaPaleta<T>): string;

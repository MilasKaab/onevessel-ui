/**
 * Os tipos do núcleo do cookie do navio (`embarcacao-nucleo.js`, v3.26.0),
 * para os apps em TypeScript.
 */
export declare const NOME_COOKIE_EMBARCACAO = "ov-embarcacao";
/** Um ano, em segundos: o `Max-Age` do cookie. */
export declare const MAX_AGE_EMBARCACAO: number;
/** As opções do `cookies().set` do Next, as mesmas da Bordo (congeladas). */
export declare const OPCOES_DO_COOKIE_EMBARCACAO: Readonly<{
    path: "/";
    maxAge: number;
    secure: true;
    sameSite: "lax";
    httpOnly: false;
}>;
/** O id de um valor de cookie, ou `null` se ausente ou malformado (só inteiro positivo). */
export declare function lerIdDeEmbarcacao(valor: unknown): number | null;
/** O id do `ov-embarcacao` num texto de cookies (`document.cookie` ou o cabeçalho `Cookie`), sem validar. */
export declare function embarcacaoDoCookie(texto: unknown): number | null;
/** O texto para `document.cookie = …`; id malformado, `null`. */
export declare function cookieDeEmbarcacao(id: number): string | null;
/** O escopo de um app (o `escopo.<app>` da plataforma). */
export interface EscopoDoApp {
    frota?: boolean;
    embarcacoes?: readonly number[];
}
/** Os ids em que a pessoa tem o app, na ordem da organização. Sem escopo, nenhum. */
export declare function idsNoEscopo(escopo: EscopoDoApp | null | undefined, daOrganizacao: readonly number[] | null | undefined): number[];
/** Se o id vale no escopo do app. */
export declare function idNoEscopo(id: unknown, escopo: EscopoDoApp | null | undefined, daOrganizacao: readonly number[] | null | undefined): boolean;

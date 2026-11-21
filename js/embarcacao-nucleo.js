/**
 * O cookie do navio da suíte (D3; v3.26.0, MC17): `ov-embarcacao`, com o id
 * de uma embarcação do core. É cookie de preferência, não de sessão
 * (`permissoes.md`): carrega só o id, nunca identidade nem permissão, e por
 * isso não é HttpOnly — a Bordo o lê no servidor, o Paradas no cliente.
 * Gravá-lo não dá acesso a nada: toda leitura o valida contra o escopo.
 *
 * Era `src/lib/embarcacao.js` no Paradas e `src/lib/embarcacao.ts` na Bordo:
 * - `lerIdDeEmbarcacao`: igual nos dois, tirando os tipos;
 * - a gravação: os mesmos atributos (`Path=/`, um ano de `Max-Age`,
 *   `Secure`, `SameSite=Lax`, sem `HttpOnly`). O Paradas monta o texto do
 *   `document.cookie` (`cookieDeEmbarcacao`); a Bordo passa as opções ao
 *   `cookies().set` do Next (`OPCOES_DO_COOKIE_EMBARCACAO`), que ainda
 *   acrescenta o `Expires` calculado do `Max-Age`;
 * - o escopo: a mesma regra (frota → todas as embarcações da organização;
 *   senão, só as listadas que existem na organização), com entradas de
 *   formato diferente; aqui, só ids.
 *
 * A regra D4 (qual navio abrir: um só abre e fixa, vários pedem a escolha)
 * fica em cada app. Sem DOM: o texto do cookie vem de quem chama.
 */

export const NOME_COOKIE_EMBARCACAO = "ov-embarcacao";

/** Um ano, em segundos: o `Max-Age` do cookie. */
export const MAX_AGE_EMBARCACAO = 365 * 24 * 60 * 60;

/**
 * As opções do `cookies().set` do Next, as mesmas da Bordo (congeladas).
 * @type {Readonly<{ path: "/"; maxAge: number; secure: true; sameSite: "lax"; httpOnly: false }>}
 */
export const OPCOES_DO_COOKIE_EMBARCACAO = Object.freeze({
  path: "/",
  maxAge: MAX_AGE_EMBARCACAO,
  secure: true,
  sameSite: "lax",
  httpOnly: false,
});

/**
 * O id de um valor de cookie, ou `null` se ausente ou malformado (só
 * inteiro positivo, até 15 dígitos e seguro).
 * @param {unknown} valor
 * @returns {number | null}
 */
export function lerIdDeEmbarcacao(valor) {
  if (typeof valor !== "string" || !/^[1-9][0-9]{0,14}$/.test(valor)) return null;
  const id = Number(valor);
  return Number.isSafeInteger(id) ? id : null;
}

/**
 * O id do `ov-embarcacao` num texto de cookies (o `document.cookie`, ou o
 * cabeçalho `Cookie` no servidor), ainda **sem validar** contra o escopo.
 * Ausente, malformado ou texto que não é texto, `null`.
 * @param {unknown} texto
 * @returns {number | null}
 */
export function embarcacaoDoCookie(texto) {
  if (typeof texto !== "string") return null;
  for (const parte of texto.split(";")) {
    const i = parte.indexOf("=");
    if (i < 0 || parte.slice(0, i).trim() !== NOME_COOKIE_EMBARCACAO) continue;
    return lerIdDeEmbarcacao(parte.slice(i + 1).trim());
  }
  return null;
}

/**
 * O texto para `document.cookie = …`, como o Paradas grava; id malformado,
 * `null` (não grava).
 * @param {number} id
 * @returns {string | null}
 */
export function cookieDeEmbarcacao(id) {
  if (lerIdDeEmbarcacao(String(id)) === null) return null;
  return `${NOME_COOKIE_EMBARCACAO}=${id}; Path=/; Max-Age=${MAX_AGE_EMBARCACAO}; Secure; SameSite=Lax`;
}

/**
 * O escopo de um app numa embarcação (o `escopo.<app>` da plataforma).
 * @typedef {object} EscopoDoApp
 * @property {boolean} [frota]
 * @property {readonly number[]} [embarcacoes]
 */

/**
 * Os ids em que a pessoa tem o app, na ordem da organização: frota → todas
 * as da organização; senão, as listadas no escopo que existem na
 * organização. Sem escopo, nenhuma (falha fechado).
 * @param {EscopoDoApp | null | undefined} escopo
 * @param {readonly number[] | null | undefined} daOrganizacao
 * @returns {number[]}
 */
export function idsNoEscopo(escopo, daOrganizacao) {
  if (!escopo || !Array.isArray(daOrganizacao)) return [];
  if (escopo.frota === true) return [...daOrganizacao];
  const listadas = Array.isArray(escopo.embarcacoes) ? escopo.embarcacoes : [];
  return daOrganizacao.filter((id) => listadas.includes(id));
}

/**
 * Se o id vale no escopo do app (a mesma regra de `idsNoEscopo`).
 * @param {unknown} id
 * @param {EscopoDoApp | null | undefined} escopo
 * @param {readonly number[] | null | undefined} daOrganizacao
 * @returns {boolean}
 */
export function idNoEscopo(id, escopo, daOrganizacao) {
  return typeof id === "number" && Number.isSafeInteger(id) && idsNoEscopo(escopo, daOrganizacao).includes(id);
}

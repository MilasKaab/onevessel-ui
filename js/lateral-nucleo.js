/**
 * A lateral recolhida por escolha (`componentes.md`, Casca; v3.15.0): a
 * pessoa recolhe a barra lateral no computador, e a escolha fica no
 * aparelho, em `ov-lateral`, para todos os módulos na mesma origem. É por
 * aparelho (estação compartilhada), não por pessoa. Sem DOM obrigatório:
 * o armazenamento, a casca e a janela vêm de quem chama.
 *
 * As regras:
 * - dois estados, `"aberta"` e `"recolhida"`; ausente ou qualquer outro
 *   valor é `"aberta"`;
 * - toda leitura e escrita do armazenamento em `try/catch`: bloqueado (aba
 *   anônima, cota, política), a escolha vale só na página, como o `ov-tema`
 *   — por isso `alternarLateral` aceita o estado de agora, que o app tem;
 * - a casca recebe `data-lateral`; o CSS só recolhe a partir de 1024px
 *   (abaixo, a lateral já recolhe sozinha);
 * - outra aba que troca a escolha avisa pelo evento `storage`.
 *
 * Sem atalho de teclado, sem expandir ao passar o mouse, sem animação.
 */

export const CHAVE_LATERAL = "ov-lateral";

/** @typedef {"aberta" | "recolhida"} EstadoDaLateral */

/**
 * O que se usa do `localStorage`.
 * @typedef {object} ArmazenamentoDaLateral
 * @property {(chave: string) => string | null} getItem
 * @property {(chave: string, valor: string) => void} setItem
 */

/**
 * @param {unknown} valor
 * @returns {EstadoDaLateral}
 */
function estadoDe(valor) {
  return valor === "recolhida" ? "recolhida" : "aberta";
}

/**
 * A escolha guardada no aparelho; sem armazenamento, ausente ou inválida, `"aberta"`.
 * @param {ArmazenamentoDaLateral | null | undefined} storage
 * @returns {EstadoDaLateral}
 */
export function lerLateral(storage) {
  try {
    return estadoDe(storage?.getItem(CHAVE_LATERAL));
  } catch {
    return "aberta";
  }
}

/**
 * Guarda a escolha; devolve se conseguiu (bloqueado, vale só na página).
 * @param {ArmazenamentoDaLateral | null | undefined} storage
 * @param {EstadoDaLateral} estado
 * @returns {boolean}
 */
export function gravarLateral(storage, estado) {
  if (!storage) return false;
  try {
    storage.setItem(CHAVE_LATERAL, estadoDe(estado));
    return true;
  } catch {
    return false;
  }
}

/**
 * Troca a escolha, grava e devolve o estado novo. `atual` é o estado da
 * página (o `data-lateral` da casca); sem ele, vale o guardado — e com o
 * armazenamento bloqueado o guardado é sempre `"aberta"`.
 * @param {ArmazenamentoDaLateral | null | undefined} storage
 * @param {EstadoDaLateral} [atual]
 * @returns {EstadoDaLateral}
 */
export function alternarLateral(storage, atual) {
  const agora = atual === undefined ? lerLateral(storage) : estadoDe(atual);
  const novo = agora === "recolhida" ? "aberta" : "recolhida";
  gravarLateral(storage, novo);
  return novo;
}

/**
 * Põe `data-lateral` na `.ov-casca`. Sem casca (servidor, teste), nada.
 * @param {{ setAttribute(nome: string, valor: string): void } | null | undefined} raiz
 * @param {EstadoDaLateral} estado
 * @returns {void}
 */
export function aplicarLateral(raiz, estado) {
  raiz?.setAttribute("data-lateral", estadoDe(estado));
}

/**
 * O que o botão `.ov-lateral-alternar` mostra em cada estado: o ícone do
 * Lucide, o `aria-label` e o `aria-expanded`.
 * @typedef {object} BotaoDaLateral
 * @property {"panel-left-close" | "panel-left-open"} icone
 * @property {string} rotulo
 * @property {boolean} expandido
 */

/**
 * @param {EstadoDaLateral} estado
 * @returns {BotaoDaLateral}
 */
export function botaoDaLateral(estado) {
  return estadoDe(estado) === "recolhida"
    ? { icone: "panel-left-open", rotulo: "Expandir barra lateral", expandido: false }
    : { icone: "panel-left-close", rotulo: "Recolher barra lateral", expandido: true };
}

/**
 * O que se usa do evento `storage`.
 * @typedef {object} EventoDaLateral
 * @property {string | null} key `null` quando a outra aba limpou o armazenamento.
 * @property {string | null} newValue
 */

/**
 * O que se usa da `window`.
 * @typedef {object} JanelaDaLateral
 * @property {(tipo: "storage", ouvinte: (evento: EventoDaLateral) => void) => void} addEventListener
 * @property {(tipo: "storage", ouvinte: (evento: EventoDaLateral) => void) => void} removeEventListener
 */

/**
 * Avisa quando outra aba troca a escolha (o evento `storage` só chega às
 * outras abas da mesma origem). Devolve quem para de ouvir.
 * @param {JanelaDaLateral | null | undefined} janela
 * @param {(estado: EstadoDaLateral) => void} callback
 * @returns {() => void}
 */
export function ouvirLateral(janela, callback) {
  if (!janela) return () => {};
  /** @param {EventoDaLateral} evento */
  const ouvinte = (evento) => {
    if (evento.key !== CHAVE_LATERAL && evento.key !== null) return;
    callback(estadoDe(evento.newValue));
  };
  janela.addEventListener("storage", ouvinte);
  return () => janela.removeEventListener("storage", ouvinte);
}

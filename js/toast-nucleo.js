/**
 * O núcleo comum do Toast (`componentes.md`, Toast; `janelas-e-avisos.md`,
 * regras 5 a 8 e "Desfazer"): fila, temporizador e o filtro do Ctrl Z. Sem
 * React, sem DOM e sem nada de app nenhum — funções puras sobre um estado e
 * um relógio que quem chama fornece (`agora`, em milissegundos).
 *
 * As regras:
 * - no máximo 3 na tela; o quarto empurra o mais antigo para fora;
 * - sucesso some em `duracaoMs` (8 s, o `--ov-toast-duracao` do pacote);
 *   erro não tem prazo e fica até ser dispensado;
 * - o prazo pausa enquanto houver um motivo (o ponteiro em cima, o foco
 *   dentro) e retoma com o que faltava: são os mesmos eventos do CSS
 *   (`:hover`, `:focus-within`), senão a barra e o fechamento se desencontram;
 * - Ctrl Z (Cmd Z) desfaz o toast mais recente que ainda tem Desfazer, só com
 *   o foco fora de campo de texto, sem composição e sem camada modal aberta;
 *   toast de erro não responde.
 *
 * Do onevessel-ui (`js/`, V1 da v3.6.0): era `src/lib/toast-nucleo.ts` na
 * Bordo (F4-1, #29) e `src/lib/toast-nucleo.js` no Paradas (F4, J2), iguais
 * linha a linha sem os tipos. Entra como está: o corpo é o do Paradas, com
 * os tipos em JSDoc; os tipos para TypeScript, em `toast-nucleo.d.ts`, saíram
 * da Bordo.
 */

export const DURACAO_PADRAO_MS = 8000;
export const MAXIMO_DE_TOASTS = 3;

/** @typedef {"sucesso" | "erro"} TipoDeToast */
/** @typedef {"ponteiro" | "foco"} MotivoDePausa */

/**
 * @template T
 * @typedef {object} ToastDaFila
 * @property {number} id
 * @property {TipoDeToast} tipo
 * @property {boolean} desfazivel Tem Desfazer que a pessoa pode executar (regra 7: a função da inversa).
 * @property {T} dados
 * @property {number | null} restanteMs O que falta do prazo, em ms; `null` é sem prazo (erro).
 * @property {number | null} correDesde Desde quando o prazo corre; `null` enquanto pausado ou sem prazo.
 * @property {readonly MotivoDePausa[]} pausas
 */

/**
 * @template T
 * @typedef {object} FilaDeToasts
 * @property {readonly ToastDaFila<T>[]} toasts
 * @property {number} proximoId
 */

/**
 * @template T
 * @returns {FilaDeToasts<T>}
 */
export function filaVazia() {
  return { toasts: [], proximoId: 1 };
}

/**
 * @template T
 * @typedef {object} NovoToast
 * @property {TipoDeToast} tipo
 * @property {boolean} [desfazivel]
 * @property {T} dados
 */

/**
 * Acrescenta no fim; acima do máximo, os mais antigos saem.
 * @template T
 * @param {FilaDeToasts<T>} fila
 * @param {NovoToast<T>} novo
 * @param {number} agora
 * @param {number} [duracaoMs]
 * @returns {{ fila: FilaDeToasts<T>; id: number }}
 */
export function acrescentar(
  fila,
  novo,
  agora,
  duracaoMs = DURACAO_PADRAO_MS,
) {
  const id = fila.proximoId;
  const erro = novo.tipo === "erro";
  /** @type {ToastDaFila<T>} */
  const toast = {
    id,
    tipo: novo.tipo,
    // Toast de erro não desfaz nada: o Ctrl Z o ignora.
    desfazivel: !erro && novo.desfazivel === true,
    dados: novo.dados,
    restanteMs: erro ? null : duracaoMs,
    correDesde: erro ? null : agora,
    pausas: [],
  };
  const toasts = [...fila.toasts, toast].slice(-MAXIMO_DE_TOASTS);
  return { fila: { toasts, proximoId: id + 1 }, id };
}

/**
 * @template T
 * @param {FilaDeToasts<T>} fila
 * @param {number} id
 * @returns {FilaDeToasts<T>}
 */
export function remover(fila, id) {
  return { ...fila, toasts: fila.toasts.filter((toast) => toast.id !== id) };
}

/**
 * "Seu acesso mudou", troca de sessão ou de navio: nada fica pendente.
 * @template T
 * @param {FilaDeToasts<T>} fila
 * @returns {FilaDeToasts<T>}
 */
export function limpar(fila) {
  return { ...fila, toasts: [] };
}

/**
 * @template T
 * @param {ToastDaFila<T>} toast
 * @param {number} agora
 * @returns {number | null}
 */
function restante(toast, agora) {
  if (toast.restanteMs === null) return null;
  if (toast.correDesde === null) return toast.restanteMs;
  return Math.max(0, toast.restanteMs - (agora - toast.correDesde));
}

/**
 * @template T
 * @param {FilaDeToasts<T>} fila
 * @param {number} id
 * @param {(toast: ToastDaFila<T>) => ToastDaFila<T>} mudar
 * @returns {FilaDeToasts<T>}
 */
function trocar(
  fila,
  id,
  mudar,
) {
  return { ...fila, toasts: fila.toasts.map((toast) => (toast.id === id ? mudar(toast) : toast)) };
}

/**
 * Um motivo de pausa começou (`mouseenter`, `focusin`).
 * @template T
 * @param {FilaDeToasts<T>} fila
 * @param {number} id
 * @param {MotivoDePausa} motivo
 * @param {number} agora
 * @returns {FilaDeToasts<T>}
 */
export function pausar(fila, id, motivo, agora) {
  return trocar(fila, id, (toast) => {
    if (toast.pausas.includes(motivo)) return toast;
    return { ...toast, restanteMs: restante(toast, agora), correDesde: null, pausas: [...toast.pausas, motivo] };
  });
}

/**
 * Um motivo de pausa acabou (`mouseleave`, `focusout`); sem nenhum, o prazo volta a correr.
 * @template T
 * @param {FilaDeToasts<T>} fila
 * @param {number} id
 * @param {MotivoDePausa} motivo
 * @param {number} agora
 * @returns {FilaDeToasts<T>}
 */
export function retomar(fila, id, motivo, agora) {
  return trocar(fila, id, (toast) => {
    if (!toast.pausas.includes(motivo)) return toast;
    const pausas = toast.pausas.filter((outro) => outro !== motivo);
    const corre = pausas.length === 0 && toast.restanteMs !== null;
    return { ...toast, pausas, correDesde: corre ? agora : null };
  });
}

/**
 * Tira os toasts cujo prazo acabou.
 * @template T
 * @param {FilaDeToasts<T>} fila
 * @param {number} agora
 * @returns {FilaDeToasts<T>}
 */
export function vencer(fila, agora) {
  const toasts = fila.toasts.filter((toast) => {
    const falta = restante(toast, agora);
    return falta === null || falta > 0 || toast.correDesde === null;
  });
  return toasts.length === fila.toasts.length ? fila : { ...fila, toasts };
}

/**
 * Em quantos ms o próximo toast vence, ou `null` se nenhum prazo corre.
 * @template T
 * @param {FilaDeToasts<T>} fila
 * @param {number} agora
 * @returns {number | null}
 */
export function proximoVencimento(fila, agora) {
  /** @type {number | null} */
  let menor = null;
  for (const toast of fila.toasts) {
    if (toast.correDesde === null) continue;
    const falta = restante(toast, agora);
    if (falta !== null && (menor === null || falta < menor)) menor = falta;
  }
  return menor;
}

/**
 * O que o filtro do Ctrl Z precisa saber do `keydown`, sem DOM.
 * @typedef {object} TeclaDoToast
 * @property {string} key
 * @property {boolean} ctrlKey
 * @property {boolean} metaKey
 * @property {boolean} shiftKey
 * @property {boolean} altKey
 * @property {boolean} isComposing
 * @property {boolean} alvoEhCampo O alvo é `input`, `textarea`, `select` ou `contenteditable`: o Ctrl Z é do campo.
 */

const ETIQUETAS_DE_CAMPO = ["INPUT", "TEXTAREA", "SELECT"];

/**
 * Se o alvo do evento é campo de texto, pela etiqueta e pelo `isContentEditable`.
 * @param {{ tagName?: string; isContentEditable?: boolean } | null | undefined} alvo
 * @returns {boolean}
 */
export function ehCampo(alvo) {
  if (!alvo) return false;
  return alvo.isContentEditable === true || ETIQUETAS_DE_CAMPO.includes((alvo.tagName ?? "").toUpperCase());
}

/**
 * O id do toast que este `keydown` desfaz, ou `null` (e aí quem chama não
 * faz `preventDefault`). Ctrl ou Cmd + Z, sem Shift (Ctrl Shift Z é refazer)
 * nem Alt.
 * @template T
 * @param {FilaDeToasts<T>} fila
 * @param {TeclaDoToast} tecla
 * @param {boolean} camadaModalAberta
 * @returns {number | null}
 */
export function toastDoCtrlZ(
  fila,
  tecla,
  camadaModalAberta,
) {
  if (tecla.key.toLowerCase() !== "z") return null;
  if (!(tecla.ctrlKey || tecla.metaKey) || tecla.shiftKey || tecla.altKey) return null;
  if (tecla.isComposing || tecla.alvoEhCampo || camadaModalAberta) return null;
  for (let i = fila.toasts.length - 1; i >= 0; i -= 1) {
    if (fila.toasts[i].desfazivel) return fila.toasts[i].id;
  }
  return null;
}

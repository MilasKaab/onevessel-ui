/**
 * Onde fica a ação do Toast (v3.31.0; `janelas-e-avisos.md`, regra 6, "Toast
 * com ação, onde fica a ação", decidido em 26/11): ao lado do texto quando o
 * texto cabe em até duas linhas com a ação ao lado; passou de duas, a ação
 * desce para baixo do texto, alinhada à direita. CSS não conta linhas: esta
 * medida põe ou tira `data-acao="embaixo"` na `.ov-toast-linha`, e o
 * `janelas.css` dobra a linha.
 *
 * - Mede o `.ov-toast-texto` **sem a marca**, na largura que ele tem com a
 *   ação ao lado, mesmo quando a ação já está embaixo: tira a marca, lê a
 *   altura e repõe, tudo na mesma tarefa, antes de a pessoa ver. Medir na
 *   largura de cada estado faria o Toast oscilar.
 * - Mais de duas linhas (`line-height` computado × 2, com 1 px de folga)
 *   leva a ação para baixo.
 * - Mede de novo quando a largura da linha muda (`ResizeObserver`; a altura
 *   que a própria marca muda não conta) e quando o texto ou os filhos da
 *   linha mudam (`MutationObserver`), e quando as fontes terminam de chegar.
 * - Conta como ação a `.ov-toast-acao` filha da linha que não é o X de
 *   dispensar (`data-dispensar`): o X fica no alto. Sem ação, ou sem o
 *   `.ov-toast-texto`, não faz nada.
 *
 * Diferente dos núcleos, usa o DOM (recebe o elemento); não importa nada
 * nem depende de React. No React, o app chama num `useLayoutEffect`, que
 * roda antes da pintura, e devolve a limpeza. Os tipos estão em
 * `toast-acao.d.ts`.
 */

/** O atributo da marca, na `.ov-toast-linha`. */
export const MARCA = "data-acao";
/** O valor da marca com a ação embaixo. */
export const EMBAIXO = "embaixo";

const ACAO = ":scope > .ov-toast-acao:not([data-dispensar])";
const TEXTO = ":scope > .ov-toast-texto";

/**
 * O texto passa de duas linhas? `altura` e `alturaDaLinha` em px; 1 px de
 * folga para o arredondamento.
 *
 * @param {number} altura
 * @param {number} alturaDaLinha
 * @returns {boolean}
 */
export function passaDeDuasLinhas(altura, alturaDaLinha) {
  return altura > alturaDaLinha * 2 + 1;
}

const px = (valor) => parseFloat(valor) || 0;

/** O `line-height` computado em px; com `normal`, 1,2 × a fonte. */
function alturaDaLinhaDe(estilo) {
  const linha = parseFloat(estilo.lineHeight);
  if (Number.isFinite(linha)) return linha;
  const fonte = parseFloat(estilo.fontSize);
  return Number.isFinite(fonte) ? fonte * 1.2 : 0;
}

/**
 * A altura das linhas do texto, sem o recuo e a borda. Com movimento
 * reduzido, o onevessel.css dá `transition-duration: .01ms` a tudo: tirada a
 * marca, o recuo de 6px do texto embaixo ainda está saindo (transição) na
 * hora da leitura. O estilo computado e o layout mostram o mesmo valor, e a
 * conta sem ele fica certa nos dois casos. (`offsetHeight` não sente o
 * `transform` da entrada, ovSobe e ovDesce.)
 */
function alturaDoTexto(texto, estilo) {
  return /** @type {HTMLElement} */ (texto).offsetHeight
    - px(estilo.paddingTop) - px(estilo.paddingBottom)
    - px(estilo.borderTopWidth) - px(estilo.borderBottomWidth);
}

const nada = () => {};

/**
 * Liga a medida numa `.ov-toast-linha` e devolve a limpeza (desliga os
 * observadores; a marca fica como estava). Sem `.ov-toast-acao` (fora o X)
 * ou sem `.ov-toast-texto`, não faz nada e devolve uma limpeza vazia.
 *
 * @param {Element | null | undefined} linha
 * @returns {() => void}
 */
export function medirAcaoDoToast(linha) {
  if (!linha || typeof linha.querySelector !== "function") return nada;
  if (!linha.querySelector(ACAO) || !linha.querySelector(TEXTO)) return nada;

  let ligada = true;
  let largura = -1;

  const medir = () => {
    if (!ligada) return;
    const texto = linha.querySelector(TEXTO);
    if (!texto || !linha.querySelector(ACAO)) {
      linha.removeAttribute(MARCA);
      return;
    }
    // Sem a marca, o texto tem a largura de quando a ação está ao lado.
    linha.removeAttribute(MARCA);
    const estilo = getComputedStyle(texto);
    const embaixo = passaDeDuasLinhas(alturaDoTexto(texto, estilo), alturaDaLinhaDe(estilo));
    if (embaixo) linha.setAttribute(MARCA, EMBAIXO);
  };

  medir();

  const tamanho = typeof ResizeObserver === "function"
    ? new ResizeObserver((entradas) => {
      const entrada = entradas[entradas.length - 1];
      const agora = entrada.contentBoxSize?.[0]?.inlineSize ?? entrada.contentRect.width;
      if (agora === largura) return;
      largura = agora;
      medir();
    })
    : null;
  tamanho?.observe(linha);

  const conteudo = typeof MutationObserver === "function" ? new MutationObserver(medir) : null;
  conteudo?.observe(linha, { childList: true, subtree: true, characterData: true });

  const fontes = typeof document === "undefined" ? undefined : document.fonts;
  fontes?.ready?.then(medir, nada);

  return () => {
    ligada = false;
    tamanho?.disconnect();
    conteudo?.disconnect();
  };
}

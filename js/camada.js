/**
 * As camadas modais abertas agora: a folha do "Mais", a paleta, o Diálogo e
 * o Painel lateral quando vira folha, abaixo de 1024 px (`janelas-e-avisos.md`,
 * regras 2 e 3). Uma pilha de módulo, e não um contexto, porque quem pergunta
 * são ouvintes de `keydown` em `document`/`window` (o Ctrl K da paleta, o
 * Ctrl Z do toast, o Esc e o Tab das folhas), que precisam da resposta na
 * hora, sem esperar render.
 *
 * - A página atrás não rola enquanto houver uma: a primeira camada guarda o
 *   `overflow` do `<html>` e a última o devolve.
 * - A única pilha que a regra 3 permite (C9) é o Diálogo "Descartar
 *   alterações?" sobre uma folha: a folha só trata Esc e Tab enquanto
 *   estiver no topo (`estaNoTopo`), e assim o foco preso dela fica suspenso
 *   com o Diálogo aberto.
 * - A paleta não abre com outra camada aberta: pergunta `camadasAbertas()`.
 *
 * Do onevessel-ui (`js/`, V2 da v3.6.0): era `src/components/janelas/camada-modal.ts`
 * na Bordo (`abrirCamadaModal`, `haCamadaModalAberta`) e `src/lib/camada.js`
 * no Paradas (`abrirCamada`, `camadasAbertas`), o mesmo comportamento com
 * nomes diferentes. Ficam os nomes e a proteção de `typeof document` do
 * Paradas (sem `document`, a pilha conta e a trava de rolagem não age). O
 * gancho do React (`useCamadaModal` na Bordo, `useCamada` no Paradas) fica
 * em cada app, como invólucro fino sobre `abrirCamada`: o pacote não depende
 * de React. Os tipos para TypeScript estão em `camada.d.ts`.
 */
/** @type {object[]} */
const pilha = [];
let overflowAntes = "";

const raiz = () => (typeof document === "undefined" ? null : document.documentElement);

/**
 * @typedef {(() => void) & { fechar: () => void, estaNoTopo: () => boolean }} Camada
 */

/**
 * Abre uma camada. Devolve quem a fecha (chamar duas vezes não conta duas):
 * a própria função, ou `fechar()`, que é a mesma; e `estaNoTopo()`: esta
 * camada é a de cima, e ainda está aberta.
 * @returns {Camada}
 */
export function abrirCamada() {
  const html = raiz();
  if (pilha.length === 0 && html) {
    overflowAntes = html.style.overflow;
    html.style.overflow = "hidden";
  }
  const camada = {};
  pilha.push(camada);
  let fechada = false;
  const fechar = () => {
    if (fechada) return;
    fechada = true;
    pilha.splice(pilha.indexOf(camada), 1);
    if (pilha.length === 0 && html) html.style.overflow = overflowAntes;
  };
  return Object.assign(fechar, { fechar, estaNoTopo: () => !fechada && pilha[pilha.length - 1] === camada });
}

/** Quantas camadas estão abertas agora (0: nenhuma). */
export const camadasAbertas = () => pilha.length;

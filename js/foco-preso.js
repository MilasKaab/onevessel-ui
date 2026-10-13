/**
 * O foco preso dos diálogos da casca (a folha do "Mais" e a paleta): de quem
 * o Tab vai para quem, quando sai pela borda. `null` deixa o navegador andar
 * sozinho (o foco está no meio). Sem React e sem DOM: recebe a lista dos
 * focáveis e quem tem o foco.
 *
 * Do onevessel-ui (`js/`, D1): era `src/components/casca/foco-preso.ts` na
 * Bordo e `src/lib/foco-preso.js` no Paradas, iguais linha a linha. Os tipos
 * para TypeScript estão em `foco-preso.d.ts`.
 *
 * @template T
 * @param {readonly T[]} focaveis
 * @param {unknown} ativo
 * @param {boolean} voltando
 * @returns {T | null}
 */
export function focoQueGira(focaveis, ativo, voltando) {
  if (focaveis.length === 0) return null;
  const primeiro = focaveis[0];
  const ultimo = focaveis[focaveis.length - 1];
  if (voltando && (ativo === primeiro || !focaveis.includes(ativo))) return ultimo;
  if (!voltando && (ativo === ultimo || !focaveis.includes(ativo))) return primeiro;
  return null;
}

/** O que conta como focável dentro de um diálogo. */
export const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

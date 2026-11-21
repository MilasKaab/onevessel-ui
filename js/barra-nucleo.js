/**
 * A barra inferior do celular (`componentes.md`, App no celular; C2 do
 * Paradas, D20 da Bordo; v3.26.0, MC17): até 3 seções do turno na barra, na
 * ordem das seções, e "Buscar" no 4º lugar; as que não couberem e as que
 * não são do turno vão para o "Mais", que sempre existe enquanto houver
 * barra. Com uma seção só, ou nenhuma, não há barra.
 *
 * Era `destinosDaBarra` em `src/lib/casca.js` no Paradas e em
 * `src/components/casca/secoes.ts` na Bordo, iguais tirando os tipos. O que
 * era constante de cada app vira parâmetro: o conjunto fora do turno (no
 * Paradas, `admin`; na Bordo, `tabela-mestra`, `despacho` e `templates`) e
 * quantas seções vão na barra (3 nos dois). O "Buscar" e o "Mais" o app
 * desenha.
 */

/** Destinos da barra, contando o "Buscar". */
export const DESTINOS_NA_BARRA = 4;

/** Seções na barra: o 4º lugar é do "Buscar". */
export const SECOES_NA_BARRA = DESTINOS_NA_BARRA - 1;

/**
 * @template {{ chave: string }} S
 * @param {readonly S[]} secoes as seções que a pessoa pode usar, na ordem
 * @param {{ foraDoTurno?: Iterable<string>, naBarra?: number }} [opcoes]
 * @returns {{ temBarra: boolean, naBarra: S[], noMais: S[] }}
 */
export function destinosDaBarra(secoes, { foraDoTurno = [], naBarra = SECOES_NA_BARRA } = {}) {
  if (secoes.length <= 1) return { temBarra: false, naBarra: [], noMais: [] };
  const fora = new Set(foraDoTurno);
  const doTurno = secoes.filter((s) => !fora.has(s.chave));
  return {
    temBarra: true,
    naBarra: doTurno.slice(0, naBarra),
    noMais: [...doTurno.slice(naBarra), ...secoes.filter((s) => fora.has(s.chave))],
  };
}

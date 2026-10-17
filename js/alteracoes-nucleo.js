/**
 * "Há alterações nesta tela" (`janelas-e-avisos.md`, regra 4; D11 e C10–C12
 * da F4), sem React: quem tem campo digitado marca a própria chave, e quem
 * vai descartar (a casca ao navegar, o painel ou a moldura ao fechar)
 * pergunta antes.
 *
 * Os registros fazem árvore: o painel lateral tem o seu, filho do da tela, e
 * a tela conta como alterada enquanto o painel estiver. Assim o painel
 * pergunta só pelo que é dele, e a casca, pelo todo.
 *
 * A pergunta é feita na hora de descartar, lendo `ha()`: nada aqui
 * re-renderiza.
 *
 * Do onevessel-ui (`js/`, V3 da v3.6.0): `criarRegistroDeAlteracoes` era
 * igual linha a linha em `src/lib/alteracoes-nucleo.ts` na Bordo e
 * `src/lib/alteracoes-nucleo.js` no Paradas, com os nomes da Bordo (`marcar`,
 * `remover`, `ha`, `filho`). `DESCARTAR` é o texto único do Diálogo (C16):
 * `TEXTO_DO_DESCARTE` na Bordo (`texto-do-descarte.ts`) e `DESCARTAR` no
 * Paradas, com as mesmas quatro frases. O que diz se houve digitação é de
 * cada app e fica nele: `retratoDosCampos` (Bordo, entradas de `FormData`)
 * e `retrato`, `mudou`, `reportSujo` (Paradas, estado do React). Os tipos
 * para TypeScript estão em `alteracoes-nucleo.d.ts`.
 */

/**
 * @typedef {object} RegistroDeAlteracoes
 * @property {(chave: object, sujo: boolean) => void} marcar `sujo` verdadeiro: a chave tem dado digitado; falso: não tem mais.
 * @property {(chave: object) => void} remover A chave saiu da tela (desmontou): conta como sem alteração.
 * @property {() => boolean} ha
 * @property {() => RegistroDeAlteracoes} filho Um registro filho, que conta neste como uma chave só.
 */

/**
 * @param {RegistroDeAlteracoes} [pai]
 * @returns {RegistroDeAlteracoes}
 */
export function criarRegistroDeAlteracoes(pai) {
  const sujas = new Set();
  /** @type {RegistroDeAlteracoes} */
  const registro = {
    marcar(chave, sujo) {
      if (sujo) sujas.add(chave);
      else sujas.delete(chave);
      pai?.marcar(registro, sujas.size > 0);
    },
    remover(chave) {
      registro.marcar(chave, false);
    },
    ha: () => sujas.size > 0,
    filho: () => criarRegistroDeAlteracoes(registro),
  };
  return registro;
}

/** O texto único do "Descartar alterações?" nos três apps (C16). */
export const DESCARTAR = Object.freeze({
  titulo: "Descartar alterações?",
  frase: "O que você digitou não foi salvo e vai se perder.",
  continuar: "Continuar editando",
  descartar: "Descartar",
});

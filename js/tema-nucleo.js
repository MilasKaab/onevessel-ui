/**
 * O tema da suíte (D9, decidido em 12/10; v3.26.0, MC17): a chave `ov-tema`
 * do `localStorage`, com `"claro"` ou `"escuro"`; ausente = segue o sistema.
 * É a mesma chave em todos os apps da mesma origem. Sem DOM: o
 * armazenamento e a preferência do sistema vêm de quem chama.
 *
 * Era `src/lib/tema.js` no Paradas e `src/lib/tema.ts` na Bordo, iguais
 * tirando a chave antiga e o mapa dos valores dela. A migração recebe os
 * dois por parâmetro, e também quais valores antigos migram:
 * - Paradas: a chave antiga dele (`CHAVE_TEMA_ANTIGA`, em `src/lib/espaco.js`),
 *   `light` → `claro`, `dark` → `escuro`;
 * - Bordo: `tema`, os valores já eram `claro` e `escuro`;
 * - Materiais (MC6): `bp-tema`, só o `claro` migra (o `escuro` gravado pode
 *   ser só o padrão antigo, não uma escolha).
 *
 * As regras da migração:
 * - só grava o `ov-tema` se ele não tiver um tema válido (o da suíte vence);
 * - a chave antiga é apagada sempre que existe, migrando ou não;
 * - toda leitura e escrita em `try/catch`: armazenamento bloqueado (aba
 *   anônima, cota, política) dá `null` e segue o sistema.
 */

export const CHAVE_TEMA = "ov-tema";

/** @typedef {"claro" | "escuro"} Tema */
/** @typedef {Tema | null} PreferenciaTema */

/**
 * O que se usa do `localStorage`.
 * @typedef {object} ArmazenamentoDoTema
 * @property {(chave: string) => string | null} getItem
 * @property {(chave: string, valor: string) => void} setItem
 * @property {(chave: string) => void} removeItem
 */

/**
 * A chave antiga de um app e como ela vira `ov-tema`.
 * @typedef {object} MigracaoDoTema
 * @property {string} chave a chave antiga
 * @property {Record<string, Tema>} mapa valor antigo → tema da suíte
 * @property {readonly string[]} [migram] quais valores antigos migram; sem
 *   ele, todos os do `mapa`
 */

/**
 * @param {unknown} valor
 * @returns {valor is Tema}
 */
export const ehTema = (valor) => valor === "claro" || valor === "escuro";

/**
 * Migra a chave antiga, uma vez: grava o `ov-tema` só se ele não tiver um
 * tema válido e o valor antigo estiver em `migram` e no `mapa`; depois
 * apaga a antiga, sempre. Bloqueado, nada.
 * @param {ArmazenamentoDoTema | null | undefined} storage
 * @param {MigracaoDoTema} migracao
 * @returns {void}
 */
export function migrarTemaAntigo(storage, migracao) {
  try {
    const antiga = storage?.getItem(migracao.chave);
    if (antiga === null || antiga === undefined) return;
    const migram = migracao.migram ?? Object.keys(migracao.mapa);
    const migrado = migram.includes(antiga) && Object.hasOwn(migracao.mapa, antiga) ? migracao.mapa[antiga] : null;
    if (ehTema(migrado) && !ehTema(storage?.getItem(CHAVE_TEMA))) storage?.setItem(CHAVE_TEMA, migrado);
    storage?.removeItem(migracao.chave);
  } catch {
    /* armazenamento bloqueado: a antiga fica, e o tema segue o sistema */
  }
}

/**
 * A preferência guardada: `"claro"`, `"escuro"` ou `null` (segue o sistema).
 * Com `migracao`, migra a chave antiga antes de ler.
 * @param {ArmazenamentoDoTema | null | undefined} storage
 * @param {MigracaoDoTema} [migracao]
 * @returns {PreferenciaTema}
 */
export function lerPreferenciaTema(storage, migracao) {
  if (migracao) migrarTemaAntigo(storage, migracao);
  try {
    const valor = storage?.getItem(CHAVE_TEMA);
    return ehTema(valor) ? valor : null;
  } catch {
    return null;
  }
}

/**
 * Grava a escolha; `null` (ou qualquer outro valor) volta a seguir o
 * sistema e apaga a chave. Bloqueado, vale enquanto a aba estiver aberta.
 * @param {ArmazenamentoDoTema | null | undefined} storage
 * @param {PreferenciaTema} preferencia
 * @returns {void}
 */
export function gravarPreferenciaTema(storage, preferencia) {
  try {
    if (ehTema(preferencia)) storage?.setItem(CHAVE_TEMA, preferencia);
    else storage?.removeItem(CHAVE_TEMA);
  } catch {
    /* modo privativo: vale enquanto a aba estiver aberta */
  }
}

/**
 * O tema que vale: o escolhido, ou o do sistema (`sistemaEscuro`, o
 * `matchMedia("(prefers-color-scheme: dark)").matches` de quem chama).
 * @param {PreferenciaTema} preferencia
 * @param {boolean} sistemaEscuro
 * @returns {Tema}
 */
export const temaEfetivo = (preferencia, sistemaEscuro) => preferencia ?? (sistemaEscuro ? "escuro" : "claro");

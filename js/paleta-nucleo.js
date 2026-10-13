/**
 * O núcleo comum da Paleta de comandos (`componentes.md`, Paleta de
 * comandos): filtro, seleção, teclado, anúncio e foco. Sem React, sem DOM e
 * sem nada de app nenhum: funções puras sobre um estado
 * `{ consulta, grupos, selecionado }` e o controlador de teclado.
 *
 * Cada app fornece as fontes (os grupos, já montados por função: na Bordo,
 * `fontes-bordo.ts`; no Paradas, `paleta-fontes.js`) e desenha o componente.
 * O núcleo só filtra pelo texto, ordena os grupos e anda pela seleção.
 *
 * As regras:
 * - grupos na ordem registros → ações → "Ir para"; registro só com texto
 *   digitado (sem texto, a lista seria o cadastro inteiro);
 * - o primeiro resultado já vem selecionado; ↑↓ andam, dando a volta; Enter
 *   abre; Esc fecha (quem desenha devolve o foco ao gatilho);
 * - o filtro ignora acento e caixa, e cada palavra digitada tem de aparecer;
 * - ARIA: campo `combobox` com `aria-controls`, `aria-expanded` e
 *   `aria-activedescendant`; lista `listbox`; itens `option` com
 *   `aria-selected`;
 * - foco preso enquanto aberta: `focoQueGira`, o mesmo da folha.
 *
 * Do onevessel-ui (`js/`, D1): era `src/components/paleta/paleta-nucleo.ts`
 * na Bordo (F3-5) e `src/lib/paleta-nucleo.js` no Paradas (C4), iguais linha
 * a linha. Os tipos para TypeScript estão em `paleta-nucleo.d.ts`.
 */

export { focoQueGira } from "./foco-preso.js";

/**
 * @typedef {object} ItemDaPaleta
 * @property {string} id Único dentro do grupo.
 * @property {string} rotulo
 * @property {string} [meta] O texto miúdo à direita (o tipo do registro, o convés do camarote).
 * @property {string} [tecla] Atalho da ação, desenhado em `.ov-tecla`.
 * @property {readonly string[]} [termos] Outras palavras que casam com o item, além do rótulo.
 */

/** @typedef {"registros" | "acoes" | "ir-para"} TipoDeGrupo */

/** @type {readonly TipoDeGrupo[]} */
export const ORDEM_DOS_GRUPOS = ["registros", "acoes", "ir-para"];

/**
 * @template {ItemDaPaleta} [T=ItemDaPaleta]
 * @typedef {object} GrupoDaPaleta
 * @property {string} id Único na paleta.
 * @property {string} rotulo
 * @property {TipoDeGrupo} tipo
 * @property {readonly T[]} itens
 * @property {boolean} [filtrado]
 *   Os itens já chegam casados com a consulta (busca feita no servidor):
 *   o núcleo não filtra de novo, porque o servidor pode casar por um campo
 *   que não volta (o nome de guerra, na Bordo).
 * @property {string} [aviso]
 *   Uma linha no lugar dos itens, que aparece mesmo com o grupo vazio:
 *   "Buscando…", "Sem conexão para buscar pessoas". Entra no anúncio.
 */

/**
 * @template {ItemDaPaleta} [T=ItemDaPaleta]
 * @typedef {object} EstadoDaPaleta
 * @property {string} consulta
 * @property {GrupoDaPaleta<T>[]} grupos Os grupos visíveis: filtrados, em ordem, sem os vazios sem aviso.
 * @property {string | null} selecionado A chave (`chaveDoItem`) do item selecionado, ou `null` sem nenhum.
 */

/**
 * Sem acento, sem caixa, espaços simples: "  São  JOÃO " → "sao joao".
 * @param {string} texto
 * @returns {string}
 */
export function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cada palavra da consulta aparece no rótulo ou num dos termos. Consulta vazia casa com tudo.
 * @param {ItemDaPaleta} item
 * @param {string} consulta
 * @returns {boolean}
 */
export function casa(item, consulta) {
  const palavras = normalizar(consulta).split(" ").filter(Boolean);
  if (palavras.length === 0) return true;
  const texto = normalizar([item.rotulo, ...(item.termos ?? [])].join(" "));
  return palavras.every((palavra) => texto.includes(palavra));
}

/**
 * Os grupos que aparecem para esta consulta, na ordem registros → ações → "Ir para".
 * @template {ItemDaPaleta} T
 * @param {readonly GrupoDaPaleta<T>[]} fontes
 * @param {string} consulta
 * @returns {GrupoDaPaleta<T>[]}
 */
export function filtrar(fontes, consulta) {
  const comTexto = normalizar(consulta) !== "";
  const visiveis = [];
  for (const tipo of ORDEM_DOS_GRUPOS) {
    for (const grupo of fontes) {
      if (grupo.tipo !== tipo) continue;
      if (tipo === "registros" && !comTexto) continue;
      const itens = grupo.filtrado ? grupo.itens : grupo.itens.filter((item) => casa(item, consulta));
      if (itens.length === 0 && !grupo.aviso) continue;
      visiveis.push({ ...grupo, itens });
    }
  }
  return visiveis;
}

/**
 * @param {{ id: string }} grupo
 * @param {{ id: string }} item
 */
export const chaveDoItem = (grupo, item) => `${grupo.id}:${item.id}`;

/**
 * Os itens na ordem em que aparecem, cada um com a chave e o grupo.
 * @template {ItemDaPaleta} T
 * @param {readonly GrupoDaPaleta<T>[]} grupos
 * @returns {{ chave: string, grupo: GrupoDaPaleta<T>, item: T }[]}
 */
export function itensEmOrdem(grupos) {
  return grupos.flatMap((grupo) => grupo.itens.map((item) => ({ chave: chaveDoItem(grupo, item), grupo, item })));
}

/**
 * @template {ItemDaPaleta} T
 * @param {readonly GrupoDaPaleta<T>[]} grupos
 */
const primeiraChave = (grupos) => itensEmOrdem(grupos)[0]?.chave ?? null;

/**
 * A paleta acabou de abrir: sem texto, o primeiro item selecionado.
 * @template {ItemDaPaleta} T
 * @param {readonly GrupoDaPaleta<T>[]} fontes
 * @returns {EstadoDaPaleta<T>}
 */
export function abrir(fontes) {
  return digitar(fontes, "");
}

/**
 * O texto mudou: filtra de novo e seleciona o primeiro.
 * @template {ItemDaPaleta} T
 * @param {readonly GrupoDaPaleta<T>[]} fontes
 * @param {string} consulta
 * @returns {EstadoDaPaleta<T>}
 */
export function digitar(fontes, consulta) {
  const grupos = filtrar(fontes, consulta);
  return { consulta, grupos, selecionado: primeiraChave(grupos) };
}

/**
 * As fontes mudaram com o mesmo texto (chegou a resposta do servidor). Quem
 * estava no primeiro continua no primeiro — que pode ser outro, o registro
 * que acabou de chegar; quem já tinha andado fica onde estava, se o item
 * ainda existir.
 * @template {ItemDaPaleta} T
 * @param {EstadoDaPaleta<T>} estado
 * @param {readonly GrupoDaPaleta<T>[]} fontes
 * @returns {EstadoDaPaleta<T>}
 */
export function atualizar(estado, fontes) {
  const grupos = filtrar(fontes, estado.consulta);
  const chaves = itensEmOrdem(grupos).map((i) => i.chave);
  const estavaNoPrimeiro = estado.selecionado === primeiraChave(estado.grupos);
  const selecionado =
    !estavaNoPrimeiro && estado.selecionado !== null && chaves.includes(estado.selecionado)
      ? estado.selecionado
      : (chaves[0] ?? null);
  return { consulta: estado.consulta, grupos, selecionado };
}

/**
 * ↑ (−1) e ↓ (+1), dando a volta nas pontas.
 * @template {ItemDaPaleta} T
 * @param {EstadoDaPaleta<T>} estado
 * @param {1 | -1} passo
 * @returns {EstadoDaPaleta<T>}
 */
export function mover(estado, passo) {
  const chaves = itensEmOrdem(estado.grupos).map((i) => i.chave);
  if (chaves.length === 0) return { ...estado, selecionado: null };
  const atual = estado.selecionado === null ? -1 : chaves.indexOf(estado.selecionado);
  const proximo = atual === -1 ? (passo === 1 ? 0 : chaves.length - 1) : (atual + passo + chaves.length) % chaves.length;
  return { ...estado, selecionado: chaves[proximo] };
}

/**
 * O ponteiro passou por cima de um item.
 * @template {ItemDaPaleta} T
 * @param {EstadoDaPaleta<T>} estado
 * @param {string} chave
 * @returns {EstadoDaPaleta<T>}
 */
export function selecionar(estado, chave) {
  return itensEmOrdem(estado.grupos).some((i) => i.chave === chave) ? { ...estado, selecionado: chave } : estado;
}

/**
 * @template {ItemDaPaleta} T
 * @param {EstadoDaPaleta<T>} estado
 * @returns {{ grupo: GrupoDaPaleta<T>, item: T } | null}
 */
export function itemSelecionado(estado) {
  return itensEmOrdem(estado.grupos).find((i) => i.chave === estado.selecionado) ?? null;
}

/**
 * @template {ItemDaPaleta} T
 * @typedef {{ tipo: "abrir", grupo: GrupoDaPaleta<T>, item: T } | { tipo: "fechar" } | null} Efeito
 */

/**
 * O controlador de teclado do campo. `tratada` diz se a tecla é da paleta
 * (quem desenha chama `preventDefault`); o resto — letras, ←→, Home, End —
 * fica com o campo de texto.
 * @template {ItemDaPaleta} T
 * @param {EstadoDaPaleta<T>} estado
 * @param {string} tecla
 * @returns {{ estado: EstadoDaPaleta<T>, efeito: Efeito<T>, tratada: boolean }}
 */
export function teclar(estado, tecla) {
  switch (tecla) {
    case "ArrowDown":
      return { estado: mover(estado, 1), efeito: null, tratada: true };
    case "ArrowUp":
      return { estado: mover(estado, -1), efeito: null, tratada: true };
    case "Enter": {
      const escolhido = itemSelecionado(estado);
      return { estado, efeito: escolhido ? { tipo: "abrir", ...escolhido } : null, tratada: true };
    }
    case "Escape":
      return { estado, efeito: { tipo: "fechar" }, tratada: true };
    default:
      return { estado, efeito: null, tratada: false };
  }
}

/**
 * Ctrl K, ou ⌘K no Mac: abre a paleta de qualquer lugar.
 * @param {{ key: string, ctrlKey: boolean, metaKey: boolean, altKey: boolean, shiftKey: boolean }} evento
 * @returns {boolean}
 */
export function ehAtalhoDeAbrir(evento) {
  return evento.key.toLowerCase() === "k" && (evento.ctrlKey || evento.metaKey) && !evento.altKey && !evento.shiftKey;
}

/**
 * O nome do atalho no gatilho: "⌘K" no Mac, "Ctrl K" no resto.
 * @param {string} plataforma
 * @returns {string}
 */
export function nomeDoAtalho(plataforma) {
  return /mac|iphone|ipad/i.test(plataforma) ? "⌘K" : "Ctrl K";
}

/**
 * O id de cada opção, para o `aria-activedescendant`: a posição na lista, que sempre é um id válido.
 * @param {string} idDaLista
 * @param {number} posicao
 */
export const idDaOpcao = (idDaLista, posicao) => `${idDaLista}-opcao-${posicao}`;

/**
 * Os atributos ARIA do campo de busca.
 * @template {ItemDaPaleta} T
 * @param {EstadoDaPaleta<T>} estado
 * @param {string} idDaLista
 */
export function atributosDoCampo(estado, idDaLista) {
  const posicao = itensEmOrdem(estado.grupos).findIndex((i) => i.chave === estado.selecionado);
  return {
    role: "combobox",
    "aria-controls": idDaLista,
    "aria-expanded": true,
    "aria-autocomplete": "list",
    "aria-activedescendant": posicao === -1 ? undefined : idDaOpcao(idDaLista, posicao),
  };
}

/**
 * O que o `aria-live` diz: "3 resultados", e os avisos dos grupos.
 * @template {ItemDaPaleta} T
 * @param {EstadoDaPaleta<T>} estado
 * @returns {string}
 */
export function anuncio(estado) {
  const total = itensEmOrdem(estado.grupos).length;
  const contagem = total === 0 ? "Nenhum resultado" : total === 1 ? "1 resultado" : `${total} resultados`;
  const avisos = estado.grupos.flatMap((g) => (g.aviso ? [g.aviso] : []));
  return [contagem, ...avisos].join(". ");
}

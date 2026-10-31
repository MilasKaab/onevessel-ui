// v3.15.0 (decidido em 27/10, `componentes.md`, Casca): a pessoa recolhe a
// lateral no computador. `.ov-casca[data-lateral="recolhida"]` a partir de
// 1024px dá à lateral o mesmo estado de 56px de abaixo de 1024px — só a
// lateral, a margem da tela segue a largura —, o botão
// `.ov-lateral-alternar` no rodapé (só a partir de 1024px) e o núcleo
// `js/lateral-nucleo.js`, que guarda a escolha no aparelho em `ov-lateral`.
// `test/fixtures/casca-v3.14.0.css` é o casca.css da tag v3.14.0, fixo.
// Desde a v3.15.1, a casca daqui é a fixture da v3.15.0 (fixture com
// fixture); o exemplo e o núcleo mudaram só por acréscimo, e o teste dela
// cobra o que mudou.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { regras, semComentario } from '../scripts/css-regras.mjs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const antes = ler('test/fixtures/casca-v3.14.0.css');
const casca = ler('test/fixtures/casca-v3.15.0.css');
const exemplo = ler('exemplo/index.html');
const leiame = ler('README.md');
const pacote = JSON.parse(ler('package.json'));
const n = await import('../js/lateral-nucleo.js');

const ESTREITA = '@media (max-width: 1023px)';
const ESTREITA_TOQUE = '@media (max-width: 1023px) and (pointer: coarse)';
const LARGA = '@media (min-width: 1024px)';
const LARGA_TOQUE = '@media (min-width: 1024px) and (pointer: coarse)';
const TOQUE = '@media (pointer: coarse)';
const ESCOLHA = ':where(.ov-casca[data-lateral="recolhida"])';
const BOTAO = '.ov-lateral-alternar';
// O que fica só no bloco de baixo de 1024px: a margem da tela.
const MARGENS = ['.ov-superior', '.ov-tela', '.ov-faixa'];

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const corpo = (seletor, media = '') => (declaracoesEm(casca, media, seletor) ?? []).join('; ');
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));
// Seletor → todas as declarações dele num @media, na ordem do arquivo.
const porSeletor = (media, filtro = () => true) => {
  const mapa = new Map();
  for (const r of regras(casca).filter((x) => x.media === media)) {
    for (const s of r.seletores) {
      if (!filtro(s, r)) continue;
      mapa.set(s, [...(mapa.get(s) ?? []), ...declaracoes(r.corpo)]);
    }
  }
  return mapa;
};

// ---------- minor: toda regra do casca.css da v3.14.0 igual ----------

// Nenhuma regra da v3.14.0 mudou. O botão entra nas listas do toque e do
// centrado como seletor novo; as regras de antes ficam como estavam.
const NOVAS = [
  `|${BOTAO}`, `|${BOTAO} svg`, `|${BOTAO}:hover`, `|${BOTAO}:focus-visible`,
  `${TOQUE}|${BOTAO}`,
  `${ESTREITA}|${BOTAO}`, `${ESTREITA}|${BOTAO}`,
  `${LARGA}|${ESCOLHA} .ov-lateral`,
  `${LARGA}|${ESCOLHA} .ov-lateral-texto`, `${LARGA}|${ESCOLHA} .ov-lateral-marca-texto`,
  `${LARGA}|${ESCOLHA} .ov-lateral-marca`,
  `${LARGA}|${ESCOLHA} .ov-lateral-grupo`,
  `${LARGA}|${ESCOLHA} .ov-nav`, `${LARGA}|${ESCOLHA} .ov-busca-gatilho`, `${LARGA}|${ESCOLHA} .ov-seletor-embarcacao`, `${LARGA}|${ESCOLHA} .ov-conta`, `${LARGA}|${ESCOLHA} ${BOTAO}`,
  `${LARGA}|${ESCOLHA} .ov-busca-gatilho`,
  `${LARGA}|${ESCOLHA} .ov-nav-cont`, `${LARGA}|${ESCOLHA} .ov-busca-gatilho .ov-tecla`,
  `${LARGA}|${ESCOLHA} .ov-seletor-embarcacao::after`,
  `${LARGA_TOQUE}|${ESCOLHA} .ov-lateral`,
];

test('minor: toda regra do casca.css da v3.14.0 igual', () => {
  for (const r of regras(antes)) {
    for (const s of r.seletores) {
      if (s.startsWith('@')) { assert.ok(chaves(casca).some((c) => c.endsWith(`|${s}`)), `sumiu: ${s}`); continue; }
      assert.deepEqual(declaracoesEm(casca, r.media, s), declaracoesEm(antes, r.media, s), `${r.media}|${s}`);
    }
  }
});

test('casca.css: o que nasceu na v3.15.0 é exatamente a lista', () => {
  const velhas = new Set(chaves(antes));
  assert.deepEqual(chaves(casca).filter((c) => !velhas.has(c)), NOVAS);
});

test('os outros CSS não mudam na v3.15.0', () => {
  // A v3.14.0 não mexeu em CSS: os outros são os da v3.13.0, que o teste
  // dela cobra. Aqui, só que a casca é o único CSS com o atributo novo.
  for (const nome of ['onevessel', 'janelas', 'telas', 'controles', 'relatorio', 'previa', 'impressao']) {
    assert.doesNotMatch(ler(`css/${nome}.css`), /data-lateral|ov-lateral-alternar/, nome);
  }
});

// ---------- O recolhido comum ----------

test('recolhida por escolha = abaixo de 1024px: as mesmas declarações da lateral, seletor por seletor', () => {
  // Abaixo de 1024px, tirando a margem da tela e o botão que some.
  const estreita = porSeletor(ESTREITA, (s, r) => !MARGENS.includes(s) && !(s === BOTAO && /display:\s*none/.test(r.corpo)));
  const larga = porSeletor(LARGA);
  assert.ok(estreita.size >= 10);
  assert.deepEqual([...larga.keys()], [...estreita.keys()].map((s) => `${ESCOLHA} ${s}`));
  for (const [s, ds] of estreita) assert.deepEqual(larga.get(`${ESCOLHA} ${s}`), ds, s);
  // E a regra do toque (alvo de 48 na lateral de 56).
  const toque = porSeletor(ESTREITA_TOQUE);
  const larga_toque = porSeletor(LARGA_TOQUE);
  assert.deepEqual([...larga_toque.keys()], [...toque.keys()].map((s) => `${ESCOLHA} ${s}`));
  for (const [s, ds] of toque) assert.deepEqual(larga_toque.get(`${ESCOLHA} ${s}`), ds, s);
});

test('recolhida por escolha: só pelo atributo, com a força de antes (:where), sem margem nem botão escondido', () => {
  for (const media of [LARGA, LARGA_TOQUE]) {
    for (const r of regras(casca).filter((x) => x.media === media)) {
      for (const s of r.seletores) assert.ok(s.startsWith(`${ESCOLHA} `), s);
    }
  }
  // A margem continua só pela largura: 32px a 1024px ou mais, recolhida ou não.
  for (const s of MARGENS) assert.equal(declaracoesEm(casca, LARGA, `${ESCOLHA} ${s}`), null, s);
  assert.match(corpo('.ov-tela'), /padding: 32px/);
  // O .ov-superior .ov-conta (0,2,0) continua vencendo o centrado (0,1,0),
  // como a 900px: o :where() não soma força.
  assert.match(corpo('.ov-superior .ov-conta'), /padding: 0 12px/);
  // Os blocos vêm depois das regras de base, como o de baixo de 1024px.
  const ordem = regras(casca).map((r) => r.media);
  assert.ok(ordem.indexOf(LARGA) > ordem.lastIndexOf(TOQUE));
  assert.ok(ordem.indexOf(LARGA) > ordem.indexOf(ESTREITA));
});

test('sem animação: nenhuma transition nem animation na lateral, no conteúdo e na tela', () => {
  const texto = semComentario(casca);
  // Na casca inteira não há transition nenhuma.
  assert.doesNotMatch(texto, /transition/);
  for (const r of regras(casca)) {
    if (!r.seletores.some((s) => /\.ov-(casca|lateral|conteudo|tela|superior|nav|conta|busca-gatilho|seletor-embarcacao)/.test(s))) continue;
    assert.doesNotMatch(r.corpo, /animation|transition/, r.seletores.join(', '));
  }
});

// ---------- O botão ----------

test('botão: régua da lateral (100% e 32px; 48 no toque), ícone centrado na recolhida, anel único', () => {
  const base = corpo(BOTAO);
  assert.match(base, /box-sizing: border-box/);
  assert.match(base, /display: flex/);
  assert.match(base, /width: 100%/);
  assert.match(base, /height: 32px/);
  assert.match(base, /padding: 0 10px/);
  assert.match(base, /border: 0/);
  assert.match(base, /cursor: pointer/);
  assert.equal(corpo(BOTAO, TOQUE), 'height: var(--ov-altura-toque)');
  assert.equal(corpo(`${ESCOLHA} ${BOTAO}`, LARGA), 'justify-content: center; padding: 0');
  assert.equal(corpo(`${BOTAO}:focus-visible`), 'outline: 2px solid var(--ov-foco); outline-offset: 2px');
  // Cabe na recolhida: 56 − 1 de borda − 12 − 12 = 31 de largura útil, e o
  // botão é 100% dela; nenhuma largura fixa.
  for (const r of regras(casca)) if (r.seletores.some((s) => s.includes(BOTAO))) assert.doesNotMatch(r.corpo, /width:\s*[\d.]+(px|rem|em)/, r.seletores.join(', '));
});

test('botão: escondido abaixo de 1024px, visível a partir dele', () => {
  const regra = regras(casca).find((r) => r.media === ESTREITA && r.seletores.length === 1 && r.seletores[0] === BOTAO);
  assert.equal(declaracoes(regra.corpo).join('; '), 'display: none');
  for (const r of regras(casca).filter((x) => x.media === LARGA || x.media === LARGA_TOQUE || x.media === '')) {
    if (r.seletores.some((s) => s.endsWith(BOTAO))) assert.doesNotMatch(r.corpo, /display:\s*none/);
  }
});

// ---------- Núcleo ----------

const armazenamento = (inicial = {}) => {
  const dados = { ...inicial };
  return { dados, getItem: (k) => (k in dados ? dados[k] : null), setItem: (k, v) => { dados[k] = String(v); } };
};
const quebrado = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); } };
const casca_ = () => { const attrs = {}; return { attrs, setAttribute: (k, v) => { attrs[k] = v; } }; };

test('núcleo: a chave e a leitura (ausente ou inválida = aberta)', () => {
  assert.equal(n.CHAVE_LATERAL, 'ov-lateral');
  assert.equal(n.lerLateral(armazenamento()), 'aberta');
  assert.equal(n.lerLateral(armazenamento({ 'ov-lateral': 'recolhida' })), 'recolhida');
  assert.equal(n.lerLateral(armazenamento({ 'ov-lateral': 'aberta' })), 'aberta');
  for (const lixo of ['', 'Recolhida', 'true', '1', '{}']) assert.equal(n.lerLateral(armazenamento({ 'ov-lateral': lixo })), 'aberta', lixo);
  assert.equal(n.lerLateral(null), 'aberta');
  assert.equal(n.lerLateral(undefined), 'aberta');
});

test('núcleo: gravar e alternar', () => {
  const a = armazenamento();
  assert.equal(n.gravarLateral(a, 'recolhida'), true);
  assert.equal(a.dados['ov-lateral'], 'recolhida');
  assert.equal(n.alternarLateral(a), 'aberta');
  assert.equal(a.dados['ov-lateral'], 'aberta');
  assert.equal(n.alternarLateral(a), 'recolhida');
  assert.equal(n.lerLateral(a), 'recolhida');
  // Estado inválido não entra no aparelho.
  n.gravarLateral(a, 'lixo');
  assert.equal(a.dados['ov-lateral'], 'aberta');
  // Com o estado da página, ele vence o guardado.
  assert.equal(n.alternarLateral(armazenamento({ 'ov-lateral': 'recolhida' }), 'aberta'), 'recolhida');
});

test('núcleo: armazenamento quebrado não derruba nada e a escolha vale na página', () => {
  assert.equal(n.lerLateral(quebrado), 'aberta');
  assert.equal(n.gravarLateral(quebrado, 'recolhida'), false);
  assert.equal(n.gravarLateral(null, 'recolhida'), false);
  // Sem gravar, o app alterna pelo estado da página.
  let estado = 'aberta';
  estado = n.alternarLateral(quebrado, estado);
  assert.equal(estado, 'recolhida');
  estado = n.alternarLateral(quebrado, estado);
  assert.equal(estado, 'aberta');
  assert.equal(n.alternarLateral(null), 'recolhida');
});

test('núcleo: aplicar põe data-lateral na casca; sem casca, nada', () => {
  const c = casca_();
  n.aplicarLateral(c, 'recolhida');
  assert.deepEqual(c.attrs, { 'data-lateral': 'recolhida' });
  n.aplicarLateral(c, 'aberta');
  assert.deepEqual(c.attrs, { 'data-lateral': 'aberta' });
  n.aplicarLateral(c, 'lixo');
  assert.deepEqual(c.attrs, { 'data-lateral': 'aberta' });
  assert.doesNotThrow(() => n.aplicarLateral(null, 'recolhida'));
});

test('núcleo: o botão em cada estado (ícone do Lucide, aria-label, aria-expanded)', () => {
  // Os três da v3.15.0; o texto da v3.15.1 fica no teste dela.
  const tres = (estado) => { const { icone, rotulo, expandido } = n.botaoDaLateral(estado); return { icone, rotulo, expandido }; };
  assert.deepEqual(tres('aberta'), { icone: 'panel-left-close', rotulo: 'Recolher barra lateral', expandido: true });
  assert.deepEqual(tres('recolhida'), { icone: 'panel-left-open', rotulo: 'Expandir barra lateral', expandido: false });
  assert.deepEqual(n.botaoDaLateral('lixo'), n.botaoDaLateral('aberta'));
});

test('núcleo: o evento de outra aba (storage), só da chave, e quem para de ouvir', () => {
  const ouvintes = new Set();
  const janela = {
    addEventListener: (tipo, f) => { assert.equal(tipo, 'storage'); ouvintes.add(f); },
    removeEventListener: (tipo, f) => { assert.equal(tipo, 'storage'); ouvintes.delete(f); },
  };
  const vistos = [];
  const parar = n.ouvirLateral(janela, (estado) => vistos.push(estado));
  const disparar = (key, newValue) => { for (const f of ouvintes) f({ key, newValue }); };
  disparar('ov-lateral', 'recolhida');
  disparar('ov-tema', 'claro');
  disparar('ov-lateral', 'aberta');
  disparar('ov-lateral', null);
  disparar('ov-lateral', 'lixo');
  disparar(null, null);
  assert.deepEqual(vistos, ['recolhida', 'aberta', 'aberta', 'aberta', 'aberta']);
  parar();
  assert.equal(ouvintes.size, 0);
  disparar('ov-lateral', 'recolhida');
  assert.equal(vistos.length, 5);
  assert.doesNotThrow(() => n.ouvirLateral(null, () => {})());
});

test('núcleo: sem DOM e sem pacote (só o que vem de quem chama)', () => {
  const js = semComentario(ler('js/lateral-nucleo.js'));
  assert.doesNotMatch(js, /\bdocument\b|\bwindow\.|\blocalStorage\b|\bimport\b/);
});

// ---------- Exemplo, pacote e README ----------

// Desde a v3.19.0 (C26, L8) a conta saiu do rodapé: o botão é o último item.
test('exemplo: o botão nas duas cascas (escuro e claro), no fim do rodapé, aberto, com o script do núcleo', () => {
  // Sem o fim da tag: a v3.15.1 acrescenta o texto depois do ícone.
  const botao = '<button class="ov-lateral-alternar" type="button" aria-expanded="true" aria-label="Recolher barra lateral" title="Recolher barra lateral"><i data-icone="panel-left-close"></i>';
  for (const tema of ['escuro', 'claro']) {
    const i = exemplo.indexOf(`<div class="moldura" data-theme="${tema}">`);
    assert.ok(i > 0, tema);
    const lateral = exemplo.slice(i, exemplo.indexOf('</nav>', i));
    const rodape = lateral.slice(lateral.indexOf('<div class="ov-lateral-rodape">'));
    assert.ok(rodape.includes(botao), tema);
    assert.doesNotMatch(rodape, /class="ov-conta"/, tema);
  }
  assert.match(exemplo, /'panel-left-close': '<rect width="18" height="18" x="3" y="3" rx="2"\/><path d="M9 3v18"\/><path d="m16 15-3-3 3-3"\/>'/);
  assert.match(exemplo, /'panel-left-open': '<rect width="18" height="18" x="3" y="3" rx="2"\/><path d="M9 3v18"\/><path d="m14 9 3 3-3 3"\/>'/);
  assert.match(exemplo, /import\('\.\.\/js\/lateral-nucleo\.js'\)/);
  assert.match(exemplo, /alternarLateral\(armazenamento, atual\)/);
  assert.match(exemplo, /ouvirLateral\(window, mostrar\)/);
});

test('package.json: o núcleo em exports; README com a regra', () => {
  assert.deepEqual(pacote.exports['./js/lateral-nucleo.js'], { types: './js/lateral-nucleo.d.ts', default: './js/lateral-nucleo.js' });
  assert.match(leiame, /ov-lateral-alternar/);
  assert.match(leiame, /data-lateral="recolhida"/);
  assert.match(leiame, /js\/lateral-nucleo\.js/);
});

// A divisão do CSS desde a v3.5.0: janelas.css importável sozinho, como a
// casca, e o que saiu do onevessel.css morando lá, com os mesmos valores. Na
// v3.6.0, o .ov-estado foi para a casca do mesmo jeito (V4); na v3.7.0, as
// telas foram para o telas.css (D1 da F5).
// `test/fixtures/onevessel-v3.4.0.css`, `onevessel-v3.5.0.css` e
// `onevessel-v3.6.0.css` são o onevessel.css dessas tags, fixos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { problemasDeBase, regras, semComentario, seletores } from '../scripts/css-regras.mjs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const casca = ler('css/casca.css');
const janelas = ler('css/janelas.css');
const telas = ler('css/telas.css');
const onevessel = ler('css/onevessel.css');
const antes = ler('test/fixtures/onevessel-v3.4.0.css');
const daV350 = ler('test/fixtures/onevessel-v3.5.0.css');
const daV360 = ler('test/fixtures/onevessel-v3.6.0.css');

// O que saiu do onevessel.css na v3.5.0.
const MOVIDOS = [
  '.ov-btn-perigo',
  '.ov-painel', '.ov-painel-cab', '.ov-painel-corpo',
  '.ov-dados', '.ov-dados dt', '.ov-dados dd',
  '.ov-abas-internas', '.ov-abas-internas button', '.ov-abas-internas button[aria-selected="true"]',
  '.ov-dialogo', '.ov-dialogo-acoes', '.ov-folha-rodape',
  '.ov-toasts', '.ov-toast', '.ov-toast-linha', '.ov-toast-linha > svg', '.ov-toast-acao',
  '.ov-toast-tempo', '.ov-toast-tempo > span',
  '@keyframes ovEscala',
];

// O que saiu do onevessel.css na v3.6.0 para o casca.css (V4).
const PARA_A_CASCA = [
  '.ov-estado', '.ov-estado::before',
  '.ov-estado[data-tom="sucesso"]', '.ov-estado[data-tom="atencao"]', '.ov-estado[data-tom="erro"]', '.ov-estado[data-tom="info"]',
];

// Classes que nasceram no janelas.css (fora do diff de movidos).
const NOVOS = [
  '.ov-dialogo-titulo', '.ov-dialogo-frase', '.ov-dialogo-corpo', '.ov-dialogo[data-tamanho="formulario"]',
  '.ov-toasts[data-com-barra]', '.ov-toast[data-tipo="erro"] .ov-toast-tempo', '@keyframes ovTempo', '@keyframes ovDesce',
  '.ov-painel[data-abas]', '.ov-painel[data-altura="cheia"]',
  '.ov-folha-corpo', '.ov-folha[data-altura="rapida"]', '.ov-folha[data-altura="detalhe"]', '.ov-folha[data-altura="cheia"]',
];

// Declarações de uma regra fora de @media, normalizadas.
const declaracoes = (css, seletor) => {
  const r = regras(css).find((x) => !x.media && x.seletores.includes(seletor));
  return r ? r.corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean) : null;
};

test('janelas.css: sem html, body, a, button, fonte na raiz nem impressão', () => {
  assert.deepEqual(problemasDeBase('janelas.css', janelas), []);
});

test('a conferência de base pega o que deve pegar', () => {
  const ruim = 'html { font-size: 14px } body { margin: 0 } a:hover { color: red } button { font: inherit } @media print { .x { color: red } } @page { margin: 0 }';
  assert.deepEqual(problemasDeBase('x.css', ruim), [
    'x.css tem @media print',
    'x.css tem @page',
    'x.css tem regra de base: html',
    'x.css define fonte fora de classe: html',
    'x.css tem regra de base: body',
    'x.css tem regra de elemento solto: a:hover',
    'x.css tem regra de elemento solto: button',
    'x.css define fonte fora de classe: button',
  ]);
  assert.deepEqual(problemasDeBase('x.css', '.ov-abas-internas button { height: 36px } .ov-x a { color: red }'), []);
  assert.deepEqual(problemasDeBase('x.css', '*, *::before { box-sizing: border-box } .ov-x > * { margin: 0 }'), [
    'x.css tem regra universal: *',
    'x.css tem regra universal: *::before',
  ]);
});

test('onevessel.css importa janelas.css e não repete nenhum seletor dele', () => {
  assert.match(semComentario(onevessel), /@import\s+url\(["']\.\/janelas\.css["']\)/);
  const deOnevessel = seletores(onevessel);
  assert.deepEqual([...seletores(janelas)].filter((s) => deOnevessel.has(s)), []);
});

test('o que saiu do onevessel.css na v3.5.0 é exatamente a lista de movidos', () => {
  const depois = seletores(daV350);
  assert.deepEqual([...seletores(antes)].filter((s) => !depois.has(s)), MOVIDOS);
});

test('o que saiu do onevessel.css na v3.6.0 é exatamente o .ov-estado, e nada entrou', () => {
  const depois = seletores(daV360);
  const v350 = seletores(daV350);
  assert.deepEqual([...v350].filter((s) => !depois.has(s)), PARA_A_CASCA);
  assert.deepEqual([...depois].filter((s) => !v350.has(s)), []);
});

test('o .ov-estado mora no casca.css com as declarações da v3.5.0, ao lado da .ov-etiqueta', () => {
  const deCasca = seletores(casca);
  for (const s of PARA_A_CASCA) {
    assert.ok(deCasca.has(s), `falta no casca.css: ${s}`);
    assert.deepEqual(declaracoes(casca, s), declaracoes(daV350, s), `${s} mudou`);
  }
  const ordem = regras(casca).filter((r) => !r.media).flatMap((r) => r.seletores);
  const etiqueta = ordem.indexOf('.ov-etiqueta');
  assert.deepEqual(ordem.slice(etiqueta + 1, etiqueta + 1 + PARA_A_CASCA.length), PARA_A_CASCA);
});

test('casca.css: sem base, e o onevessel.css continua entregando o .ov-estado pelo import', () => {
  assert.deepEqual(problemasDeBase('casca.css', casca), []);
  assert.match(semComentario(onevessel), /@import\s+url\(["']\.\/casca\.css["']\)/);
  const deOnevessel = seletores(onevessel);
  assert.deepEqual([...seletores(casca)].filter((s) => deOnevessel.has(s)), []);
});

test('todo seletor movido existe no janelas.css, com as declarações da v3.4.0', () => {
  const deJanelas = seletores(janelas);
  for (const s of MOVIDOS) {
    assert.ok(deJanelas.has(s), `falta no janelas.css: ${s}`);
    if (s.startsWith('@')) continue;
    const novas = declaracoes(janelas, s);
    for (const d of declaracoes(antes, s)) assert.ok(novas.includes(d), `${s} perdeu ou mudou: ${d}`);
  }
});

test('as classes novas existem no janelas.css', () => {
  const deJanelas = seletores(janelas);
  for (const s of NOVOS) assert.ok(deJanelas.has(s), `falta no janelas.css: ${s}`);
});

test('casca.css e janelas.css têm prefers-reduced-motion', () => {
  for (const [nome, css] of [['casca.css', casca], ['janelas.css', janelas]]) {
    assert.ok(regras(css).some((r) => /prefers-reduced-motion:\s*reduce/.test(r.media)), nome);
  }
});

test('movimento reduzido: entradas só com opacidade, a barra de tempo continua', () => {
  const reduzido = regras(janelas).filter((r) => /prefers-reduced-motion/.test(r.media));
  const entrada = reduzido.find((r) => r.seletores.includes('.ov-toast'));
  assert.match(entrada.corpo, /animation-name:\s*ovFade/);
  const barra = reduzido.find((r) => r.seletores.includes('.ov-toast-tempo > span'));
  assert.match(barra.corpo, /animation-duration:\s*var\(--ov-toast-duracao/);
  assert.doesNotMatch(barra.corpo, /animation-name|animation:\s*none/);
});

test('toast no celular: abaixo da barra superior, nunca a 12px do topo da tela', () => {
  const celular = regras(janelas).find((r) => /max-width:\s*767px/.test(r.media) && r.seletores.includes('.ov-toasts'));
  assert.match(celular.corpo, /top:\s*calc\(var\(--ov-barra-superior\) \+ env\(safe-area-inset-top, 0px\) \+ 12px\)/);
});

// ---------- v3.7.0: telas.css (D1 da F5) ----------

// O que saiu do onevessel.css na v3.7.0, na ordem em que estava.
const PARA_AS_TELAS = [
  '.ov-titulo-1', '.ov-titulo-2', '.ov-titulo-3', '.ov-legenda', '.ov-rotulo',
  '.ov-check', '.ov-segmentado', '.ov-segmentado button', '.ov-segmentado button[aria-pressed="true"]',
  '.ov-visoes', '.ov-visao', '.ov-visao[aria-selected="true"]', '.ov-visao .ov-tnum',
  '.ov-chip-filtro', '.ov-chip-filtro .campo', '.ov-chip-filtro button',
  '.ov-contador-destaque', '.ov-progresso', '.ov-progresso > span',
  '.ov-cartao', '[data-theme="claro"] .ov-cartao',
  '.ov-indicador', 'a.ov-indicador:hover', '.ov-indicador[data-alerta="true"]',
  '.ov-indicador-rotulo', '.ov-indicador-alerta', '.ov-indicador-valor', '.ov-indicador-nota',
  '.ov-pendencias-cab', '.ov-pendencia',
  '.ov-tabela', '.ov-tabela th', '.ov-tabela td', '.ov-tabela tbody tr:hover', '.ov-tabela tbody tr[aria-selected="true"]',
  '.ov-tabela .num', '.ov-tabela .nome', '.ov-tabela .meta',
  '.ov-tabela[data-densidade="compacta"] td', '.ov-tabela[data-densidade="conforto"] td',
  '.ov-acoes-massa',
];

// O que nasceu no telas.css.
const NOVOS_TELAS = [
  '.ov-indicadores',
  '.ov-pendencias', '.ov-pendencias-lista', '.ov-pendencias a.ov-pendencia', '.ov-pendencias a.ov-pendencia:hover',
  '.ov-pendencias-ver-tudo', '.ov-pendencias-ver-tudo:hover', '.ov-pendencias-vazio',
  '.ov-acoes-massa[data-flutuante]', '@keyframes ovSobeCentro',
  '.ov-esqueleto', '.ov-esqueleto-texto', '.ov-esqueleto-linha', '@keyframes ovPulso',
];

// Declarações de uma regra num @media (cabeça exata), normalizadas.
const declaracoesEm = (css, media, seletor) => {
  const r = regras(css).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? r.corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean) : null;
};
const corpoDe = (css, media, seletor) => (declaracoesEm(css, media, seletor) ?? []).join('; ');
const CELULAR = '@media (max-width: 767px)';
const TABLET = '@media (max-width: 1023px)';
const REDUZIDO = '@media (prefers-reduced-motion: reduce)';
const keyframes = (css, nome) => {
  const texto = semComentario(css);
  const i = texto.indexOf(`@keyframes ${nome}`);
  return i === -1 ? null : texto.slice(i, texto.indexOf('} }', i) + 3);
};

test('telas.css: sem body, html, *, a, button nem @media print', () => {
  assert.deepEqual(problemasDeBase('telas.css', telas), []);
  // A mesma régua, à parte, para o que o pedido da v3.7.0 nomeia.
  const texto = semComentario(telas);
  assert.doesNotMatch(texto, /@media\s+print/);
  assert.doesNotMatch(texto, /!important/, 'o movimento reduzido global com !important é da base');
  for (const { seletores: ss } of regras(telas)) {
    for (const s of ss) {
      if (s.startsWith('@')) continue;
      assert.doesNotMatch(s, /(^|[\s>+~(,])(html|body)\b|^\*/, s);
      if (!/[.[]/.test(s)) assert.doesNotMatch(s, /(^|[\s>+~])(a|button)(?![\w-])/, s);
    }
  }
});

test('onevessel.css importa telas.css depois de janelas.css e não repete nenhum seletor dele', () => {
  const texto = semComentario(onevessel);
  assert.match(texto, /@import\s+url\(["']\.\/janelas\.css["']\);\s*@import\s+url\(["']\.\/telas\.css["']\)/);
  const deOnevessel = seletores(onevessel);
  assert.deepEqual([...seletores(telas)].filter((s) => deOnevessel.has(s)), []);
  for (const outro of [casca, janelas]) {
    const deOutro = seletores(outro);
    assert.deepEqual([...seletores(telas)].filter((s) => deOutro.has(s)), []);
  }
});

test('o que saiu do onevessel.css na v3.7.0 é exatamente a lista das telas, e nada entrou', () => {
  const depois = seletores(onevessel);
  const v360 = seletores(daV360);
  assert.deepEqual([...v360].filter((s) => !depois.has(s)), PARA_AS_TELAS);
  assert.deepEqual([...depois].filter((s) => !v360.has(s)), []);
});

test('todo seletor movido mora no telas.css com as declarações da v3.6.0, na mesma ordem', () => {
  const deTelas = seletores(telas);
  for (const s of PARA_AS_TELAS) {
    assert.ok(deTelas.has(s), `falta no telas.css: ${s}`);
    assert.deepEqual(declaracoes(telas, s), declaracoes(daV360, s), `${s} mudou`);
  }
  const ordem = regras(telas).filter((r) => !r.media).flatMap((r) => r.seletores).filter((s) => PARA_AS_TELAS.includes(s));
  const original = regras(daV360).filter((r) => !r.media).flatMap((r) => r.seletores).filter((s) => PARA_AS_TELAS.includes(s));
  assert.deepEqual(ordem, original);
});

test('minor: toda regra do onevessel.css da v3.6.0 continua com os mesmos valores no pacote', () => {
  // A soma (onevessel.css + o que ele importa) entrega, para cada seletor e
  // cada @media da v3.6.0, as mesmas declarações.
  const soma = [onevessel, casca, janelas, telas].join('\n');
  for (const r of regras(daV360)) {
    for (const s of r.seletores) {
      if (s.startsWith('@')) { assert.ok(seletores(soma).has(s), s); continue; }
      assert.deepEqual(declaracoesEm(soma, r.media, s), declaracoesEm(daV360, r.media, s), `${r.media} ${s}`);
    }
  }
});

test('as classes novas existem no telas.css', () => {
  const deTelas = seletores(telas);
  for (const s of NOVOS_TELAS) assert.ok(deTelas.has(s), `falta no telas.css: ${s}`);
});

test('indicadores: 4 colunas, 2 de 768 a 1023px, 1 no celular', () => {
  assert.match(corpoDe(telas, '', '.ov-indicadores'), /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(corpoDe(telas, TABLET, '.ov-indicadores'), /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(corpoDe(telas, CELULAR, '.ov-indicadores'), /grid-template-columns: minmax\(0, 1fr\)/);
});

test('Precisa de você: "Ver tudo" em ov-acao-texto e o vazio em legenda', () => {
  assert.match(corpoDe(telas, '', '.ov-pendencias-ver-tudo'), /color: var\(--ov-acao-texto\)/);
  const vazio = corpoDe(telas, '', '.ov-pendencias-vazio');
  assert.match(vazio, /font: var\(--ov-fonte-legenda\)/);
  assert.match(vazio, /color: var\(--ov-texto-terciario\)/);
  assert.match(corpoDe(telas, '', '.ov-pendencias a.ov-pendencia:hover'), /background: var\(--ov-linha-hover\)/);
});

test('tabela abaixo de 768px: lista de linhas de 64px, nome em 16px, metadados em legenda, divisor ov-borda', () => {
  const linha = corpoDe(telas, CELULAR, '.ov-tabela:has(td.nome) tbody tr');
  assert.match(linha, /min-height: 64px/);
  assert.match(linha, /border-bottom: 1px solid var\(--ov-borda\)/);
  assert.match(linha, /font: var\(--ov-fonte-legenda\)/);
  assert.match(linha, /color: var\(--ov-texto-terciario\)/);
  const nome = corpoDe(telas, CELULAR, '.ov-tabela:has(td.nome) td.nome');
  assert.match(nome, /font: var\(--ov-fonte-corpo-grande\)/); // 16px
  assert.match(nome, /color: var\(--ov-texto\)/);
  assert.match(corpoDe(telas, CELULAR, '.ov-tabela:has(td.nome) thead'), /position: absolute; width: 1px; height: 1px; overflow: hidden/);
  // Só as tabelas com td.nome: a .ov-tabela de hoje, sem .nome, não muda.
  for (const r of regras(telas).filter((x) => x.media === CELULAR)) {
    for (const s of r.seletores) if (/\.ov-tabela/.test(s)) assert.match(s, /^\.ov-tabela:has\(td\.nome\)/, s);
  }
});

test('barra de massa flutuante: fixa, centrada, 24px acima do rodapé, ov-z-flutuante, ov-fundo-barra sem desfoque', () => {
  const barra = corpoDe(telas, '', '.ov-acoes-massa[data-flutuante]');
  assert.match(barra, /position: fixed/);
  assert.match(barra, /left: 50%/);
  assert.match(barra, /transform: translateX\(-50%\)/);
  assert.match(barra, /bottom: calc\(24px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(barra, /z-index: var\(--ov-z-flutuante\)/);
  assert.match(barra, /background: var\(--ov-fundo-barra\)/);
  assert.match(barra, /animation: ovSobeCentro \.18s/);
  assert.doesNotMatch(semComentario(telas), /backdrop-filter|blur\(/);
  assert.match(keyframes(telas, 'ovSobeCentro'), /from \{ opacity: 0; transform: translate\(-50%, 12px\); \}/);
  const celular = corpoDe(telas, CELULAR, '.ov-casca:has(.ov-barra-inferior) .ov-acoes-massa[data-flutuante]');
  assert.match(celular, /bottom: calc\(var\(--ov-barra-inferior\) \+ env\(safe-area-inset-bottom, 0px\) \+ 24px\)/);
  // A caixa da v3.6.0 não muda: a posição só vem com data-flutuante.
  assert.deepEqual(declaracoes(telas, '.ov-acoes-massa'), declaracoes(daV360, '.ov-acoes-massa'));
});

test('movimento reduzido: a barra só aparece, o esqueleto não anima', () => {
  assert.match(corpoDe(telas, REDUZIDO, '.ov-acoes-massa[data-flutuante]'), /animation-name: ovFade/);
  assert.ok(seletores(casca).has('@keyframes ovFade'), 'o ovFade é da casca');
  assert.match(corpoDe(telas, REDUZIDO, '.ov-esqueleto'), /animation: none/);
  assert.match(corpoDe(telas, REDUZIDO, '.ov-esqueleto-texto'), /animation: none/);
});

test('esqueleto: sem spinner, animação só de opacidade', () => {
  const pulso = keyframes(telas, 'ovPulso');
  assert.ok(pulso);
  const propriedades = [...pulso.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(propriedades)], ['opacity']);
  assert.doesNotMatch(semComentario(telas), /rotate|spin|giro/i);
  assert.match(corpoDe(telas, '', '.ov-esqueleto-linha'), /height: var\(--ov-linha-tabela\)/);
  assert.match(corpoDe(telas, CELULAR, '.ov-esqueleto-linha'), /min-height: 64px/);
});

// ---------- v3.8.0: miolo do item e o cartão que estica (V1–V9) ----------

// `test/fixtures/telas-v3.7.0.css` é o telas.css da tag v3.7.0, fixo.
const daV370 = ler('test/fixtures/telas-v3.7.0.css');

// O miolo do item do "Precisa de você" (V1–V7) e o cartão que estica na
// linha da grade em ul > li > a (V9).
const MIOLO = ['.ov-pendencia-estado', '.ov-pendencia-texto', '.ov-pendencia-titulo', '.ov-pendencia-id', '.ov-pendencia-contexto', '.ov-pendencia-seta'];
const ESTICA = ['.ov-indicadores > li', '.ov-indicadores > li > .ov-indicador'];

// A lista de box-sizing do topo (um seletor só, o :where inteiro): ganhou os
// seis nomes do miolo. É a única regra da v3.7.0 que muda; as do V9 são
// regras novas, e nenhuma regra da v3.7.0 mudou por causa dele.
const ehListaDeCaixa = (s) => s.startsWith(':where(.ov-cartao');
const nomesDaLista = (css) => {
  const s = [...seletores(css)].find(ehListaDeCaixa);
  return s.slice(':where('.length, -1).split(',').map((n) => n.trim());
};

test('minor: toda regra do telas.css da v3.7.0 continua com as mesmas declarações, fora a lista de box-sizing', () => {
  const deTelas = seletores(telas);
  for (const r of regras(daV370)) {
    for (const s of r.seletores) {
      if (ehListaDeCaixa(s)) continue;
      assert.ok(deTelas.has(s), `sumiu do telas.css: ${r.media} ${s}`);
      if (s.startsWith('@')) { assert.equal(keyframes(telas, s.slice(11)), keyframes(daV370, s.slice(11)), s); continue; }
      assert.deepEqual(declaracoesEm(telas, r.media, s), declaracoesEm(daV370, r.media, s), `${r.media} ${s}`);
    }
  }
  // A lista de box-sizing: a da v3.7.0, na mesma ordem, mais os seis do miolo.
  const antes = nomesDaLista(daV370);
  const depois = nomesDaLista(telas);
  assert.deepEqual(depois.filter((n) => !antes.includes(n)), MIOLO);
  assert.deepEqual(depois.filter((n) => antes.includes(n)), antes);
});

test('o que entrou no telas.css na v3.8.0 é exatamente o miolo e o cartão que estica', () => {
  const v370 = seletores(daV370);
  const novos = [...seletores(telas)].filter((s) => !v370.has(s) && !ehListaDeCaixa(s));
  assert.deepEqual(novos, [...ESTICA, ...MIOLO]);
  for (const s of [...MIOLO, ...ESTICA]) assert.ok(regras(telas).some((r) => !r.media && r.seletores.includes(s)), `fora de @media: ${s}`);
});

test('miolo do item: coluna de 88px, elipse, 600, mono 12/16 e terciário no identificador, no contexto e na seta', () => {
  assert.deepEqual(declaracoes(telas, '.ov-pendencia-estado'), ['flex: 0 0 88px']);
  assert.deepEqual(declaracoes(telas, '.ov-pendencia-texto'), ['display: flex', 'flex: 1 1 auto', 'flex-direction: column', 'min-width: 0']);
  assert.deepEqual(declaracoes(telas, '.ov-pendencia-titulo'), ['overflow: hidden', 'text-overflow: ellipsis', 'white-space: nowrap', 'font-weight: 600']);
  assert.deepEqual(declaracoes(telas, '.ov-pendencia-id'), [
    'margin-right: 8px', 'font-weight: 400', 'font-size: 12px', 'line-height: 16px', 'font-family: var(--font-mono)', 'color: var(--ov-texto-terciario)',
  ]);
  assert.deepEqual(declaracoes(telas, '.ov-pendencia-contexto'), ['font-size: 12px', 'line-height: 16px', 'color: var(--ov-texto-terciario)']);
  assert.deepEqual(declaracoes(telas, '.ov-pendencia-seta'), ['flex: 0 0 auto', 'color: var(--ov-texto-terciario)']);
  // A família mono é o token do pacote, o mesmo do .ov-tecla.
  assert.match(tokens, /--font-mono:\s*ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;/);
});

test('o realce e o anel de foco do item são só do a.ov-pendencia; o item sem link não ganha CSS', () => {
  for (const { seletores: ss } of regras(telas)) {
    for (const s of ss) {
      if (!/\.ov-pendencia(?![\w-])/.test(s)) continue;
      assert.doesNotMatch(s, /div\.ov-pendencia/, s);
      if (/:hover|:focus/.test(s)) assert.match(s, /\ba\.ov-pendencia:(hover|focus-visible)$/, s);
    }
  }
  assert.match(corpoDe(telas, '', '.ov-pendencias a.ov-pendencia:hover'), /background: var\(--ov-linha-hover\)/);
  // A linha (.ov-pendencia) não tem cor de fundo nem cursor: o div fica parado.
  assert.doesNotMatch(corpoDe(telas, '', '.ov-pendencia'), /background|cursor/);
});

test('indicadores: em ul o li é flex e o cartão ocupa a altura dele; a grade continua 4/2/1', () => {
  assert.deepEqual(declaracoes(telas, '.ov-indicadores > li'), ['display: flex', 'min-width: 0']);
  assert.deepEqual(declaracoes(telas, '.ov-indicadores > li > .ov-indicador'), ['flex: 1 1 auto', 'min-width: 0']);
  for (const media of ['', TABLET, CELULAR]) assert.equal(corpoDe(telas, media, '.ov-indicadores'), corpoDe(daV370, media, '.ov-indicadores'), media);
  // Nenhuma regra nova num @media: a 360 e 375px nada muda.
  const novas = regras(telas).filter((r) => r.seletores.some((s) => ESTICA.includes(s) || MIOLO.includes(s)));
  assert.ok(novas.every((r) => !r.media));
});

// ---------- Contraste dos estados novos, pelos tokens ----------

// Os dois temas do tokens.css: o claro herda da raiz o que não redefine.
const tokens = ler('css/tokens.css');
const bloco = (cabeca) => {
  const i = tokens.indexOf(cabeca);
  const corpo = tokens.slice(tokens.indexOf('{', i) + 1, tokens.indexOf('}', i));
  return Object.fromEntries([...corpo.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};
const escuro = bloco(':root,\n[data-theme="escuro"]');
const TEMAS = { escuro, claro: { ...escuro, ...bloco('[data-theme="claro"] {') } };

const cor = (v) => {
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).concat(1);
  m = v.match(/^rgba\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/);
  if (m) return m.slice(1).map(Number);
  return null;
};
const sobre = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
const luminancia = (c) => {
  const [r, g, b] = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

// Fundo `camada` (pode ser translúcida) sobre cada `base` opaca.
const fundos = (t, camadas, bases) => bases.flatMap((b) => camadas.map((c) => (c ? sobre(cor(t[c]), cor(t[b])) : cor(t[b]))));

for (const [tema, t] of Object.entries(TEMAS)) {
  test(`contraste no tema ${tema}: Precisa de você, lista do celular e barra de massa`, () => {
    const confere = (texto, bgs, minimo, rotulo) => {
      for (const bg of bgs) {
        const r = contraste(cor(t[texto]), bg);
        assert.ok(r >= minimo, `${tema}: ${rotulo} (${texto}) com ${r.toFixed(2)}:1, menos de ${minimo}:1`);
      }
    };
    const cartao = fundos(t, [null], ['ov-superficie']);
    // "Ver tudo" em repouso e sob o mouse; o vazio em legenda.
    confere('ov-acao-texto', cartao, 4.5, '"Ver tudo"');
    confere('ov-acao-hover', cartao, 4.5, '"Ver tudo" sob o mouse');
    confere('ov-texto-terciario', cartao, 4.5, '"Nada pendente com você."');
    // Item-link sob o mouse.
    const itemHover = fundos(t, ['ov-linha-hover'], ['ov-superficie']);
    for (const texto of ['ov-texto', 'ov-texto-secundario', 'ov-texto-terciario']) confere(texto, itemHover, 4.5, 'pendência sob o mouse');
    // Lista do celular: no cartão ou direto na tela, em repouso, sob o dedo e selecionada.
    const linhas = fundos(t, [null, 'ov-linha-hover', 'ov-acao-suave'], ['ov-superficie', 'ov-fundo']);
    confere('ov-texto', linhas, 4.5, 'nome na lista');
    confere('ov-texto-terciario', linhas, 4.5, 'metadados na lista');
    // Barra de massa: ov-fundo-barra é translúcido; vale sobre qualquer cor opaca do tema.
    const opacas = Object.keys(t).filter((k) => k.startsWith('ov-') && !k.startsWith('ov-toast') && cor(t[k])?.[3] === 1);
    const barra = fundos(t, ['ov-fundo-barra'], opacas);
    confere('ov-texto', barra, 4.5, 'texto da barra de massa');
    confere('ov-texto-secundario', barra, 4.5, 'botão fantasma na barra de massa');
    // Anel de foco dos links novos.
    confere('ov-foco', [...cartao, ...itemHover], 3, 'anel de foco');
  });
}

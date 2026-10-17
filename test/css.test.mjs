// A divisão do CSS desde a v3.5.0: janelas.css importável sozinho, como a
// casca, e o que saiu do onevessel.css morando lá, com os mesmos valores. Na
// v3.6.0, o .ov-estado foi para a casca do mesmo jeito (V4).
// `test/fixtures/onevessel-v3.4.0.css` e `onevessel-v3.5.0.css` são o
// onevessel.css dessas tags, fixos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { problemasDeBase, regras, semComentario, seletores } from '../scripts/css-regras.mjs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const casca = ler('css/casca.css');
const janelas = ler('css/janelas.css');
const onevessel = ler('css/onevessel.css');
const antes = ler('test/fixtures/onevessel-v3.4.0.css');
const daV350 = ler('test/fixtures/onevessel-v3.5.0.css');

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
  const depois = seletores(onevessel);
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

// v3.13.0 (V17, conflitos das adoções da v3.12.0, decididos em 22/10): o
// campo de linha (.ov-campo[data-densidade="linha"], 36px e 14px no
// computador, a exceção do livro), o textarea.ov-campo com a altura pelo
// rows, o ícone do erro de campo e a barra de ações em massa contendo os
// botões de 48px no toque.
// `test/fixtures/*-v3.12.0.css` são os CSS da tag v3.12.0, fixos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import { problemasDeBase, regras, semComentario, seletores } from '../scripts/css-regras.mjs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const fixo = (nome) => ler(`test/fixtures/${nome}-v3.12.0.css`);
// casca, relatorio, previa e impressao não mudam desde a v3.11.0.
const fixoDe = (nome) => (['controles', 'onevessel', 'telas', 'janelas'].includes(nome) ? fixo(nome) : ler(`test/fixtures/${nome}-v3.11.0.css`));
// A casca muda na v3.15.0: a da v3.13.0 é a fixture da v3.14.0 (a v3.14.0
// não mexeu em CSS); os outros não mudaram desde a v3.13.0.
const css = (nome) => (nome === 'casca' ? ler('test/fixtures/casca-v3.14.0.css') : ler(`css/${nome}.css`));
const controles = css('controles');
const telas = css('telas');
const tokens = css('tokens');
const exemplo = ler('exemplo/index.html');

const TOQUE = '@media (pointer: coarse)';
const LINHA = '.ov-campo[data-densidade="linha"]';
const TEXTAREA_LINHA = 'textarea.ov-campo[data-densidade="linha"]';

// Declarações de uma regra num @media (cabeça exata), normalizadas.
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? r.corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean) : null;
};
const corpo = (texto, seletor, media = '') => (declaracoesEm(texto, media, seletor) ?? []).join('; ');
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- minor: toda regra da v3.12.0 igual, fora as alteradas pelo nome ----------

const NOMES = ['controles', 'onevessel', 'telas', 'janelas', 'casca', 'relatorio', 'previa', 'impressao'];

// As regras da v3.12.0 que mudaram, pelo nome (media|seletor). `null`: saiu.
// Nenhuma mudou: a barra de massa no toque é regra nova, num @media que ela
// não tinha; a .ov-acoes-massa de 48px fica como está no computador.
const ALTERADAS = {};

// O que nasceu, por arquivo, na ordem do arquivo. A barra de ações em massa
// vai pelo nome: no toque, 50px (os botões de 48 mais a borda).
const NOVAS = {
  controles: [
    '|textarea.ov-campo', `|${LINHA}`, `|${TEXTAREA_LINHA}`,
    `${TOQUE}|${LINHA}`, `${TOQUE}|${TEXTAREA_LINHA}`,
    '|.ov-erro-campo > svg',
  ],
  telas: [`${TOQUE}|.ov-acoes-massa`],
};

for (const nome of NOMES) {
  test(`minor: toda regra do ${nome}.css da v3.12.0 igual, fora as alteradas pelo nome`, () => {
    const antes = fixoDe(nome);
    const agora = css(nome);
    for (const r of regras(antes)) {
      for (const s of r.seletores) {
        const chave = `${r.media}|${s}`;
        if (s.startsWith('@')) { assert.ok(seletores(agora).has(s), `sumiu: ${s}`); continue; }
        const velha = declaracoesEm(antes, r.media, s);
        const nova = declaracoesEm(agora, r.media, s);
        if (!(chave in ALTERADAS)) assert.deepEqual(nova, velha, chave);
        else if (ALTERADAS[chave] === null) assert.equal(nova, null, `devia ter saído: ${chave}`);
        else assert.notDeepEqual(nova, velha, `está na lista e não mudou: ${chave}`);
      }
    }
  });

  test(`${nome}.css: o que nasceu na v3.13.0 é exatamente a lista`, () => {
    const velhas = new Set(chaves(fixoDe(nome)));
    assert.deepEqual(chaves(css(nome)).filter((c) => !velhas.has(c)), NOVAS[nome] ?? []);
  });
}

// ---------- Barra de ações em massa no toque ----------

test('barra de massa: 48px no computador; no toque, 50 com a borda de 1px dentro, e os botões de 48 cabem', () => {
  const base = corpo(telas, '.ov-acoes-massa');
  assert.match(base, /height: 48px/);
  assert.match(base, /border: 1px solid/);
  // A borda fica dentro da altura (border-box): o miolo é a altura menos 2.
  const caixa = regras(telas).find((r) => !r.media && r.seletores.some((s) => s.startsWith(':where(') && s.includes('.ov-acoes-massa')));
  assert.match(caixa.corpo, /box-sizing: border-box/);
  // No toque, o miolo é o botão de toque, 48: a altura soma as duas bordas.
  assert.equal(corpo(telas, '.ov-acoes-massa', TOQUE), 'height: calc(var(--ov-altura-toque) + 2px)');
  assert.equal(corpo(controles, '.ov-btn', TOQUE), 'height: var(--ov-altura-toque)');
  assert.match(tokens, /--ov-altura-toque:\s*48px;/);
  // A regra do toque vem depois da caixa, com a mesma força.
  const ordem = regras(telas).map((r) => `${r.media}|${r.seletores.join(', ')}`);
  assert.ok(ordem.indexOf(`${TOQUE}|.ov-acoes-massa`) > ordem.indexOf('|.ov-acoes-massa'));
});

// ---------- Campo de linha ----------

test('campo de linha: 36px e 14/20 no computador; fundo, borda e anel do .ov-campo, sem declarar outros', () => {
  assert.equal(corpo(controles, LINHA), 'height: var(--ov-altura-controle); font-size: 14px; line-height: 20px; vertical-align: middle');
  assert.match(tokens, /--ov-altura-controle:\s*36px;/);
  // Fundo, borda, raio, padding e o anel vêm do .ov-campo: o modificador não os toca.
  for (const [ss, c] of regras(controles).map((r) => [r.seletores, r.corpo])) {
    if (ss.some((s) => s.includes('data-densidade'))) assert.doesNotMatch(c, /background|border|outline|box-shadow|color/, ss.join(', '));
  }
  assert.equal(corpo(controles, '.ov-campo:focus-visible'), 'outline: 2px solid var(--ov-foco); outline-offset: 2px');
  // Mais forte que o .ov-campo (atributo) e depois dele.
  const ordem = regras(controles).filter((r) => !r.media).flatMap((r) => r.seletores);
  assert.ok(ordem.indexOf(LINHA) > ordem.indexOf('.ov-campo'));
});

test('campo de linha no toque: o .ov-campo de 44 e 16/24 (o campo não vai a 48; abaixo de 16 o iPhone dá zoom)', () => {
  assert.equal(corpo(controles, LINHA, TOQUE), 'height: var(--ov-altura-campo); font-size: 16px; line-height: 24px');
  assert.equal(corpo(controles, TEXTAREA_LINHA, TOQUE), 'height: auto; min-height: var(--ov-altura-campo); padding: 9px 12px');
  // No toque, o campo de linha é igual ao textarea e ao campo de formulário.
  assert.match(corpo(controles, '.ov-campo'), /font: 400 16px\/24px/);
  assert.equal(corpo(controles, TEXTAREA_LINHA, TOQUE) + '; resize: vertical', corpo(controles, 'textarea.ov-campo'));
});

// ---------- textarea ----------

test('textarea.ov-campo: altura pelo rows, mínimo de 44, padding que alinha o 16/24 ao do input, resize vertical', () => {
  assert.equal(corpo(controles, 'textarea.ov-campo'), 'height: auto; min-height: var(--ov-altura-campo); padding: 9px 12px; resize: vertical');
  // 1 de borda + 9 + 24 + 9 + 1 = 44: uma linha ocupa o mínimo, e o texto
  // começa a 10px do topo, como no input de 44 com o 24 centrado.
  const campo = Number(tokens.match(/--ov-altura-campo:\s*(\d+)px;/)[1]);
  assert.equal(1 + 9 + 24 + 9 + 1, campo);
  assert.equal(1 + 9, (campo - 24) / 2);
  // No campo de linha: 1 + 7 + 20 + 7 + 1 = 36.
  assert.equal(corpo(controles, TEXTAREA_LINHA), 'height: auto; min-height: var(--ov-altura-controle); padding: 7px 12px');
  const controle = Number(tokens.match(/--ov-altura-controle:\s*(\d+)px;/)[1]);
  assert.equal(1 + 7 + 20 + 7 + 1, controle);
  // Nenhuma regra fixa a altura do textarea (o rows do app vale).
  for (const r of regras(controles)) for (const s of r.seletores) {
    if (!s.startsWith('textarea')) continue;
    for (const d of declaracoesEm(controles, r.media, s)) if (d.startsWith('height:')) assert.equal(d, 'height: auto', `${r.media} ${s}`);
  }
});

// ---------- Erro do campo ----------

test('erro do campo: o ícone de 16px sem encolher, centrado na linha de 18', () => {
  assert.equal(corpo(controles, '.ov-erro-campo > svg'), 'flex: none; width: 16px; height: 16px; margin-top: 1px');
  assert.match(corpo(controles, '.ov-erro-campo'), /line-height: 18px/);
});

// ---------- controles.css continua importável sozinho ----------

const DOS_CONTROLES = /^(:where\(\.ov-btn, \.ov-campo-grupo, \.ov-campo\)|\.ov-btn(-[\w-]+)?|(textarea)?\.ov-campo(-grupo)?|\.ov-label|\.ov-ajuda|\.ov-erro-campo)([:[ ]|$)/;

test('controles.css: importável sozinho, só com os seletores dele', () => {
  assert.deepEqual(problemasDeBase('controles.css', controles), []);
  assert.doesNotMatch(semComentario(controles), /@import|:root|@media print|@page|prefers-reduced-motion|@keyframes/);
  for (const s of seletores(controles)) assert.match(s, DOS_CONTROLES, s);
  // O textarea só com a classe: textarea solto seria regra de base.
  for (const s of seletores(controles)) if (s.startsWith('textarea')) assert.match(s, /^textarea\.ov-campo/, s);
});

test('nenhum outline: none em CSS nenhum do pacote, sem exceção', () => {
  for (const nome of readdirSync(new URL('../css/', import.meta.url)).filter((n) => n.endsWith('.css'))) {
    for (const { seletores: ss, corpo: c, media } of regras(ler(`css/${nome}`))) {
      assert.doesNotMatch(c, /(^|;|\s)outline\s*:\s*(none|0)\s*(;|$)/, `${nome}: ${media} ${ss.join(', ')}`);
    }
  }
});

// ---------- Exemplo ----------

test('exemplo: textarea, campo de linha (input, select e textarea) e o erro com o CircleAlert, nos dois temas', () => {
  for (const tema of ['escuro', 'claro']) {
    const i = exemplo.indexOf(`<div class="controles-moldura" data-theme="${tema}">`);
    assert.ok(i > 0, tema);
    const moldura = exemplo.slice(i, exemplo.indexOf('</ul>', i));
    assert.match(moldura, /<textarea class="ov-campo" id="motivo-[a-z]+" rows="3">/, tema);
    assert.match(moldura, /<input class="ov-campo ov-tnum" data-densidade="linha"/, tema);
    assert.match(moldura, /<select class="ov-campo" data-densidade="linha"/, tema);
    assert.match(moldura, /<textarea class="ov-campo" data-densidade="linha" rows="1"/, tema);
    assert.match(moldura, /<span class="ov-erro-campo" id="imo-[a-z]+-erro"><i data-icone="circle-alert"><\/i>/, tema);
  }
  // O glifo do Lucide, desenhado com 16px e aria-hidden.
  assert.match(exemplo, /'circle-alert': '<circle cx="12" cy="12" r="10"\/>/);
  assert.match(exemplo, /width: 16, height: 16, viewBox: '0 0 24 24'.*'aria-hidden': 'true'/);
});


// v3.12.0 (V17, PV-2, PV-3, BV-4, BV-9, BV-10): botões e campo saem do
// onevessel.css para o controles.css, importável sozinho, com a régua do
// livro (botão de 48px no toque, campo com o anel único e sem halo); o
// conferir perde a exceção do outline: none; o cartão clicável e o
// indicador ganham o realce ov-linha-hover; .ov-visao e .ov-segmentado com
// 48px no toque.
// `test/fixtures/*-v3.11.0.css` são os CSS da tag v3.11.0, fixos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import { problemasDeBase, regras, semComentario, seletores } from '../scripts/css-regras.mjs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const fixo = (nome) => ler(`test/fixtures/${nome}-v3.11.0.css`);
const css = (nome) => ler(`css/${nome}.css`);
const controles = css('controles');
const onevessel = css('onevessel');
const telas = css('telas');
const janelas = css('janelas');
const tokens = css('tokens');
const pacote = JSON.parse(ler('package.json'));

const TOQUE = '@media (pointer: coarse)';

// Declarações de uma regra num @media (cabeça exata), normalizadas.
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? r.corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean) : null;
};
const corpo = (texto, seletor, media = '') => (declaracoesEm(texto, media, seletor) ?? []).join('; ');
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- minor: toda regra da v3.11.0 igual, fora as alteradas pelo nome ----------

// Cada grupo: os CSS da v3.11.0 e onde as regras moram agora. Botões e campo
// saíram do onevessel.css para o controles.css.
const GRUPOS = {
  'onevessel.css e controles.css': { antes: fixo('onevessel'), agora: onevessel + '\n' + controles },
  'telas.css': { antes: fixo('telas'), agora: telas },
  'janelas.css': { antes: fixo('janelas'), agora: janelas },
  'casca.css': { antes: fixo('casca'), agora: css('casca') },
  'relatorio.css, previa.css e impressao.css': { antes: fixo('relatorio') + fixo('previa') + fixo('impressao'), agora: css('relatorio') + css('previa') + css('impressao') },
};

// As regras da v3.11.0 que mudaram, pelo nome (media|seletor). `null`: saiu.
const ALTERADAS = {
  'onevessel.css e controles.css': {
    // Fundo ov-superficie-recuada (era ov-fundo), sem outline: none, a
    // transição só da borda (o halo saiu).
    '|.ov-campo': 'muda',
    // O halo e a borda ov-acao no foco: saiu; o foco é o anel, em :focus-visible.
    '|.ov-campo:focus': null,
    // Botão no toque: 48px (era 44, ov-altura-campo).
    [`${TOQUE}|.ov-btn`]: 'muda',
  },
  // O indicador que é link: o realce ov-linha-hover no lugar da borda forte.
  'telas.css': { '|a.ov-indicador:hover': 'muda' },
  'janelas.css': {},
  'casca.css': {},
  'relatorio.css, previa.css e impressao.css': {},
};

// O que nasceu, na ordem do arquivo.
const NOVAS = {
  'onevessel.css e controles.css': ['|:where(.ov-btn, .ov-campo-grupo, .ov-campo)', '|.ov-campo:focus-visible'],
  'telas.css': [
    `${TOQUE}|.ov-segmentado button`, `${TOQUE}|.ov-visao`,
    '|.ov-cartao:where(a, button:not(:disabled))',
    '|.ov-cartao:where(a:hover, button:hover:not(:disabled)):where(:not([aria-current="true"]))',
  ],
  'janelas.css': [],
  'casca.css': [],
  'relatorio.css, previa.css e impressao.css': [],
};

for (const [nome, { antes, agora }] of Object.entries(GRUPOS)) {
  test(`minor: toda regra do ${nome} da v3.11.0 igual, fora as alteradas pelo nome`, () => {
    const alteradas = ALTERADAS[nome];
    for (const r of regras(antes)) {
      for (const s of r.seletores) {
        const chave = `${r.media}|${s}`;
        if (s.startsWith('@')) { assert.ok(seletores(agora).has(s), `sumiu: ${s}`); continue; }
        const velha = declaracoesEm(antes, r.media, s);
        const nova = declaracoesEm(agora, r.media, s);
        if (!(chave in alteradas)) assert.deepEqual(nova, velha, chave);
        else if (alteradas[chave] === null) assert.equal(nova, null, `devia ter saído: ${chave}`);
        else assert.notDeepEqual(nova, velha, `está na lista e não mudou: ${chave}`);
      }
    }
  });

  test(`${nome}: o que nasceu na v3.12.0 é exatamente a lista`, () => {
    const velhas = new Set(chaves(antes));
    assert.deepEqual(chaves(agora).filter((c) => !velhas.has(c)), NOVAS[nome]);
  });
}

// ---------- As alteradas, uma a uma ----------

test('alteradas: o campo troca o fundo e perde o outline: none e o halo; o botão vai a 48 no toque; o indicador troca a borda pelo realce', () => {
  const antes = declaracoesEm(fixo('onevessel'), '', '.ov-campo');
  const agora = declaracoesEm(controles, '', '.ov-campo');
  const trocas = {
    'background: var(--ov-fundo)': 'background: var(--ov-superficie-recuada)',
    'outline: none': null,
    'transition: border-color .12s, box-shadow .12s': 'transition: border-color .12s',
  };
  assert.deepEqual(agora, antes.map((d) => (d in trocas ? trocas[d] : d)).filter(Boolean));
  assert.deepEqual(declaracoesEm(fixo('onevessel'), '', '.ov-campo:focus'), ['border-color: var(--ov-acao)', 'box-shadow: 0 0 0 3px var(--ov-acao-suave)']);
  assert.equal(corpo(fixo('onevessel'), '.ov-btn', TOQUE), 'height: var(--ov-altura-campo)');
  assert.equal(corpo(controles, '.ov-btn', TOQUE), 'height: var(--ov-altura-toque)');
  assert.equal(corpo(fixo('telas'), 'a.ov-indicador:hover'), 'border-color: var(--ov-borda-forte); color: inherit');
  assert.equal(corpo(telas, 'a.ov-indicador:hover'), 'background-image: linear-gradient(var(--ov-linha-hover), var(--ov-linha-hover)); color: inherit');
});

// ---------- controles.css importável sozinho ----------

const DOS_CONTROLES = /^(:where\(\.ov-btn, \.ov-campo-grupo, \.ov-campo\)|\.ov-btn(-[\w-]+)?|\.ov-campo(-grupo)?|\.ov-label|\.ov-ajuda|\.ov-erro-campo)([:[ ]|$)/;

test('controles.css: importável sozinho, sem base, sem import, sem :root, sem impressão nem movimento global', () => {
  assert.deepEqual(problemasDeBase('controles.css', controles), []);
  const texto = semComentario(controles);
  assert.doesNotMatch(texto, /@import|:root|@media print|@page|prefers-reduced-motion|@keyframes/);
  for (const s of seletores(controles)) assert.match(s, DOS_CONTROLES, s);
  // A caixa: 100% de largura com o padding dentro, sem depender do * da base.
  assert.equal(corpo(controles, ':where(.ov-btn, .ov-campo-grupo, .ov-campo)'), 'box-sizing: border-box');
  // Cada caixa com texto declara a própria fonte e cor.
  assert.match(corpo(controles, '.ov-btn'), /font: 500 14px\/20px var\(--font-sans\)/);
  assert.match(corpo(controles, '.ov-campo'), /font: 400 16px\/24px var\(--font-sans\)/);
  assert.match(corpo(controles, '.ov-campo'), /color: var\(--ov-texto\)/);
});

test('onevessel.css: importa o controles.css por último e não repete nenhum seletor dele; a plataforma recebe tudo', () => {
  const imports = [...semComentario(onevessel).matchAll(/@import url\("\.\/([\w-]+\.css)"\);/g)].map((m) => m[1]);
  assert.deepEqual(imports, ['casca.css', 'janelas.css', 'telas.css', 'relatorio.css', 'controles.css']);
  const deles = seletores(controles);
  for (const s of seletores(onevessel)) assert.ok(!deles.has(s), `repetido: ${s}`);
  for (const s of seletores(onevessel)) assert.doesNotMatch(s, /\.ov-(btn|campo|label|ajuda|erro-campo)/, s);
  assert.equal(pacote.exports['./css/controles.css'], './css/controles.css');
});

test('janelas.css: o .ov-btn-perigo é só a cor, sobre a base do controles.css, sem import', () => {
  assert.equal(corpo(janelas, '.ov-btn-perigo'), 'background: var(--ov-erro); color: var(--ov-sobre-erro)');
  assert.doesNotMatch(semComentario(janelas), /@import/);
  // O rodapé da folha continua vencendo a altura do .ov-btn, em qualquer ordem: é mais forte.
  assert.ok(seletores(janelas).has('.ov-folha-rodape > .ov-btn'));
});

// ---------- Botões ----------

test('botão: 36px no computador, 48 no toque (o pequeno também), peso 500, raio ov-raio-md', () => {
  const btn = corpo(controles, '.ov-btn');
  assert.match(btn, /height: var\(--ov-altura-controle\)/);
  assert.match(btn, /border-radius: var\(--ov-raio-md\)/);
  assert.match(btn, /font: 500 /);
  assert.equal(corpo(controles, '.ov-btn-sm'), 'height: 28px; padding: 0 10px; font-size: 13px');
  assert.equal(corpo(controles, '.ov-btn-icone', TOQUE), 'width: var(--ov-altura-toque); height: var(--ov-altura-toque)');
  // O toque vem depois do .ov-btn-sm, com a mesma força: o pequeno sobe a 48.
  const ordem = regras(controles).map((r) => `${r.media}|${r.seletores.join(', ')}`);
  assert.ok(ordem.indexOf(`${TOQUE}|.ov-btn`) > ordem.indexOf('|.ov-btn-sm'));
  assert.match(tokens, /--ov-altura-controle:\s*36px;/);
  assert.match(tokens, /--ov-altura-toque:\s*48px;/);
});

// ---------- Campo ----------

test('campo: 44px, 16px, borda ov-borda-controle, fundo recuado, anel único no foco e nenhum halo', () => {
  const campo = corpo(controles, '.ov-campo');
  assert.match(campo, /height: var\(--ov-altura-campo\)/);
  assert.match(campo, /border: 1px solid var\(--ov-borda-controle\)/);
  assert.match(campo, /background: var\(--ov-superficie-recuada\)/);
  assert.match(tokens, /--ov-altura-campo:\s*44px;/);
  assert.equal(corpo(controles, '.ov-campo:focus-visible'), 'outline: 2px solid var(--ov-foco); outline-offset: 2px');
  assert.equal(declaracoesEm(controles, '', '.ov-campo:focus'), null);
  // Altura igual em qualquer tela: nenhuma regra do campo em @media.
  for (const r of regras(controles)) if (r.media) for (const s of r.seletores) assert.doesNotMatch(s, /ov-campo/, `${r.media} ${s}`);
  for (const { seletores: ss, corpo: c } of regras(controles)) {
    if (ss.some((s) => s.includes('.ov-campo'))) assert.doesNotMatch(c, /box-shadow/, ss.join(', '));
  }
});

test('rótulo: 14px/500 em ov-texto', () => {
  assert.equal(corpo(controles, '.ov-label'), 'font: 500 14px/20px var(--font-sans); color: var(--ov-texto)');
});

// ---------- Nenhum outline: none ----------

test('nenhum outline: none em CSS nenhum do pacote, sem exceção', () => {
  for (const nome of readdirSync(new URL('../css/', import.meta.url)).filter((n) => n.endsWith('.css'))) {
    for (const { seletores: ss, corpo: c, media } of regras(ler(`css/${nome}`))) {
      assert.doesNotMatch(c, /(^|;|\s)outline\s*:\s*(none|0)\s*(;|$)/, `${nome}: ${media} ${ss.join(', ')}`);
    }
  }
});

// ---------- Cartão clicável (anotado na onda 2 do V17) ----------

const CURSOR = '.ov-cartao:where(a, button:not(:disabled))';
const HOVER = '.ov-cartao:where(a:hover, button:hover:not(:disabled)):where(:not([aria-current="true"]))';

test('cartão clicável: cursor e o realce ov-linha-hover sobre a superfície, sem mexer na borda; o aberto fica de fora', () => {
  assert.equal(corpo(telas, CURSOR), 'cursor: pointer');
  assert.equal(corpo(telas, HOVER), 'background-image: linear-gradient(var(--ov-linha-hover), var(--ov-linha-hover))');
  // Regras fracas (só a .ov-cartao conta, como no aberto) e depois do .ov-cartao.
  for (const s of [CURSOR, HOVER]) assert.equal(s.replace(/:where\((?:[^()]|\([^()]*\))*\)/g, ''), '.ov-cartao', s);
  const ordem = regras(telas).filter((r) => !r.media).flatMap((r) => r.seletores);
  assert.ok(ordem.indexOf(HOVER) > ordem.indexOf('.ov-cartao'));
  // O hover não toca a borda: a do aberto e a de alerta do app ficam.
  assert.doesNotMatch(corpo(telas, HOVER), /border/);
  assert.doesNotMatch(corpo(telas, 'a.ov-indicador:hover'), /border/);
});

// ---------- Alvos de toque ----------

test('toque: .ov-visao e os botões do .ov-segmentado com 48px de altura mínima', () => {
  assert.equal(corpo(telas, '.ov-visao', TOQUE), 'min-height: var(--ov-altura-toque)');
  assert.equal(corpo(telas, '.ov-segmentado button', TOQUE), 'min-height: var(--ov-altura-toque)');
  // A linha que quebra: as fileiras ficam a 4px (o gap das duas direções).
  assert.match(corpo(telas, '.ov-visoes'), /gap: 4px; flex-wrap: wrap/);
});

// ---------- Contraste, pelos tokens, nos dois temas ----------

const bloco = (cabeca) => {
  const i = tokens.indexOf(cabeca);
  const c = tokens.slice(tokens.indexOf('{', i) + 1, tokens.indexOf('}', i));
  return Object.fromEntries([...c.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};
const escuro = bloco(':root,\n[data-theme="escuro"]');
const TEMAS = { escuro, claro: { ...escuro, ...bloco('[data-theme="claro"] {') } };
const cor = (v) => {
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).concat(1);
  m = v.match(/^rgba\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/);
  return m ? m.slice(1).map(Number) : null;
};
const sobre = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
const luminancia = (c) => {
  const [r, g, b] = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

for (const [tema, t] of Object.entries(TEMAS)) {
  test(`contraste no tema ${tema}: campo recuado, anel em volta e o cartão sob o mouse`, () => {
    const confere = (frente, fundo, minimo, rotulo) => {
      const r = contraste(cor(t[frente]), fundo);
      assert.ok(r >= minimo, `${tema}: ${rotulo} com ${r.toFixed(2)}:1, menos de ${minimo}:1`);
    };
    const campo = cor(t['ov-superficie-recuada']);
    confere('ov-borda-controle', campo, 3, 'borda do campo');
    confere('ov-texto', campo, 4.5, 'texto do campo');
    confere('ov-texto-terciario', campo, 4.5, 'placeholder');
    // O anel fica 2px fora do campo: sobre a página ou sobre o cartão.
    for (const fora of ['ov-fundo', 'ov-superficie', 'ov-superficie-elevada']) confere('ov-foco', cor(t[fora]), 3, `anel sobre ${fora}`);
    // O campo em volta: a borda de 3:1 sobre a página e sobre o cartão (livro).
    for (const fora of ['ov-fundo', 'ov-superficie']) confere('ov-borda-controle', cor(t[fora]), 3, `borda do campo sobre ${fora}`);
    const realce = sobre(cor(t['ov-linha-hover']), cor(t['ov-superficie']));
    for (const texto of ['ov-texto', 'ov-texto-secundario', 'ov-texto-terciario']) confere(texto, realce, 4.5, `${texto} no cartão sob o mouse`);
  });
}

// ---------- Pacote ----------

// A versão do pacote fica com o teste da versão mais nova.
test('pacote: versão 3.12.0', () => {
  assert.equal(pacote.version, '3.12.0');
});

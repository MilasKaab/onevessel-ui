// v3.11.0 (V17): o que os apps copiavam sobe ao pacote. A folha do "Mais" e
// o miolo da paleta na casca, com o anel do campo; os utilitários da lista do
// celular, o cartão aberto e a aba de rota nas telas; o cartão sem sombra; a
// barra da Página de impressão no previa.css; o hover do primário legível.
// `test/fixtures/*-v3.10.1.css` são os CSS da tag v3.10.1, fixos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { problemasDeBase, regras, semComentario, seletores } from '../scripts/css-regras.mjs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const fixo = (nome) => ler(`test/fixtures/${nome}-v3.10.1.css`);
const casca = ler('css/casca.css');
const telas = ler('css/telas.css');
const onevessel = ler('css/onevessel.css');
const relatorio = ler('css/relatorio.css');
const impressao = ler('css/impressao.css');
const previa = ler('css/previa.css');
const tokens = ler('css/tokens.css');
const pacote = JSON.parse(ler('package.json'));

const CELULAR = '@media (max-width: 767px)';
const PRINT = '@media print';

// Declarações de uma regra num @media (cabeça exata), normalizadas.
const declaracoesEm = (css, media, seletor) => {
  const r = regras(css).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? r.corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean) : null;
};
const corpo = (css, seletor, media = '') => (declaracoesEm(css, media, seletor) ?? []).join('; ');
const chaves = (css) => regras(css).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- minor: toda regra da v3.10.1 igual, fora as alteradas pelo nome ----------

// Cada grupo: os CSS da v3.10.1 e onde as regras moram agora. A barra da
// prévia saiu do relatorio.css e do impressao.css para o previa.css.
const GRUPOS = {
  'casca.css': { antes: fixo('casca'), agora: casca, caixa: ':where(.ov-casca' },
  'telas.css': { antes: fixo('telas'), agora: telas, caixa: ':where(.ov-cartao' },
  'onevessel.css': { antes: fixo('onevessel'), agora: onevessel },
  'relatorio.css e impressao.css': { antes: fixo('relatorio') + fixo('impressao'), agora: relatorio + impressao + previa },
};

// As regras da v3.10.1 que mudaram, pelo nome (media|seletor). `null`: saiu.
const ALTERADAS = {
  'casca.css': { '|.ov-folha-alca': 'muda', '|.ov-paleta-busca input': 'muda' },
  'telas.css': { '|[data-theme="claro"] .ov-cartao': null },
  'onevessel.css': { '|.ov-btn-primario:hover:not(:disabled)': 'muda' },
  'relatorio.css e impressao.css': {},
};

// O que nasceu, na ordem do arquivo.
const NOVAS = {
  'casca.css': [
    '|.ov-menu-item[aria-current="page"]', '|.ov-menu-item[aria-current="page"] svg', '|.ov-menu-grupo',
    '|.ov-paleta-busca input:focus-visible',
    '|.ov-paleta-lista', '|.ov-paleta-lista .ov-paleta-item', '|a.ov-paleta-item', '|.ov-paleta-aviso',
    '|.ov-folha-topo', '|.ov-folha-titulo', '|.ov-folha-menu', '|.ov-folha-menu .ov-menu-item', '|.ov-folha-conta', '|.ov-folha-conta svg',
    `${CELULAR}|.ov-paleta-lista`,
  ],
  'telas.css': [
    '|.ov-visao[aria-current="page"]', '|a.ov-visao',
    '|.ov-cartao:where([aria-current="true"])',
    '|.ov-tabela .ov-so-no-celular',
    `${CELULAR}|.ov-tabela:has(td.nome) .ov-so-no-celular`, `${CELULAR}|.ov-tabela:has(td.nome) .ov-fora-do-celular`,
  ],
  'onevessel.css': [],
  'relatorio.css e impressao.css': [],
};

// Os nomes que entraram na lista de box-sizing (o :where do topo).
const NA_CAIXA = {
  'casca.css': ['.ov-menu-grupo', '.ov-folha-topo', '.ov-folha-menu', '.ov-folha-conta', '.ov-paleta-lista', '.ov-paleta-aviso'],
  'telas.css': [],
};
const nomesDaCaixa = (css, prefixo) => {
  const s = [...seletores(css)].find((x) => x.startsWith(prefixo));
  return s.slice(':where('.length, -1).split(',').map((n) => n.trim());
};

for (const [nome, { antes, agora, caixa }] of Object.entries(GRUPOS)) {
  test(`minor: toda regra do ${nome} da v3.10.1 igual, fora as alteradas pelo nome`, () => {
    const alteradas = ALTERADAS[nome];
    for (const r of regras(antes)) {
      for (const s of r.seletores) {
        const chave = `${r.media}|${s}`;
        if (caixa && s.startsWith(caixa)) continue;
        if (s.startsWith('@')) { assert.ok(seletores(agora).has(s), `sumiu: ${s}`); continue; }
        const velha = declaracoesEm(antes, r.media, s);
        const nova = declaracoesEm(agora, r.media, s);
        if (!(chave in alteradas)) assert.deepEqual(nova, velha, chave);
        else if (alteradas[chave] === null) assert.equal(nova, null, `devia ter saído: ${chave}`);
        else assert.notDeepEqual(nova, velha, `está na lista e não mudou: ${chave}`);
      }
    }
  });

  test(`${nome}: o que nasceu na v3.11.0 é exatamente a lista`, () => {
    const velhas = new Set(chaves(antes));
    const novas = chaves(agora).filter((c) => !velhas.has(c) && !(caixa && c.startsWith(`|${caixa}`)));
    assert.deepEqual(novas, NOVAS[nome]);
  });

  if (caixa) {
    test(`${nome}: a lista de box-sizing é a da v3.10.1, na mesma ordem, mais os nomes novos`, () => {
      const velha = nomesDaCaixa(antes, caixa);
      const nova = nomesDaCaixa(agora, caixa);
      assert.deepEqual(nova.filter((n) => velha.includes(n)), velha);
      assert.deepEqual(nova.filter((n) => !velha.includes(n)), NA_CAIXA[nome]);
    });
  }
}

// ---------- As alteradas, uma a uma ----------

test('alteradas: a alça vira puxador; o campo da paleta perde o outline: none; o primário troca o texto no hover', () => {
  const alca = declaracoesEm(casca, '', '.ov-folha-alca');
  assert.deepEqual(alca, [...declaracoesEm(fixo('casca'), '', '.ov-folha-alca'), 'touch-action: none']);
  const campo = declaracoesEm(casca, '', '.ov-paleta-busca input');
  assert.deepEqual(campo, declaracoesEm(fixo('casca'), '', '.ov-paleta-busca input').filter((d) => d !== 'outline: none'));
  const hover = declaracoesEm(onevessel, '', '.ov-btn-primario:hover:not(:disabled)');
  assert.deepEqual(hover, [...declaracoesEm(fixo('onevessel'), '', '.ov-btn-primario:hover:not(:disabled)'), 'color: var(--ov-fundo)']);
});

test('cartão: nenhuma sombra no .ov-cartao, em nenhum tema (livro: o cartão em repouso se separa por borda)', () => {
  for (const { seletores: ss, corpo: c } of regras(telas)) {
    if (ss.some((s) => /\.ov-cartao(?![\w-])/.test(s))) assert.doesNotMatch(c, /box-shadow/, ss.join(', '));
  }
});

// ---------- Folha do "Mais" (U17-3, U17-4) ----------

test('folha: itens de 48px no "Mais", topo puxador, lista com a área segura de baixo, conta e grupo', () => {
  assert.equal(corpo(casca, '.ov-folha-menu .ov-menu-item'), 'height: var(--ov-altura-toque)');
  assert.match(corpo(casca, '.ov-folha-topo'), /touch-action: none/);
  assert.match(corpo(casca, '.ov-folha-topo'), /padding: 0 4px 4px 16px/);
  assert.match(corpo(casca, '.ov-folha-titulo'), /font: var\(--ov-fonte-titulo-2\)/);
  const menu = corpo(casca, '.ov-folha-menu');
  assert.match(menu, /overflow-y: auto; overscroll-behavior: contain; padding: 0 8px calc\(12px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  // Cada caixa nova declara a própria fonte e cor.
  for (const s of ['.ov-folha-topo', '.ov-folha-menu', '.ov-folha-conta', '.ov-menu-grupo']) assert.match(corpo(casca, s), /color: var\(--ov-/, s);
  assert.match(corpo(casca, '.ov-folha-conta'), /color: var\(--ov-texto-secundario\)/);
  assert.equal(corpo(casca, '.ov-menu-grupo'), 'margin: 0; padding: 8px 10px 4px; font: var(--ov-fonte-rotulo); color: var(--ov-texto-terciario)');
});

test('menu: o item da seção aberta tem o desenho do .ov-nav ativo e vem depois do :hover', () => {
  assert.equal(corpo(casca, '.ov-menu-item[aria-current="page"]'), corpo(casca, '.ov-nav[aria-current="page"]').replace('; color: var(--ov-texto)', ''));
  assert.equal(corpo(casca, '.ov-menu-item[aria-current="page"] svg'), corpo(casca, '.ov-nav[aria-current="page"] svg'));
  const ordem = regras(casca).filter((r) => !r.media).flatMap((r) => r.seletores);
  assert.ok(ordem.indexOf('.ov-menu-item[aria-current="page"]') > ordem.indexOf('.ov-menu-item:hover'));
});

// ---------- Paleta (U17-5 a U17-7, U17-9, U17-13) ----------

test('paleta: lista com 4px em cima, rolando por dentro; no celular sem limite e com a área segura', () => {
  assert.equal(corpo(casca, '.ov-paleta-lista'), 'max-height: min(60vh, 480px); overflow-y: auto; overscroll-behavior: contain; padding: 4px 8px 8px');
  assert.equal(corpo(casca, '.ov-paleta-lista', CELULAR), 'max-height: none; padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px))');
  assert.equal(corpo(casca, '.ov-paleta-lista .ov-paleta-item'), 'cursor: pointer');
  assert.equal(corpo(casca, 'a.ov-paleta-item'), 'color: inherit; text-decoration: none');
});

test('paleta: o aviso em terciário com 13px solto', () => {
  assert.equal(corpo(casca, '.ov-paleta-aviso'), 'margin: 0; padding: 8px 12px; font-size: 13px; color: var(--ov-texto-terciario)');
});

test('paleta: o campo com o anel único do livro, no próprio campo', () => {
  assert.equal(corpo(casca, '.ov-paleta-busca input:focus-visible'), 'outline: 2px solid var(--ov-foco); outline-offset: 2px');
  // O anel cabe na folga da faixa: 2px de recuo + 2px de traço dentro de (56 − 40) / 2.
  assert.match(corpo(casca, '.ov-paleta-busca'), /height: 56px/);
  assert.match(corpo(casca, '.ov-paleta-busca input'), /height: 40px/);
  // A caixa da paleta não ganha anel nem :focus-within.
  assert.doesNotMatch(semComentario(casca), /\.ov-paleta(-busca)?:focus-within/);
});

test('nenhum outline: none nos CSS do pacote, fora o .ov-campo (até a v3.12.0)', () => {
  for (const nome of ['tokens', 'fontes', 'casca', 'janelas', 'telas', 'onevessel', 'relatorio', 'previa', 'impressao']) {
    for (const { seletores: ss, corpo: c } of regras(ler(`css/${nome}.css`))) {
      if (!/(^|;|\s)outline\s*:\s*(none|0)\s*(;|$)/.test(c)) continue;
      assert.deepEqual([nome, ss], ['onevessel', ['.ov-campo']], `${nome}.css: ${ss.join(', ')}`);
    }
  }
});

// ---------- Tabela (U17-8) ----------

test('tabela: o rótulo .ov-so-no-celular só aparece na lista; a .ov-fora-do-celular só some nela; tudo dentro da .ov-tabela', () => {
  assert.equal(corpo(telas, '.ov-tabela .ov-so-no-celular'), 'display: none');
  assert.equal(corpo(telas, '.ov-tabela:has(td.nome) .ov-so-no-celular', CELULAR), 'display: inline');
  assert.equal(corpo(telas, '.ov-tabela:has(td.nome) .ov-fora-do-celular', CELULAR), 'display: none');
  for (const s of seletores(telas)) {
    if (/ov-so-no-celular|ov-fora-do-celular/.test(s)) assert.match(s, /^\.ov-tabela[\s:]/, s);
  }
  // Fora da lista, a .ov-fora-do-celular não tem regra: fica como o app a pôs.
  assert.equal(declaracoesEm(telas, '', '.ov-tabela .ov-fora-do-celular'), null);
});

// ---------- Cartão aberto e aba de rota (U17-10, BV-6) ----------

test('cartão aberto: borda ov-acao e ov-acao-suave sobre a superfície, numa regra fraca, sem sombra nem contorno', () => {
  const aberto = corpo(telas, '.ov-cartao:where([aria-current="true"])');
  assert.equal(aberto, 'border-color: var(--ov-acao); background-image: linear-gradient(var(--ov-acao-suave), var(--ov-acao-suave))');
  assert.doesNotMatch(aberto, /border-left|box-shadow|outline|background-color/);
  // Vem depois do .ov-cartao (mesma força: a ordem decide).
  const ordem = regras(telas).filter((r) => !r.media).flatMap((r) => r.seletores);
  assert.ok(ordem.indexOf('.ov-cartao:where([aria-current="true"])') > ordem.indexOf('.ov-cartao'));
});

test('aba de rota: a .ov-visao com aria-current="page" tem o desenho da selecionada, e o link não sublinha', () => {
  assert.deepEqual(declaracoesEm(telas, '', '.ov-visao[aria-current="page"]'), declaracoesEm(telas, '', '.ov-visao[aria-selected="true"]'));
  assert.equal(corpo(telas, 'a.ov-visao'), 'text-decoration: none');
});

// ---------- Barra da prévia (BV-8) ----------

const DA_PREVIA = ['.rel-barra', '.rel-barra-titulo', '.rel-area'];

test('previa.css: só a barra e a área, sem a folha, sem @page e sem base; no papel, só esconde', () => {
  assert.deepEqual(problemasDeBase('previa.css', previa), ['previa.css tem @media print']);
  assert.doesNotMatch(semComentario(previa), /@page|@import|--rel-|--font-rel/);
  for (const { seletores: ss, media } of regras(previa)) {
    for (const s of ss) assert.ok(DA_PREVIA.includes(s), `${media} ${s}`);
  }
  assert.equal(corpo(previa, '.rel-barra', PRINT), 'display: none');
  assert.equal(corpo(previa, '.rel-area', PRINT), 'padding: 0; background: none');
});

test('barra: valores da v3.10.1, o título em titulo-3 (16px, 600)', () => {
  for (const s of DA_PREVIA) assert.deepEqual(declaracoesEm(previa, '', s), declaracoesEm(fixo('relatorio'), '', s), s);
  assert.match(corpo(previa, '.rel-barra-titulo'), /font: var\(--ov-fonte-titulo-3\)/);
  assert.match(tokens, /--ov-fonte-titulo-3:\s*600 16px\/24px var\(--font-sans\);/);
});

test('o relatorio.css importa o previa.css e não repete a barra; o impressao.css não fala mais dela; previa.css em exports', () => {
  assert.match(semComentario(relatorio), /^\s*@import url\("\.\/previa\.css"\);/);
  for (const s of DA_PREVIA) {
    assert.ok(!seletores(relatorio).has(s), `relatorio.css: ${s}`);
    assert.ok(!seletores(impressao).has(s), `impressao.css: ${s}`);
  }
  assert.equal(pacote.exports['./css/previa.css'], './css/previa.css');
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
  test(`contraste no tema ${tema}: hover do primário, cartão aberto, aviso e anel da paleta`, () => {
    const confere = (texto, fundo, minimo, rotulo) => {
      const r = contraste(cor(t[texto]), fundo);
      assert.ok(r >= minimo, `${tema}: ${rotulo} com ${r.toFixed(2)}:1, menos de ${minimo}:1`);
    };
    // PV-4: o texto do primário no hover (era ov-sobre-acao, 1,72:1 no escuro).
    confere('ov-fundo', cor(t['ov-acao-hover']), 4.5, 'texto do primário no hover');
    // Cartão aberto: ov-acao-suave sobre a ov-superficie, com os três textos.
    const aberto = sobre(cor(t['ov-acao-suave']), cor(t['ov-superficie']));
    for (const texto of ['ov-texto', 'ov-texto-secundario', 'ov-texto-terciario']) confere(texto, aberto, 4.5, `${texto} no cartão aberto`);
    // A paleta é ov-superficie-elevada: o aviso e o anel do campo.
    const paleta = cor(t['ov-superficie-elevada']);
    confere('ov-texto-terciario', paleta, 4.5, 'aviso da paleta');
    confere('ov-foco', paleta, 3, 'anel do campo da paleta');
    // A seção aberta do "Mais": o ícone em ov-acao-texto sobre o ov-item-ativo da folha.
    confere('ov-acao-texto', sobre(cor(t['ov-item-ativo']), paleta), 3, 'ícone do item aberto');
  });
}

// ---------- Pacote ----------

// A versão do pacote fica com o teste da versão mais nova.
test('pacote: versão 3.11.0', () => {
  assert.equal(pacote.version, '3.11.0');
});

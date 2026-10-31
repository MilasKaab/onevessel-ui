// v3.19.0 (livro v4 e as decisões C de 30–31/10, e o bloco A da antiga
// v3.18.3): tokens das tags, do Em andamento, do Crítico e do texto do
// contador; .ov-tag e .ov-estado em andamento; filetes do indicador e da
// pendência; visão selecionada; alvos de 48 no toque (campo, abas internas,
// conta da barra superior, chip); .meta da paleta; desabilitado a .6,
// .ov-motivo, "Salvando…" e o ícone de 18 no botão; a coluna que sai no
// tablet e a .ov-rolagem; o "Pular para o conteúdo". Minor: as fixtures da
// v3.18.2 (`test/fixtures/*-v3.18.2.css`, da tag, fixas) ficam iguais regra
// a regra, fora as alteradas pelo nome.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { problemasDeBase, regras, seletores } from '../scripts/css-regras.mjs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const NOMES = ['casca', 'controles', 'janelas', 'telas'];
const ATUAL = Object.fromEntries([...NOMES, 'tokens'].map((n) => [n, ler(`css/${n}.css`)]));
const ANTES = Object.fromEntries([...NOMES, 'tokens'].map((n) => [n, ler(`test/fixtures/${n}-v3.18.2.css`)]));
const tokensJson = JSON.parse(ler('tokens/tokens.json'));
const exemplo = ler('exemplo/index.html');
const leiame = ler('README.md');

const TOQUE = '@media (pointer: coarse)';
const TABLET = '@media (min-width: 768px) and (max-width: 1023px)';
const MOVIMENTO = '@media (prefers-reduced-motion: reduce)';
const GRANDE_SEL = '.ov-visoes[data-tamanho="grande"] > .ov-visao:is([aria-selected="true"], [aria-current="page"])';

// A regra do alerta desce para depois dos filetes (mesma força: vence pela
// ordem); é a única velha que muda de lugar.
const ALERTA = '|.ov-indicador[data-alerta="true"]';

const declaracoes = (corpo) => corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
const declaracoesEm = (texto, media, seletor) => {
  const r = regras(texto).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? declaracoes(r.corpo) : null;
};
const chaves = (texto) => regras(texto).flatMap((r) => r.seletores.map((s) => `${r.media}|${s}`));

// ---------- minor: tudo da v3.18.2 igual, fora as alteradas pelo nome ----------

// As que mudam de valor, com as declarações novas.
const ALTERADAS = {
  controles: {
    '|.ov-btn:disabled': ['opacity: .6', 'cursor: not-allowed'],
    [`${TOQUE}|.ov-campo[data-densidade="linha"]`]: ['height: var(--ov-altura-toque)', 'font-size: 16px', 'line-height: 24px'],
    [`${TOQUE}|textarea.ov-campo[data-densidade="linha"]`]: ['height: auto', 'min-height: var(--ov-altura-toque)', 'padding: 11px 12px'],
  },
  telas: {
    '|.ov-visao[aria-selected="true"]': ['background: var(--ov-acao-suave)', 'color: var(--ov-texto)', 'box-shadow: inset 0 0 0 1px var(--ov-acao)', 'font-weight: 600'],
    '|.ov-visao[aria-current="page"]': ['background: var(--ov-acao-suave)', 'color: var(--ov-texto)', 'box-shadow: inset 0 0 0 1px var(--ov-acao)', 'font-weight: 600'],
    [`|${GRANDE_SEL}`]: ['background: var(--ov-acao-suave)', 'color: var(--ov-texto)', 'box-shadow: inset 0 -2px 0 var(--ov-acao)', 'font-weight: 500'],
    '|.ov-indicador[data-alerta="true"]': ['border-color: var(--ov-destaque)', 'box-shadow: inset 3px 0 0 var(--ov-destaque)'],
    '|.ov-contador-destaque': ['display: inline-flex', 'align-items: center', 'height: 20px', 'padding: 0 7px', 'border-radius: var(--ov-raio-pill)', 'background: var(--ov-destaque-suave)', 'color: var(--ov-destaque-texto)', 'font-size: 12px', 'font-weight: 600', 'font-variant-numeric: tabular-nums'],
  },
};

const NOVAS = {
  casca: ['|.ov-paleta-item[aria-selected="true"] .meta', '|.ov-estado[data-tom="andamento"]', '|.ov-tag',
    '|.ov-tag[data-tom="neutro"]', '|.ov-tag[data-tom="info"]', '|.ov-tag[data-tom="atencao"]', '|.ov-tag[data-tom="erro"]', '|.ov-tag[data-tom="sucesso"]',
    '|.ov-tag .ov-tnum', '|.ov-tag-ponto', '|.ov-tag[data-tom="info"] .ov-tag-ponto', '|.ov-tag[data-tom="atencao"] .ov-tag-ponto',
    '|.ov-tag[data-tom="erro"] .ov-tag-ponto', '|.ov-tag[data-tom="sucesso"] .ov-tag-ponto', '|.ov-tag[data-tom="critico"]', '|.ov-tag[data-tom="critico"] svg',
    '|.ov-pular', '|.ov-pular:focus-visible', `${TOQUE}|.ov-superior .ov-conta`, `${TOQUE}|.ov-pular`],
  controles: ['|.ov-btn[aria-busy="true"]', '|.ov-reticencias', '|.ov-reticencias > span', '|.ov-reticencias > span:nth-child(2)', '|.ov-reticencias > span:nth-child(3)',
    '|@keyframes ovReticencia', '|.ov-motivo', '|.ov-btn-icone svg', `${TOQUE}|.ov-motivo`, `${TOQUE}|.ov-campo`, `${TOQUE}|textarea.ov-campo`,
    `${MOVIMENTO}|.ov-reticencias > span`],
  janelas: [`${TOQUE}|.ov-abas-internas button`],
  telas: [`${TOQUE}|.ov-chip-filtro`, `${TOQUE}|.ov-chip-filtro button`,
    '|.ov-indicador[data-filete="neutro"]', '|.ov-indicador[data-filete="info"]', '|.ov-indicador[data-filete="andamento"]',
    '|.ov-indicador[data-filete="atencao"]', '|.ov-indicador[data-filete="erro"]', '|.ov-indicador[data-filete="sucesso"]',
    '|.ov-pendencia[data-tom="erro"]', '|.ov-pendencia[data-tom="atencao"]', '|.ov-rolagem', `${TABLET}|.ov-tabela :is(th, td)[data-some-no-tablet]`],
};

for (const nome of NOMES) {
  test(`minor: toda regra do ${nome}.css da v3.18.2 igual, fora as alteradas pelo nome`, () => {
    const lista = ALTERADAS[nome] ?? {};
    for (const r of regras(ANTES[nome])) {
      for (const s of r.seletores) {
        const chave = `${r.media}|${s}`;
        if (s.startsWith('@')) { assert.ok(seletores(ATUAL[nome]).has(s), `sumiu: ${s}`); continue; }
        const velha = declaracoesEm(ANTES[nome], r.media, s);
        const nova = declaracoesEm(ATUAL[nome], r.media, s);
        if (chave in lista) {
          assert.notDeepEqual(nova, velha, `está na lista e não mudou: ${chave}`);
          assert.deepEqual(nova, lista[chave], chave);
        } else assert.deepEqual(nova, velha, chave);
      }
    }
  });

  test(`${nome}.css: o que nasceu na v3.19.0 é exatamente a lista, e a ordem das velhas não muda (fora a do alerta, que desce)`, () => {
    const velhas = new Set(chaves(ANTES[nome]));
    assert.deepEqual(chaves(ATUAL[nome]).filter((c) => !velhas.has(c)), NOVAS[nome]);
    const fica = (c) => !NOVAS[nome].includes(c) && c !== ALERTA;
    assert.deepEqual(chaves(ATUAL[nome]).filter(fica), chaves(ANTES[nome]).filter(fica));
  });
}

test('os outros CSS com os bytes da v3.18.2; as fixtures da tag', () => {
  const SHA = {
    onevessel: 'e95d5e92d34181ed2f907b755c46cfc958c417960512adda386138d50eb728d4',
    relatorio: 'fa85b58bd542d6c2034ee21d6b21c93bd1e1600ecf694bacdcbf261fb0966e86',
    previa: '381b9e557fb598785fbe0caed5e322dec6912afe4ec63a8391c159110259554e',
    impressao: 'd04910a7dfce1d4689cfbccc59f607affb928c48c549a8c1ff59e316591c3a68',
    fontes: '0732cb23d0c11661eebf32380715f9cde350a05bb57104393ccd735fa5332e8d',
  };
  for (const [nome, sha] of Object.entries(SHA)) assert.equal(sha256(`css/${nome}.css`), sha, nome);
  const FIXTURES = {
    casca: 'e416342d156f26fe70a17d52b390e144e33079d78aa31b78d949511fe15961d0',
    controles: 'e18ae6db69fc02205e45929f09afbd1b61e33212bf0aaf64d030c5c9edbfe9de',
    janelas: '52a2ea6c682b07d060dd98b389ffae31961b55c79dcfb48cebb3b74e1c582361',
    telas: '64efae3ad47bbc02b7049190d467e1169083cdcb9d0ebc763a8a7b4ab60f7bf7',
    tokens: 'fefa160e9e66f8c7529b9efa3208d1561a8d1ef7acbaf92d521f1b4989b2afd1',
  };
  for (const [nome, sha] of Object.entries(FIXTURES)) assert.equal(sha256(`test/fixtures/${nome}-v3.18.2.css`), sha, nome);
});

// ---------- Tokens ----------

const NOVOS_TOKENS = {
  'ov-status-andamento': ['#facc15', '#facc15'],
  'ov-critico': ['#f87171', '#dc2626'],
  'ov-tag-neutro-fundo': ['rgba(125,151,176,.18)', '#e8eef4'], 'ov-tag-neutro-texto': ['#c3d2e0', '#334a60'],
  'ov-tag-info-fundo': ['rgba(96,165,250,.18)', '#dbeafe'], 'ov-tag-info-texto': ['#bfdbfe', '#1e40af'],
  'ov-tag-atencao-fundo': ['rgba(250,204,21,.16)', '#fef3c7'], 'ov-tag-atencao-texto': ['#fde68a', '#854d0e'],
  'ov-tag-erro-fundo': ['rgba(248,113,113,.18)', '#fee2e2'], 'ov-tag-erro-texto': ['#fecaca', '#991b1b'],
  'ov-tag-sucesso-fundo': ['rgba(52,211,153,.16)', '#d1fae5'], 'ov-tag-sucesso-texto': ['#a7f3d0', '#065f46'],
  'ov-destaque-texto': ['#fb923c', '#9a4508'],
};
const cores = tokensJson.color.tokens;
const valor = (nome, tema) => { const v = cores.find((t) => t.name === nome).value; return typeof v === 'string' ? v : v[tema]; };

test('tokens.json: os novos com os valores e um usage, onde a proposta pôs; o ov-destaque-suave não muda', () => {
  for (const [nome, [escuro, claro]] of Object.entries(NOVOS_TOKENS)) {
    const t = cores.find((c) => c.name === nome);
    assert.ok(t, nome);
    assert.deepEqual(t.value, { escuro, claro }, nome);
    assert.ok(t.usage?.length > 10, nome);
  }
  const nomes = cores.map((c) => c.name);
  const i = nomes.indexOf('ov-neutro');
  assert.deepEqual(nomes.slice(i + 1, i + 13), Object.keys(NOVOS_TOKENS).slice(0, 12));
  assert.equal(nomes[nomes.indexOf('ov-destaque-suave') + 1], 'ov-destaque-texto');
  assert.deepEqual(cores.find((c) => c.name === 'ov-destaque-suave').value, { escuro: 'rgba(251,146,60,.16)', claro: 'rgba(180,83,9,.12)' });
});

test('tokens.css: o da v3.18.2 mais as linhas dos novos, nos dois temas, e nada sai', () => {
  const antes = ANTES.tokens.split('\n');
  const agora = ATUAL.tokens.split('\n');
  const novas = agora.filter((l) => !antes.includes(l));
  const esperadas = Object.entries(NOVOS_TOKENS).flatMap(([n, [e, c]]) => [`  --${n}: ${e};`, `  --${n}: ${c};`]);
  assert.deepEqual([...new Set(novas)].sort(), [...new Set(esperadas)].sort());
  assert.deepEqual(antes.filter((l) => !agora.includes(l)), []);
  // Cada novo nos dois blocos de tema (o #facc15 repete: duas linhas iguais).
  for (const n of Object.keys(NOVOS_TOKENS)) assert.equal(agora.filter((l) => l.startsWith(`  --${n}:`)).length, 2, n);
});

// ---------- Contraste, pelos tokens, nos dois temas ----------

const rgba = (s) => {
  s = s.trim();
  if (s[0] === '#') return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)).concat(1);
  const m = s.match(/rgba?\(([^)]+)\)/)[1].split(',').map(Number);
  return [m[0], m[1], m[2], m[3] ?? 1];
};
const sobre = (frente, fundo) => { const [r, g, b, a] = rgba(frente); const f = rgba(fundo); return `#${[r, g, b].map((c, i) => Math.round(c * a + f[i] * (1 - a)).toString(16).padStart(2, '0')).join('')}`; };
const luz = (cor) => { const [r, g, b] = rgba(cor).map((c) => c / 255); const c = (x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b); };
const contraste = (a, b) => { const [x, y] = [luz(a), luz(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const TEMAS = ['escuro', 'claro'];

test('contraste: o texto de cada tag ≥ 6,1:1 sobre o próprio fundo, em ov-superficie, ov-superficie-elevada e ov-fundo, nos dois temas', () => {
  for (const tema of TEMAS) for (const tom of ['neutro', 'info', 'atencao', 'erro', 'sucesso']) {
    for (const superficie of ['ov-superficie', 'ov-superficie-elevada', 'ov-fundo']) {
      const fundo = sobre(valor(`ov-tag-${tom}-fundo`, tema), valor(superficie, tema));
      const c = contraste(valor(`ov-tag-${tom}-texto`, tema), fundo);
      assert.ok(c >= 6.1, `${tema} ${tom} em ${superficie}: ${c.toFixed(2)}`);
    }
  }
});

test('contraste: o Crítico (ov-sobre-erro sobre ov-critico) ≥ 4,5 nos dois temas', () => {
  for (const tema of TEMAS) {
    const c = contraste(valor('ov-sobre-erro', tema), valor('ov-critico', tema));
    assert.ok(c >= 4.5, `${tema}: ${c.toFixed(2)}`);
  }
});

test('contraste: o contador (ov-destaque-texto sobre ov-destaque-suave) ≥ 4,5 em ov-superficie e ov-superficie-elevada, nos dois temas; no claro, sobe de 4,26', () => {
  for (const tema of TEMAS) for (const superficie of ['ov-superficie', 'ov-superficie-elevada']) {
    const fundo = sobre(valor('ov-destaque-suave', tema), valor(superficie, tema));
    const c = contraste(valor('ov-destaque-texto', tema), fundo);
    assert.ok(c >= 4.5, `${tema} em ${superficie}: ${c.toFixed(2)}`);
  }
  const fundoClaro = sobre(valor('ov-destaque-suave', 'claro'), valor('ov-superficie', 'claro'));
  assert.ok(contraste(valor('ov-destaque', 'claro'), fundoClaro) < 4.5, 'o de antes ficava abaixo');
});

test('contraste: visão selecionada (ov-texto sobre ov-acao-suave) e o .meta da paleta realçada (secundário) ≥ 4,5 nos dois temas', () => {
  for (const tema of TEMAS) {
    for (const superficie of ['ov-superficie', 'ov-fundo']) {
      const c = contraste(valor('ov-texto', tema), sobre(valor('ov-acao-suave', tema), valor(superficie, tema)));
      assert.ok(c >= 4.5, `visão ${tema} em ${superficie}: ${c.toFixed(2)}`);
    }
    const c = contraste(valor('ov-texto-secundario', tema), sobre(valor('ov-acao-suave', tema), valor('ov-superficie-elevada', tema)));
    assert.ok(c >= 4.5, `paleta ${tema}: ${c.toFixed(2)}`);
  }
});

test('contraste: o Em andamento é a exceção registrada no claro (1,5:1 sobre o branco, nunca texto)', () => {
  const c = contraste(valor('ov-status-andamento', 'claro'), valor('ov-superficie', 'claro'));
  assert.ok(c > 1.5 && c < 1.6, c.toFixed(2));
  // Nunca como cor de texto em CSS nenhum: só ponto (--estado-cor), filete e barra.
  for (const nome of NOMES) {
    for (const r of regras(ATUAL[nome])) for (const d of declaracoes(r.corpo)) {
      if (d.includes('--ov-status-andamento')) assert.match(d, /^(--estado-cor|box-shadow):/, `${nome}: ${d}`);
    }
  }
});

// ---------- As regras novas ----------

test('estado e tag: andamento pelo --estado-cor; tag 12/16 500, 2px 8px, raio sm, neutra sem tom; cada tom com o par dele', () => {
  const c = ATUAL.casca;
  assert.deepEqual(declaracoesEm(c, '', '.ov-estado[data-tom="andamento"]'), ['--estado-cor: var(--ov-status-andamento)']);
  const tag = declaracoesEm(c, '', '.ov-tag');
  for (const d of ['display: inline-flex', 'padding: 2px 8px', 'border-radius: var(--ov-raio-sm)', 'font: 500 12px/16px var(--font-sans)',
    'background: var(--ov-tag-neutro-fundo)', 'color: var(--ov-tag-neutro-texto)']) assert.ok(tag.includes(d), d);
  for (const tom of ['neutro', 'info', 'atencao', 'erro', 'sucesso']) {
    assert.deepEqual(declaracoesEm(c, '', `.ov-tag[data-tom="${tom}"]`), [`background: var(--ov-tag-${tom}-fundo)`, `color: var(--ov-tag-${tom}-texto)`]);
  }
  assert.deepEqual(declaracoesEm(c, '', '.ov-tag-ponto'), ['width: 6px', 'height: 6px', 'flex: none', 'border-radius: var(--ov-raio-pill)', 'background: var(--ov-neutro)']);
  for (const [tom, cor] of [['info', 'info'], ['atencao', 'atencao'], ['erro', 'erro'], ['sucesso', 'sucesso']]) {
    assert.deepEqual(declaracoesEm(c, '', `.ov-tag[data-tom="${tom}"] .ov-tag-ponto`), [`background: var(--ov-${cor})`]);
  }
  assert.deepEqual(declaracoesEm(c, '', '.ov-tag[data-tom="critico"]'), ['gap: 4px', 'background: var(--ov-critico)', 'color: var(--ov-sobre-erro)']);
  assert.deepEqual(declaracoesEm(c, '', '.ov-tag[data-tom="critico"] svg'), ['width: 14px', 'height: 14px', 'flex: none']);
  assert.deepEqual(declaracoesEm(c, '', '.ov-tag .ov-tnum'), ['font-variant-numeric: tabular-nums']);
});

test('filetes: os seis tons do indicador a 3px por sombra interna (não borda); a pendência reta a 2px', () => {
  const t = ATUAL.telas;
  const COR = { neutro: 'ov-neutro', info: 'ov-info', andamento: 'ov-status-andamento', atencao: 'ov-atencao', erro: 'ov-erro', sucesso: 'ov-sucesso' };
  for (const [tom, cor] of Object.entries(COR)) assert.deepEqual(declaracoesEm(t, '', `.ov-indicador[data-filete="${tom}"]`), [`box-shadow: inset 3px 0 0 var(--${cor})`]);
  // Em alerta, a borda e o filete em ov-destaque (o filete de alerta substitui
  // o de status), com ou sem data-filete: mesma força, logo depois dos filetes.
  assert.deepEqual(declaracoesEm(t, '', '.ov-indicador[data-alerta="true"]'), ['border-color: var(--ov-destaque)', 'box-shadow: inset 3px 0 0 var(--ov-destaque)']);
  const ordem = chaves(t);
  assert.equal(ordem.indexOf(ALERTA), ordem.indexOf('|.ov-indicador[data-filete="sucesso"]') + 1);
  for (const tom of ['erro', 'atencao']) assert.deepEqual(declaracoesEm(t, '', `.ov-pendencia[data-tom="${tom}"]`), [`box-shadow: inset 2px 0 0 var(--ov-${tom})`]);
  assert.doesNotMatch(declaracoesEm(t, '', '.ov-pendencia').join('; '), /border-radius/);
});

test('toque: campo, campo de linha, textarea, abas internas, conta da barra, chip e o ✕ com 48', () => {
  assert.deepEqual(declaracoesEm(ATUAL.controles, TOQUE, '.ov-campo'), ['height: var(--ov-altura-toque)']);
  assert.deepEqual(declaracoesEm(ATUAL.controles, TOQUE, 'textarea.ov-campo'), ['min-height: var(--ov-altura-toque)', 'padding: 11px 12px']);
  // 1 de borda + 11 + 24 + 11 + 1 = 48: a primeira linha no meio, como no input.
  assert.equal(1 + 11 + 24 + 11 + 1, 48);
  assert.deepEqual(declaracoesEm(ATUAL.janelas, TOQUE, '.ov-abas-internas button'), ['height: var(--ov-altura-toque)']);
  assert.deepEqual(declaracoesEm(ATUAL.casca, TOQUE, '.ov-superior .ov-conta'), ['height: var(--ov-altura-toque)']);
  assert.deepEqual(declaracoesEm(ATUAL.telas, TOQUE, '.ov-chip-filtro'), ['min-height: var(--ov-altura-toque)']);
  assert.deepEqual(declaracoesEm(ATUAL.telas, TOQUE, '.ov-chip-filtro button'), ['width: var(--ov-altura-toque)', 'height: var(--ov-altura-toque)']);
  // O comentário da v3.13 ("o campo não vai a 48") foi reescrito.
  assert.doesNotMatch(ATUAL.controles, /o campo não vai a\s+48 em tela nenhuma/);
});

test('botão: .ov-motivo some fora do toque e aparece nele; reticências só por opacidade, paradas com movimento reduzido; ícone de 18', () => {
  const c = ATUAL.controles;
  assert.deepEqual(declaracoesEm(c, '', '.ov-motivo'), ['display: none', 'margin: 4px 0 0', 'font: 400 12px/16px var(--font-sans)', 'color: var(--ov-texto-terciario)']);
  assert.deepEqual(declaracoesEm(c, TOQUE, '.ov-motivo'), ['display: block']);
  assert.deepEqual(declaracoesEm(c, '', '.ov-btn[aria-busy="true"]'), ['cursor: progress']);
  assert.deepEqual(declaracoesEm(c, '', '.ov-reticencias > span'), ['opacity: .3', 'animation: ovReticencia 1.2s ease-in-out infinite']);
  assert.match(c, /@keyframes ovReticencia \{ 0%, 60%, 100% \{ opacity: \.3; \} 30% \{ opacity: 1; \} \}/);
  assert.deepEqual(declaracoesEm(c, MOVIMENTO, '.ov-reticencias > span'), ['animation: none', 'opacity: 1']);
  assert.deepEqual(declaracoesEm(c, '', '.ov-btn-icone svg'), ['width: 18px', 'height: 18px', 'flex: none']);
  // O aria-busy não mexe em largura, opacidade nem variante.
  for (const r of regras(c)) if (r.seletores.some((s) => s.includes('aria-busy'))) assert.doesNotMatch(r.corpo, /width|opacity|background|color:/);
});

test('tabela no tablet e rolagem: a coluna sai só entre 768 e 1023; a .ov-rolagem com capas locais e sombras presas', () => {
  const t = ATUAL.telas;
  assert.deepEqual(declaracoesEm(t, TABLET, '.ov-tabela :is(th, td)[data-some-no-tablet]'), ['display: none']);
  assert.equal(regras(t).filter((r) => r.seletores.some((s) => s.includes('data-some-no-tablet'))).length, 1);
  const rolagem = declaracoesEm(t, '', '.ov-rolagem').join('; ');
  assert.match(rolagem, /overflow-x: auto/);
  assert.equal((rolagem.match(/ local/g) ?? []).length, 2);
  assert.equal((rolagem.match(/ scroll/g) ?? []).length, 2);
  // A sombra: ov-texto-secundario (claro no escuro, escuro no claro), a 40% na
  // borda (a cor em -150% do raio), trocável por --rolagem-sombra; sem
  // color-mix nem token novo.
  assert.equal((rolagem.match(/var\(--rolagem-sombra, var\(--ov-texto-secundario\)\) -150%, transparent/g) ?? []).length, 2);
  assert.doesNotMatch(rolagem, /ov-veu|color-mix/);
});

test('pular: fora da tela até o foco por teclado, aí no topo acima de tudo com o anel do livro; 48 no toque', () => {
  const p = declaracoesEm(ATUAL.casca, '', '.ov-pular');
  for (const d of ['position: fixed', 'z-index: calc(var(--ov-z-toast) + 1)', 'transform: translateY(calc(-100% - 16px - env(safe-area-inset-top, 0px)))']) assert.ok(p.includes(d), d);
  assert.deepEqual(declaracoesEm(ATUAL.casca, '', '.ov-pular:focus-visible'), ['transform: none', 'outline: 2px solid var(--ov-foco)', 'outline-offset: 2px']);
  assert.deepEqual(declaracoesEm(ATUAL.casca, TOQUE, '.ov-pular'), ['height: var(--ov-altura-toque)']);
});

test('os importáveis continuam sem base; nenhum outline: none; o controles.css com o movimento reduzido dele', () => {
  for (const nome of NOMES) assert.deepEqual(problemasDeBase(`${nome}.css`, ATUAL[nome]), [], nome);
  for (const nome of NOMES) assert.doesNotMatch(ATUAL[nome], /outline:\s*(none|0)\s*[;}]/, nome);
  assert.match(ATUAL.controles, /@media \(prefers-reduced-motion: reduce\)/);
});

// ---------- Exemplo, README, versão ----------

const molduras = (secao) => secao.split(/<div class="controles-moldura[^"]*" /).slice(1);

test('exemplo: estados, tags, Crítico, seis filetes, alerta com filete, contador, progresso e rolagem nos dois temas', () => {
  const i = exemplo.indexOf('<section class="secao estados-tags">');
  assert.ok(i > 0);
  const secao = exemplo.slice(i, exemplo.indexOf('\n  </section>', i));
  const ms = molduras(secao);
  assert.deepEqual(ms.map((m) => m.slice(0, m.indexOf('>'))), ['data-theme="escuro"', 'data-theme="claro"']);
  for (const m of ms) {
    assert.match(m, /class="ov-estado" data-tom="andamento"/);
    for (const tom of ['info', 'neutro', 'atencao', 'erro', 'sucesso']) assert.match(m, new RegExp(`<span class="ov-tag" data-tom="${tom}">`));
    assert.match(m, /<span class="ov-tag">Arquivada<\/span>/);
    assert.match(m, /<span class="ov-tag" data-tom="critico"><i data-icone="triangle-alert"><\/i>Crítico<\/span>/);
    assert.ok((m.match(/<span class="ov-tag-ponto"><\/span>/g) ?? []).length >= 5);
    for (const f of ['neutro', 'info', 'andamento', 'atencao', 'erro', 'sucesso']) assert.match(m, new RegExp(`data-filete="${f}"`));
    assert.match(m, /data-filete="neutro" data-alerta="true"/);
    assert.match(m, /<span class="ov-contador-destaque">3<\/span>/);
    assert.match(m, /class="ov-progresso progresso-segmentos"/);
    assert.match(m, /--estado-cor: var\(--ov-status-andamento\)/);
    assert.match(m, /<div class="ov-cartao ov-rolagem">/);
    assert.equal((m.match(/data-some-no-tablet/g) ?? []).length, 8);
  }
});

test('exemplo: motivo, Salvando… e o Precisa de você com tags e filetes, nos dois temas; o pular nas cascas e na página', () => {
  for (const tema of ['escuro', 'claro']) {
    assert.match(exemplo, new RegExp(`disabled title="Preencha a embarcação" aria-describedby="motivo-aprovar-${tema}">Aprovar</button><span class="ov-motivo" id="motivo-aprovar-${tema}">Preencha a embarcação</span>`));
    assert.match(exemplo, new RegExp(`id="pv-${tema}">Precisa de você</h2>\\n {10}<span class="ov-tag" data-tom="erro"><span class="ov-tag-ponto"></span>Urgente`));
  }
  assert.equal((exemplo.match(/aria-busy="true"><span>Salvando<span class="ov-reticencias" aria-hidden="true"><span>\.<\/span><span>\.<\/span><span>\.<\/span><\/span><\/span><\/button>/g) ?? []).length, 4);
  assert.equal((exemplo.match(/<a class="ov-pendencia" href="#" data-tom="(erro|atencao)">/g) ?? []).length, 4);
  assert.match(exemplo, /<body>\n<a class="ov-pular" href="#exemplo-inicio">Pular para o conteúdo<\/a>/);
  assert.match(exemplo, /<a class="ov-pular" href="#tela-conveses-escuro">/);
  assert.match(exemplo, /<a class="ov-pular" href="#tela-dia-claro">/);
  assert.match(exemplo, /id="tela-conveses-escuro" tabindex="-1">Conveses<\/h1>/);
});

test('exemplo: nenhuma lateral com a conta; o rodapé só com o filete e o Recolher; a Bordo é "Pessoas e acomodação"', () => {
  for (const lateral of exemplo.split('<nav class="ov-lateral"').slice(1).map((l) => l.slice(0, l.indexOf('</nav>')))) {
    assert.doesNotMatch(lateral, /ov-conta/);
    const rodape = lateral.slice(lateral.indexOf('<div class="ov-lateral-rodape">'));
    assert.match(rodape, /^<div class="ov-lateral-rodape">\n\s*<div class="ov-lateral-grupo"><\/div>\n\s*<button class="ov-lateral-alternar"[^\n]*<\/button>\n\s*<\/div>/);
  }
  assert.doesNotMatch(exemplo, /Conveses, embarque e despacho/);
  assert.match(exemplo, /<span class="ov-lateral-marca-sub">Pessoas e acomodação<\/span>/);
  // A conta continua na barra superior.
  assert.match(exemplo, /<div class="ov-superior-direita">\n\s*<button class="ov-conta"/);
});

// A versão e a tag ficam com o teste da versão mais nova (desde a v3.20.0).
test('README com a lateral nova, a seção da versão e os contratos', () => {
  assert.match(leiame, /<span class="ov-lateral-marca-sub">Pessoas e acomodação<\/span>/);
  assert.doesNotMatch(leiame, /<button class="ov-conta" title="Ana Souza">/);
  assert.match(leiame, /### Livro v4 \(v3\.19\.0\)/);
  assert.match(leiame, /\*\*Contrato do "Salvando…"\*\*/);
  assert.match(leiame, /ignora todo clique e Enter no botão até a resposta/);
  assert.match(leiame, /\*\*Contrato do `\.ov-motivo`\*\*/);
  assert.match(leiame, /\*\*Por que a v3\.19\.0 é minor:\*\*/);
});

// ---------- As medidas, no navegador ----------

let chromium = null;
let motivo = '';
try {
  ({ chromium } = await import('playwright'));
  const navegador = await chromium.launch();
  await navegador.close();
} catch (erro) {
  chromium = null;
  motivo = `sem o Chromium do Playwright (npx playwright install chromium): ${erro.message.split('\n')[0]}`;
}

const comPagina = async (opcoes, fn) => {
  const navegador = await chromium.launch();
  try {
    const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 }, ...opcoes });
    const p = await contexto.newPage();
    await p.goto(url('exemplo/index.html').href);
    return await fn(p);
  } finally {
    await navegador.close();
  }
};
const FOLHAS = ['tokens', 'casca', 'janelas', 'telas', 'controles'].map((n) => `<link rel="stylesheet" href="${url(`css/${n}.css`).href}">`).join('');
const avulso = (corpo) => `<!doctype html><html data-theme="escuro"><head>${FOLHAS}</head><body>${corpo}</body></html>`;
const CONTROLES_AVULSOS = '<header class="ov-superior"><div class="ov-superior-direita"><button class="ov-conta">Ana Souza</button></div></header>'
  + '<div class="ov-abas-internas" role="tablist"><button role="tab" aria-selected="true">Dados</button></div>'
  + '<span class="ov-chip-filtro"><span class="campo">Empresa</span> é BRAM<button aria-label="Remover filtro"><svg width="14" height="14"></svg></button></span>';

test('medida no toque: campo 48, campo de linha 48, motivo visível, conta, abas internas, chip e ✕ com 48', { skip: chromium ? false : motivo }, async () => {
  const r = await comPagina({ hasTouch: true }, async (p) => {
    const alt = (sel) => p.locator(sel).first().evaluate((e) => e.getBoundingClientRect().height);
    const campo = { campo: await alt('#embarcacao-escuro'), linha: await alt('input[data-densidade="linha"]'), motivo: await p.locator('#motivo-aprovar-escuro').isVisible() };
    await p.setContent(avulso(CONTROLES_AVULSOS));
    const caixa = (sel) => p.locator(sel).evaluate((e) => { const b = e.getBoundingClientRect(); return [b.width, b.height]; });
    return { ...campo, conta: await alt('.ov-superior .ov-conta'), aba: await alt('.ov-abas-internas button'), chip: (await caixa('.ov-chip-filtro'))[1] >= 48, x: await caixa('.ov-chip-filtro button') };
  });
  assert.deepEqual(r, { campo: 48, linha: 48, motivo: true, conta: 48, aba: 48, chip: true, x: [48, 48] });
});

test('medida no computador: campo 44, conta 36, motivo escondido, ícone do botão 18, desabilitado a .6', { skip: chromium ? false : motivo }, async () => {
  const r = await comPagina({}, async (p) => ({
    campo: await p.locator('#embarcacao-escuro').evaluate((e) => e.getBoundingClientRect().height),
    motivo: await p.locator('#motivo-aprovar-escuro').isVisible(),
    descrito: await p.locator('[aria-describedby="motivo-aprovar-escuro"]').evaluate((e) => e.getAttribute('title') === document.getElementById(e.getAttribute('aria-describedby')).textContent),
    icone: await p.locator('.controles-moldura .ov-btn-icone svg').first().evaluate((e) => { const b = e.getBoundingClientRect(); return [b.width, b.height]; }),
    opacidade: await p.locator('button[disabled].ov-btn').first().evaluate((e) => getComputedStyle(e).opacity),
    conta: await p.locator('.ov-superior .ov-conta').first().evaluate((e) => e.getBoundingClientRect().height),
  }));
  assert.deepEqual(r, { campo: 44, motivo: false, descrito: true, icone: [18, 18], opacidade: '0.6', conta: 36 });
});

test('medida: visão selecionada 600 com contorno ov-acao; a grande continua 500 com o filete de baixo', { skip: chromium ? false : motivo }, async () => {
  const r = await comPagina({}, async (p) => {
    const estilo = (sel) => p.locator(sel).first().evaluate((e) => { const c = getComputedStyle(e); return { peso: c.fontWeight, sombra: c.boxShadow }; });
    const acao = await p.evaluate(() => { const d = document.createElement('div'); d.style.color = 'var(--ov-acao)'; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; });
    return { normal: await estilo('.ov-visoes:not([data-tamanho]) .ov-visao[aria-selected="true"]'), grande: await estilo('.ov-visoes[data-tamanho="grande"] > .ov-visao[aria-selected="true"]'), acao };
  });
  assert.equal(r.normal.peso, '600');
  assert.equal(r.normal.sombra, `${r.acao} 0px 0px 0px 1px inset`);
  assert.equal(r.grande.peso, '500');
  assert.match(r.grande.sombra, /0px -2px 0px 0px inset$/);
});

test('medida: em alerta, a borda e o filete em ov-destaque (com e sem data-filete); a pendência com o filete de 2px', { skip: chromium ? false : motivo }, async () => {
  const r = await comPagina({}, async (p) => {
    const alerta = p.locator('.estados-tags [data-alerta="true"]').first();
    return {
      sombra: await alerta.evaluate((e) => getComputedStyle(e).boxShadow),
      semFilete: await p.locator('.telas-moldura .ov-indicador[data-alerta="true"]:not([data-filete])').first().evaluate((e) => getComputedStyle(e).boxShadow),
      destaque: await alerta.evaluate((e) => { const d = document.createElement('div'); d.style.color = 'var(--ov-destaque)'; e.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }),
      borda: await alerta.evaluate((e) => getComputedStyle(e).borderLeftColor === getComputedStyle(e).borderTopColor),
      laranja: await alerta.evaluate((e) => { const d = document.createElement('div'); d.style.color = 'var(--ov-destaque)'; e.append(d); const c = getComputedStyle(d).color; d.remove(); return getComputedStyle(e).borderTopColor === c; }),
      pendencia: await p.locator('a.ov-pendencia[data-tom="erro"]').first().evaluate((e) => getComputedStyle(e).boxShadow),
    };
  });
  assert.equal(r.sombra, `${r.destaque} 3px 0px 0px 0px inset`);
  assert.equal(r.semFilete, `${r.destaque} 3px 0px 0px 0px inset`);
  assert.equal(r.borda, true);
  assert.equal(r.laranja, true);
  assert.match(r.pendencia, /2px 0px 0px 0px inset$/);
});

test('medida: a coluna data-some-no-tablet some só entre 768 e 1023; a rolagem transborda no tablet', { skip: chromium ? false : motivo }, async () => {
  const medir = (largura) => comPagina({ viewport: { width: largura, height: 900 } }, async (p) => ({
    th: await p.locator('.estados-tags th[data-some-no-tablet]').first().isVisible(),
    transborda: await p.locator('.estados-tags .ov-rolagem').first().evaluate((e) => e.scrollWidth > e.clientWidth),
  }));
  assert.equal((await medir(1440)).th, true);
  assert.deepEqual(await medir(900), { th: false, transborda: true });
  assert.equal((await medir(767)).th, true);
});

test('medida: o pular fica fora da vista sem foco e aparece no topo com o Tab', { skip: chromium ? false : motivo }, async () => {
  const r = await comPagina({}, async (p) => {
    const pular = p.locator('body > .ov-pular');
    const antes = await pular.evaluate((e) => e.getBoundingClientRect().bottom);
    await p.keyboard.press('Tab');
    const foco = await pular.evaluate((e) => ({ ativo: document.activeElement === e, topo: e.getBoundingClientRect().top, anel: getComputedStyle(e).outlineStyle, z: getComputedStyle(e).zIndex }));
    return { antes: antes <= 0, ...foco };
  });
  assert.deepEqual(r, { antes: true, ativo: true, topo: 8, anel: 'solid', z: '61' });
});

test('medida: as reticências animam e param, visíveis, com movimento reduzido', { skip: chromium ? false : motivo }, async () => {
  const ler = (opcoes) => comPagina(opcoes, (p) => p.locator('.ov-reticencias > span').first().evaluate((e) => ({ nome: getComputedStyle(e).animationName, opacidade: getComputedStyle(e).opacity })));
  assert.equal((await ler({})).nome, 'ovReticencia');
  assert.deepEqual(await ler({ reducedMotion: 'reduce' }), { nome: 'none', opacidade: '1' });
});

// A sombra da rolagem, no pixel: no meio da rolagem, as duas pontas mais
// claras (escuro) ou mais escuras (claro) que o miolo; no começo, só a da
// direita; no fim, só a da esquerda. Nos dois temas, sobre ov-superficie.
const pixels = async (p, alvo) => {
  const png = (await alvo.screenshot()).toString('base64');
  return p.evaluate(async (dados) => {
    const img = new Image();
    img.src = `data:image/png;base64,${dados}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const y = Math.floor(img.height / 2);
    const luz = (x) => { const [r, gg, b] = g.getImageData(x, y, 1, 1).data; return 0.2126 * r + 0.7152 * gg + 0.0722 * b; };
    return { esquerda: luz(1), meio: luz(Math.floor(img.width / 2)), direita: luz(img.width - 2) };
  }, png);
};

for (const tema of ['escuro', 'claro']) {
  test(`medida no tema ${tema}: a sombra da rolagem se vê nas duas pontas e some no fim`, { skip: chromium ? false : motivo }, async () => {
    const navegador = await chromium.launch();
    try {
      const p = await navegador.newPage({ viewport: { width: 800, height: 400 } });
      // Na origem do exemplo (file://): de about:blank as folhas locais não carregam.
      await p.goto(url('exemplo/index.html').href);
      await p.setContent(`<!doctype html><html data-theme="${tema}"><head>${FOLHAS}</head><body style="margin:0;padding:20px;background:var(--ov-fundo)">`
        + '<div class="ov-rolagem" style="width:400px"><div style="width:1600px;height:60px"></div></div></body></html>');
      const caixa = p.locator('.ov-rolagem');
      const ir = (x) => caixa.evaluate((e, v) => { e.scrollLeft = v === 'fim' ? e.scrollWidth : v; }, x);
      const diferenca = (m) => ({ esquerda: Math.abs(m.esquerda - m.meio), direita: Math.abs(m.direita - m.meio) });
      await ir(600);
      const meio = diferenca(await pixels(p, caixa));
      await ir(0);
      const inicio = diferenca(await pixels(p, caixa));
      await ir('fim');
      const fim = diferenca(await pixels(p, caixa));
      // Visível: 20 ou mais de luminância (0–255) na ponta; sumida: menos de 2.
      assert.ok(meio.esquerda >= 20 && meio.direita >= 20, `meio ${JSON.stringify(meio)}`);
      assert.ok(inicio.esquerda < 2 && inicio.direita >= 20, `início ${JSON.stringify(inicio)}`);
      assert.ok(fim.direita < 2 && fim.esquerda >= 20, `fim ${JSON.stringify(fim)}`);
    } finally {
      await navegador.close();
    }
  });
}

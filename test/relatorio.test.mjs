// v3.10.0 (D1 da F7, U1–U3): o relatorio.css importável sozinho com as
// .rel-* que moravam no onevessel.css, o impressao.css sem seletor global e
// com as páginas de nome, e o logo horizontal da BRAM Offshore em marca/.
// `test/fixtures/onevessel-v3.9.0.css` é o onevessel.css da tag v3.9.0, fixo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { problemasDeBase, regras, semComentario, seletores } from '../scripts/css-regras.mjs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const relatorio = ler('css/relatorio.css');
const impressao = ler('css/impressao.css');
const onevessel = ler('css/onevessel.css');
// A v3.10.0 contra a v3.9.0 é fixture com fixture: os CSS da tag v3.10.1
// (a v3.10.1 só mexeu no tokens.css). O que a v3.11.0 mudou fica com
// test/v3.11.0.test.mjs.
const relatorioV3101 = ler('test/fixtures/relatorio-v3.10.1.css');
const onevesselV3101 = ler('test/fixtures/onevessel-v3.10.1.css');
const soma = ['casca', 'janelas', 'telas', 'relatorio', 'onevessel'].map((n) => ler(`test/fixtures/${n}-v3.10.1.css`)).join('\n');
const daV390 = ler('test/fixtures/onevessel-v3.9.0.css');
const pacote = JSON.parse(ler('package.json'));

const PRINT = '@media print';

// Declarações de uma regra num @media (cabeça exata), normalizadas.
const declaracoesEm = (css, media, seletor) => {
  const r = regras(css).find((x) => x.media === media && x.seletores.includes(seletor));
  return r ? r.corpo.split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean) : null;
};
const mapa = (decls) => new Map((decls ?? []).map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));

// As três regras que mudaram (U3) e o que nasceu na v3.10.0.
const ALTERADAS = ['.rel-pagina', '.rel-tabela th', '.rel-barra'];
const NOVOS = ['.rel-pagina[data-orientacao="paisagem"]', '.rel-num', '.rel-tabela .rel-num', '.rel-estado', '.rel-barra-titulo'];

// O corpo de um @page (com as caixas de margem dentro).
const pagina = (nome) => {
  const texto = semComentario(impressao);
  const i = texto.search(new RegExp(`@page\\s+${nome}\\s*\\{`));
  if (i === -1) return null;
  let nivel = 0, j = texto.indexOf('{', i);
  const inicio = j;
  do { if (texto[j] === '{') nivel++; else if (texto[j] === '}') nivel--; j++; } while (nivel);
  return texto.slice(inicio + 1, j - 1);
};
const caixa = (corpo, nome) => corpo.match(new RegExp(`@${nome}\\s*\\{([^}]*)\\}`))?.[1].replace(/\s+/g, ' ').trim();

// ---------- relatorio.css ----------

test('relatorio.css: sem body, html, :root, *, elemento solto nem impressão; só .rel-*', () => {
  assert.deepEqual(problemasDeBase('relatorio.css', relatorio), []);
  for (const s of seletores(relatorio)) assert.match(s, /^\.rel-/, s);
  assert.doesNotMatch(semComentario(relatorio), /@media|@page/);
});

test('onevessel.css importa o relatorio.css e não tem mais nenhuma .rel-*', () => {
  assert.match(semComentario(onevessel), /@import\s+url\(["']\.\/telas\.css["']\);\s*@import\s+url\(["']\.\/relatorio\.css["']\)/);
  assert.deepEqual([...seletores(onevessel)].filter((s) => s.startsWith('.rel-')), []);
});

test('minor: toda regra do onevessel.css da v3.9.0 igual no pacote, fora as três alteradas pelo nome', () => {
  for (const r of regras(daV390)) {
    for (const s of r.seletores) {
      if (s.startsWith('@')) { assert.ok(seletores(soma).has(s), s); continue; }
      const antes = declaracoesEm(daV390, r.media, s);
      const agora = declaracoesEm(soma, r.media, s);
      if (ALTERADAS.includes(s)) assert.notDeepEqual(agora, antes, `está na lista e não mudou: ${s}`);
      else assert.deepEqual(agora, antes, `${r.media} ${s}`);
    }
  }
  // O que nasceu no onevessel.css e no relatorio.css é exatamente a lista (a
  // casca, as janelas e as telas não mudaram na v3.10.0).
  const v390 = seletores(daV390);
  assert.deepEqual([...seletores(onevesselV3101 + relatorioV3101)].filter((s) => !v390.has(s)), NOVOS);
});

test('as .rel-* da v3.9.0 moram no relatorio.css, na mesma ordem', () => {
  const ordem = (css) => regras(css).filter((r) => !r.media).flatMap((r) => r.seletores).filter((s) => s.startsWith('.rel-'));
  assert.deepEqual(ordem(relatorioV3101).filter((s) => !NOVOS.includes(s)), ordem(daV390));
});

test('alteradas: a folha pede a página "relatorio"; o th sobe para 8,5pt; a barra é interface e ocupa a área', () => {
  const folha = mapa(declaracoesEm(relatorio, '', '.rel-pagina'));
  const folhaAntes = mapa(declaracoesEm(daV390, '', '.rel-pagina'));
  assert.equal(folha.get('page'), 'relatorio');
  folha.delete('page');
  assert.deepEqual(folha, folhaAntes, 'só o page entrou');

  const th = mapa(declaracoesEm(relatorio, '', '.rel-tabela th'));
  const thAntes = mapa(declaracoesEm(daV390, '', '.rel-tabela th'));
  assert.equal(th.get('font-size'), '8.5pt');
  th.delete('font-size'); thAntes.delete('font-size');
  assert.deepEqual(th, thAntes, 'só o tamanho mudou');

  const barra = mapa(declaracoesEm(relatorio, '', '.rel-barra'));
  assert.ok(!barra.has('max-width') && !barra.has('margin'), 'sem a largura da folha');
  assert.equal(barra.get('font'), 'var(--ov-fonte-corpo)');
  assert.equal(barra.get('color'), 'var(--ov-texto)');
});

test('todo texto da folha com 8,5pt ou mais; o rodapé da tela com 8pt ou mais', () => {
  const pt = (v) => {
    const m = v.match(/([\d.]+)(px|pt)/);
    return m[2] === 'pt' ? Number(m[1]) : Number(m[1]) * 0.75;
  };
  let vistos = 0;
  for (const { seletores: ss, corpo } of regras(relatorio)) {
    const tamanho = corpo.match(/font-size:\s*([^;]+)/)?.[1] ?? corpo.match(/font:\s*\d+\s+([\d.]+(?:px|pt))/)?.[1];
    if (!tamanho) continue;
    for (const s of ss) {
      if (s.startsWith('.rel-barra') || s === '.rel-area') continue; // interface
      vistos++;
      assert.ok(pt(tamanho) >= (s === '.rel-rodape' ? 8 : 8.5), `${s}: ${tamanho}`);
    }
  }
  assert.ok(vistos >= 8, `poucos tamanhos lidos: ${vistos}`);
  assert.ok(pt(mapa(declaracoesEm(relatorio, '', '.rel-tabela th')).get('font-size')) >= 8.5);
});

test('paisagem: página de nome própria e, na tela, a proporção do A4 deitado', () => {
  const p = mapa(declaracoesEm(relatorio, '', '.rel-pagina[data-orientacao="paisagem"]'));
  assert.equal(p.get('page'), 'relatorio-paisagem');
  assert.equal(p.get('aspect-ratio'), '297 / 210');
  assert.equal(p.get('max-width'), '297mm');
});

test('coluna numérica à direita com tabular-nums, também no th; estado sem fundo nem cor de estado', () => {
  for (const s of ['.rel-num', '.rel-tabela .rel-num']) {
    const m = mapa(declaracoesEm(relatorio, '', s));
    assert.equal(m.get('text-align'), 'right', s);
    assert.equal(m.get('font-variant-numeric'), 'tabular-nums', s);
  }
  const estado = mapa(declaracoesEm(relatorio, '', '.rel-estado'));
  assert.equal(estado.get('background'), 'none');
  assert.equal(estado.get('color'), 'inherit');
  assert.doesNotMatch([...estado.values()].join(' '), /--ov-(sucesso|atencao|erro|info|neutro)/);
});

test('barra: o título ocupa o resto e a barra só usa tokens --ov-* e a fonte do sistema', () => {
  const titulo = mapa(declaracoesEm(relatorio, '', '.rel-barra-titulo'));
  assert.equal(titulo.get('flex'), '1');
  assert.equal(titulo.get('min-width'), '0');
  for (const s of ['.rel-barra', '.rel-barra-titulo']) {
    const texto = declaracoesEm(relatorio, '', s).join('; ');
    assert.doesNotMatch(texto, /--rel-|--font-rel|#[0-9a-f]{3,6}\b/i, s);
  }
});

// ---------- impressao.css ----------

test('impressao.css: sem @page sem nome, sem visibility, sem body, sem position: absolute; só .rel-*', () => {
  const texto = semComentario(impressao);
  assert.doesNotMatch(texto, /@page\s*\{/);
  assert.doesNotMatch(texto, /visibility/);
  assert.doesNotMatch(texto, /\bbody\b|\bhtml\b|:root/);
  assert.doesNotMatch(texto, /position\s*:\s*absolute/);
  const paginas = [];
  for (const s of seletores(texto)) {
    if (s.startsWith('@page')) { paginas.push(s); continue; }
    assert.match(s, /^\.rel-/, s);
  }
  assert.deepEqual(paginas, ['@page relatorio', '@page relatorio-paisagem']);
});

test('as duas páginas: A4 em pé e deitado, 16mm, rodapé de --rel-rodape e "pág. n/N", Plex 8pt em rel-mudo', () => {
  for (const [nome, size] of [['relatorio', 'A4 portrait'], ['relatorio-paisagem', 'A4 landscape']]) {
    const corpo = pagina(nome);
    assert.ok(corpo, nome);
    assert.match(corpo, new RegExp(`size:\\s*${size};`), nome);
    assert.match(corpo, /margin:\s*16mm;/, nome);
    const esquerda = caixa(corpo, 'bottom-left');
    const direita = caixa(corpo, 'bottom-right');
    assert.match(esquerda, /content: var\(--rel-rodape, ""\);/, nome);
    assert.match(direita, /content: "pág\. " counter\(page\) "\/" counter\(pages\);/, nome);
    for (const c of [esquerda, direita]) {
      assert.match(c, /font-family: var\(--font-rel-sans\);/, nome);
      assert.match(c, /font-size: 8pt;/, nome);
      assert.match(c, /color: var\(--rel-mudo\);/, nome);
    }
  }
});

test('@media print: barra e rodapé da folha somem, preto e branco, logo de 10mm, linha inteira e cabeçalho repetido', () => {
  const em = (s) => mapa(declaracoesEm(impressao, PRINT, s));
  assert.equal(em('.rel-barra').get('display'), 'none');
  assert.equal(em('.rel-rodape').get('display'), 'none');
  assert.equal(em('.rel-timbre').get('border-bottom-color'), '#000');
  assert.equal(em('.rel-timbre img').get('height'), '10mm');
  assert.equal(em('.rel-timbre img').get('filter'), 'grayscale(1)');
  for (const s of ['.rel-titulo', '.rel-secao', '.rel-resumo b']) assert.equal(em(s).get('color'), '#000', s);
  assert.equal(em('.rel-resumo').get('background'), 'none');
  assert.match(em('.rel-resumo').get('border'), /solid/);
  for (const s of ['.rel-area', '.rel-pagina']) assert.equal(em(s).get('background'), 'none', s);
  assert.equal(em('.rel-pagina[data-orientacao="paisagem"]').get('aspect-ratio'), 'auto');
  assert.equal(em('.rel-tabela tr').get('break-inside'), 'avoid');
  assert.equal(em('.rel-tabela thead').get('display'), 'table-header-group');
});

// ---------- logo e pacote ----------

test('logo: marca/bram-offshore-horizontal.png com os bytes do design system (2425×1073)', () => {
  const bytes = readFileSync(new URL('../marca/bram-offshore-horizontal.png', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '86070cbcbbc1bb3d70c699b1eb049dc62d5ac295f421f35aecee3457811e7a95');
  assert.equal(bytes.readUInt32BE(16), 2425);
  assert.equal(bytes.readUInt32BE(20), 1073);
});

// A versão do pacote fica com o teste da versão mais nova (test/temas.test.mjs).
test('pacote: relatorio.css e marca/ em exports e files', () => {
  assert.equal(pacote.exports['./css/relatorio.css'], './css/relatorio.css');
  assert.equal(pacote.exports['./css/impressao.css'], './css/impressao.css');
  assert.equal(pacote.exports['./marca/*'], './marca/*');
  assert.ok(pacote.files.includes('marca'));
});

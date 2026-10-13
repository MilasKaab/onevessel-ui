// O núcleo da Paleta de comandos (js/paleta-nucleo.js): filtro, seleção,
// teclado, ARIA, atalho e anúncio. Sem React e sem DOM.
//
// Os testes são os do núcleo em `onevessel-paradas/test/paleta.test.mjs`, que
// por sua vez são os da Bordo (`onevessel-bordo/test/paleta.test.mjs`)
// transpostos: os mesmos casos, as mesmas expectativas. As fontes e a tela
// ficam nos testes de cada app.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as nucleo from '../js/paleta-nucleo.js';
import { focoQueGira } from '../js/foco-preso.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ler = (rel) => readFileSync(path.join(RAIZ, rel), 'utf8');

const { abrir, digitar, atualizar, mover, teclar, normalizar, anuncio, atributosDoCampo, ehAtalhoDeAbrir, nomeDoAtalho } =
  nucleo;

const item = (id, rotulo, extra = {}) => ({ id, rotulo, ...extra });
const FONTES = [
  { id: 'ir', rotulo: 'Ir para', tipo: 'ir-para', itens: [item('p', 'Pessoas'), item('c', 'Conveses')] },
  { id: 'acoes', rotulo: 'Ações', tipo: 'acoes', itens: [item('cad', 'Cadastrar pessoa'), item('tema', 'Tema escuro')] },
  { id: 'cam', rotulo: 'Camarotes', tipo: 'registros', itens: [item('1', 'Camarote São João'), item('2', 'Enfermaria')] },
];
const rotulosVisiveis = (estado) => estado.grupos.flatMap((g) => g.itens.map((i) => i.rotulo));

test('núcleo: grupos na ordem registros → ações → Ir para, e registro só com texto', () => {
  const vazio = abrir(FONTES);
  assert.deepEqual(vazio.grupos.map((g) => g.id), ['acoes', 'ir']);
  const comTexto = digitar(FONTES, 'a');
  assert.deepEqual(comTexto.grupos.map((g) => g.id), ['cam', 'acoes', 'ir']);
});

test('núcleo: o primeiro resultado já vem selecionado', () => {
  assert.equal(abrir(FONTES).selecionado, 'acoes:cad');
  assert.equal(digitar(FONTES, 'camarote').selecionado, 'cam:1');
  assert.equal(digitar(FONTES, 'nada que exista').selecionado, null);
});

test('núcleo: filtro sem acento e sem caixa, cada palavra em qualquer ordem', () => {
  assert.equal(normalizar('  São   JOÃO '), 'sao joao');
  assert.deepEqual(rotulosVisiveis(digitar(FONTES, 'SAO joao')), ['Camarote São João']);
  assert.deepEqual(rotulosVisiveis(digitar(FONTES, 'joão camarote')), ['Camarote São João']);
  assert.deepEqual(rotulosVisiveis(digitar(FONTES, 'pessoa')), ['Cadastrar pessoa', 'Pessoas']);
  // Termos casam além do rótulo.
  const comTermo = [{ id: 'g', rotulo: 'G', tipo: 'acoes', itens: [item('x', 'Trocar para Navio Dois', { termos: ['embarcação'] })] }];
  assert.deepEqual(rotulosVisiveis(digitar(comTermo, 'embarcacao')), ['Trocar para Navio Dois']);
});

test('núcleo: ↑↓ andam e dão a volta; Enter abre o selecionado; Esc fecha', () => {
  let estado = abrir(FONTES); // Cadastrar, Tema, Pessoas, Conveses
  estado = teclar(estado, 'ArrowDown').estado;
  assert.equal(estado.selecionado, 'acoes:tema');
  estado = mover(mover(estado, 1), 1);
  assert.equal(estado.selecionado, 'ir:c');
  estado = teclar(estado, 'ArrowDown').estado;
  assert.equal(estado.selecionado, 'acoes:cad', 'do último volta ao primeiro');
  estado = teclar(estado, 'ArrowUp').estado;
  assert.equal(estado.selecionado, 'ir:c', 'do primeiro vai ao último');

  const enter = teclar(estado, 'Enter');
  assert.equal(enter.tratada, true);
  assert.equal(enter.efeito.tipo, 'abrir');
  assert.equal(enter.efeito.item.rotulo, 'Conveses');

  assert.deepEqual(teclar(estado, 'Escape').efeito, { tipo: 'fechar' });
  const letra = teclar(estado, 'a');
  assert.equal(letra.tratada, false, 'letra é do campo');
  assert.equal(letra.efeito, null);
  assert.equal(teclar(digitar(FONTES, 'zzz'), 'Enter').efeito, null, 'Enter sem resultado não faz nada');
});

test('núcleo: resposta do servidor chegando — quem estava no primeiro continua no primeiro; quem andou fica', () => {
  const pessoas = (itens, aviso) => ({ id: 'pes', rotulo: 'Pessoas', tipo: 'registros', filtrado: true, itens, aviso });
  const antes = [pessoas([], 'Buscando pessoas…'), ...FONTES];
  let estado = digitar(antes, 'pe');
  assert.equal(estado.selecionado, 'acoes:cad');
  const depois = [pessoas([item('a', 'Ana Pereira')]), ...FONTES];
  assert.equal(atualizar(estado, depois).selecionado, 'pes:a');

  estado = mover(digitar(antes, 'pe'), 1);
  assert.equal(atualizar(estado, depois).selecionado, estado.selecionado);
  // Grupo já filtrado no servidor não é filtrado de novo (casou pelo nome de guerra).
  assert.deepEqual(rotulosVisiveis(digitar([pessoas([item('b', 'Bruno Lima')])], 'bigode')), ['Bruno Lima']);
});

test('núcleo: ARIA do campo e o anúncio de resultados', () => {
  const estado = mover(abrir(FONTES), 1);
  assert.deepEqual(atributosDoCampo(estado, 'lista'), {
    role: 'combobox',
    'aria-controls': 'lista',
    'aria-expanded': true,
    'aria-autocomplete': 'list',
    'aria-activedescendant': 'lista-opcao-1',
  });
  assert.equal(atributosDoCampo(digitar(FONTES, 'zzz'), 'lista')['aria-activedescendant'], undefined);
  assert.equal(anuncio(abrir(FONTES)), '4 resultados');
  assert.equal(anuncio(digitar(FONTES, 'enfermaria')), '1 resultado');
  assert.equal(anuncio(digitar(FONTES, 'zzz')), 'Nenhum resultado');
  const offline = [{ id: 'pes', rotulo: 'Pessoas', tipo: 'registros', filtrado: true, itens: [], aviso: 'Sem conexão para buscar pessoas' }];
  assert.equal(anuncio(digitar([...offline, ...FONTES], 'pessoa')), '2 resultados. Sem conexão para buscar pessoas');
});

test('núcleo: Ctrl K e ⌘K abrem; com Alt ou Shift, não', () => {
  const k = (extra) => ({ key: 'k', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...extra });
  assert.ok(ehAtalhoDeAbrir(k({ ctrlKey: true })));
  assert.ok(ehAtalhoDeAbrir(k({ metaKey: true, key: 'K' })));
  assert.ok(!ehAtalhoDeAbrir(k({})));
  assert.ok(!ehAtalhoDeAbrir(k({ ctrlKey: true, shiftKey: true })));
  assert.ok(!ehAtalhoDeAbrir(k({ ctrlKey: true, altKey: true })));
  assert.equal(nomeDoAtalho('MacIntel'), '⌘K');
  assert.equal(nomeDoAtalho('Win32'), 'Ctrl K');
});

test('núcleo: o foco preso é o de foco-preso.js, reexportado', () => {
  assert.match(ler('js/paleta-nucleo.js'), /export \{ focoQueGira \} from "\.\/foco-preso\.js";/);
  assert.equal(nucleo.focoQueGira, focoQueGira);
  assert.equal(nucleo.focoQueGira(['campo', 'fechar'], 'fechar', false), 'campo');
  assert.equal(nucleo.focoQueGira(['campo', 'fechar'], 'campo', true), 'fechar');
});

test('núcleo: sem React, sem DOM, sem nada de app', () => {
  const fonte = ler('js/paleta-nucleo.js');
  const imports = [...fonte.matchAll(/from "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(imports, ['./foco-preso.js']);
  const foco = ler('js/foco-preso.js');
  assert.ok(!/\bimport\b/.test(foco));
  for (const proibido of ['document', 'window', 'bordo', 'paradas', 'CHAVES', 'pode(']) {
    assert.ok(!fonte.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').includes(proibido), proibido);
  }
});

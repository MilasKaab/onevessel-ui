// v3.10.1: o tokens.css declara o color-scheme junto do tema, para os
// controles nativos (ícone do calendário e do relógio) seguirem o fundo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ler = (caminho) => readFileSync(resolve(raiz, caminho), 'utf8');
const tokens = ler('css/tokens.css');
const pacote = JSON.parse(ler('package.json'));

// Seletor da regra -> valores de color-scheme declarados nela.
const regras = [...tokens.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({
  seletores: m[1].replace(/\/\*[\s\S]*?\*\//g, '').split(',').map((s) => s.trim()),
  esquemas: [...m[2].matchAll(/(?:^|;|\s)color-scheme:\s*([^;]+);/g)].map((e) => e[1].trim()),
}));
const esquemaDe = (seletor) =>
  regras.filter((r) => r.seletores.includes(seletor)).flatMap((r) => r.esquemas);

test('tokens.css: color-scheme dark no padrão (:root) e no escuro', () => {
  assert.deepEqual(esquemaDe(':root'), ['dark']);
  assert.deepEqual(esquemaDe('[data-theme="escuro"]'), ['dark']);
});

test('tokens.css: color-scheme light no claro', () => {
  assert.deepEqual(esquemaDe('[data-theme="claro"]'), ['light']);
});

test('tokens.css: color-scheme só nos três seletores de tema', () => {
  const fora = regras.filter(
    (r) => r.esquemas.length && !r.seletores.every((s) => [':root', '[data-theme="escuro"]', '[data-theme="claro"]'].includes(s))
  );
  assert.deepEqual(fora, []);
});

test('pacote: versão 3.10.1', () => {
  assert.equal(pacote.version, '3.10.1');
});

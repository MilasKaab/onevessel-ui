// O foco preso dos diálogos da casca (js/foco-preso.js): a folha do "Mais" e
// a paleta. Os casos são os do núcleo em `onevessel-paradas/test/paleta.test.mjs`
// ("o foco preso é o mesmo da folha"); a prova de que a folha de cada app usa
// este arquivo fica no teste do app.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { FOCAVEIS, focoQueGira } from '../js/foco-preso.js';

test('foco preso: Tab no último volta ao primeiro; Shift+Tab no primeiro vai ao último', () => {
  assert.equal(focoQueGira(['a', 'b'], 'b', false), 'a');
  assert.equal(focoQueGira(['campo', 'fechar'], 'fechar', false), 'campo');
  assert.equal(focoQueGira(['campo', 'fechar'], 'campo', true), 'fechar');
});

test('foco preso: o que conta como focável', () => {
  assert.equal(
    FOCAVEIS,
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
});

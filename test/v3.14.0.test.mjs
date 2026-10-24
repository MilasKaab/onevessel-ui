// v3.14.0 (PW-9, decidido em 24/10): um PWA só, o da OneVessel; módulos não
// instaláveis. Saem os manifestos dos três módulos e os PNGs deles; ficam o
// manifesto e os ícones da plataforma e o icone.svg de cada módulo. Os 9 que
// ficam têm os bytes da v3.13.0: são os que os testes dos apps cobram por
// sha256. Nenhum CSS muda, então não há fixture.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

const url = (p) => new URL(`../${p}`, import.meta.url);
const ler = (p) => readFileSync(url(p), 'utf8');
const sha256 = (p) => createHash('sha256').update(readFileSync(url(p))).digest('hex');
const pacote = JSON.parse(ler('package.json'));

function arquivosDe(pasta) {
  return readdirSync(url(pasta)).flatMap((nome) => {
    const rel = `${pasta}/${nome}`;
    return statSync(url(rel)).isDirectory() ? arquivosDe(rel) : [rel];
  });
}

// Os da tag v3.13.0, literais.
const FICAM = {
  'manifestos/plataforma.webmanifest': '45bf19dcffe5f4db1eb1de5171c3f7642c7cd23efbf25c4d67f1dca040a44bcb',
  'icons/plataforma/apple-touch-icon-180.png': 'af5867a6d7844c326e317faef86061e7f468c2c0e9e1140bddb9ca024687929e',
  'icons/plataforma/icone-192.png': '183b143e2a3a480b64451837d9cfc48cc4fab4ee590c93ecfa59bc2ddbe6a079',
  'icons/plataforma/icone-512.png': 'a045ddec116939f433295652e046049e2e0f2c68cbe5ce806649ad680a58ae4c',
  'icons/plataforma/icone.svg': '60a48063e53505523fbb9c0dadcc6cdb55a4bf6e8ff26a068f3c0a5224dca834',
  'icons/plataforma/mascaravel-512.png': '7503c31e3fcb2bc921d7aa853df46eae487c11cd9e2e396dffbb6cea64e95859',
  'icons/bordo/icone.svg': 'ccc4e486f7f6f60fc64fd35b700b7616c08e21609c37ce57b118a0c4374a335b',
  'icons/materiais/icone.svg': 'd6346b59c5e085e216ce00ca1ac9bfd6d38bfa807580a8cce7336e4e2a434725',
  'icons/paradas/icone.svg': 'fc952eb53c2962a37af1c2e7b1622f0908b33ede6883c3af59e06d14cc54ec1f',
};

const MODULOS = ['bordo', 'materiais', 'paradas'];

// ---------- Arquivos ----------

test('manifestos/ e icons/: exatamente os 9 que ficam', () => {
  assert.deepEqual([...arquivosDe('manifestos'), ...arquivosDe('icons')].sort(), Object.keys(FICAM).sort());
});

test('os 9 que ficam: os bytes da v3.13.0 (sha256)', () => {
  for (const [arquivo, hash] of Object.entries(FICAM)) assert.equal(sha256(arquivo), hash, arquivo);
});

test('os módulos não têm manifesto nem PNG', () => {
  for (const app of MODULOS) {
    assert.ok(!existsSync(url(`manifestos/${app}.webmanifest`)), app);
    assert.deepEqual(readdirSync(url(`icons/${app}`)), ['icone.svg'], app);
  }
});

// ---------- Script dos ícones ----------

test('gerar-icones: PNG só para o instalável, a plataforma; os módulos só com o icone.svg', () => {
  const script = ler('scripts/gerar-icones.mjs');
  const instalaveis = [...script.matchAll(/pasta: '([a-z]+)'[^\n]*instalavel: true/g)].map((m) => m[1]);
  assert.deepEqual(instalaveis, ['plataforma']);
  assert.match(script, /for \(const \[arquivo, lado, escala\] of app\.instalavel \? saidas : \[\]\)/);
  assert.match(script, /writeFileSync\(resolve\(pasta, 'icone\.svg'\), svg\(app, 512, 1\)\)/);
});

// ---------- Exemplo ----------

test('exemplo: PWA da OneVessel com o PNG; módulos com o icone.svg, não instaláveis', () => {
  const exemplo = ler('exemplo/index.html');
  const i = exemplo.indexOf('<h2 class="ov-titulo-1">Ícones de PWA</h2>');
  assert.ok(i > 0);
  const secao = exemplo.slice(i, exemplo.indexOf('</section>', i));
  const imagens = [...secao.matchAll(/<img src="\.\.\/([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(imagens, ['icons/plataforma/icone-192.png', 'icons/materiais/icone.svg', 'icons/paradas/icone.svg', 'icons/bordo/icone.svg']);
  for (const img of imagens) assert.ok(existsSync(url(img)), img);
  assert.match(secao, /PWA da OneVessel/);
  assert.match(secao, /Ícones dos módulos \(não instaláveis\)/);
});

// ---------- Pacote ----------

test('README: um PWA só, sem manifesto de módulo', () => {
  const readme = ler('README.md');
  assert.match(readme, /[Uu]m PWA só, o da OneVessel; módulos não instaláveis/);
  assert.doesNotMatch(readme, /manifestos\/(bordo|paradas|materiais)\.webmanifest/);
  assert.match(readme, /npm i "onevessel-ui@github:MilasKaab\/onevessel-ui#v3\.14\.0"/);
});

test('pacote: manifestos/ e icons/ continuam publicados; exports sem mudança', () => {
  assert.ok(pacote.files.includes('manifestos'));
  assert.ok(pacote.files.includes('icons'));
  assert.equal(pacote.exports['./icons/*'], './icons/*');
  assert.equal(pacote.exports['./manifestos/*'], undefined);
});

// A versão do pacote fica com o teste da versão mais nova.
test('pacote: versão 3.14.0', () => {
  assert.equal(pacote.version, '3.14.0');
});

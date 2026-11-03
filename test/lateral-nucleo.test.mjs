// A lateral com o painel aberto no modo foco (js/lateral-nucleo.js,
// lateralNoFoco; AJ8, v3.23.0). O resto do núcleo (ler, gravar, alternar,
// aplicar, botão, outra aba) está nos testes da v3.15.0 e da v3.15.1.
import { test } from "node:test";
import assert from "node:assert/strict";

import { CHAVE_LATERAL, FOCO_ATE, FOCO_DE, alternarLateral, lateralNoFoco, lerLateral } from "../js/lateral-nucleo.js";

const aberto = { painelAberto: true, lateralDaPessoa: "aberta", mexeuComPainelAberto: false };

test("a faixa é de 1024 a 1279: as larguras de borda", () => {
  assert.equal(FOCO_DE, 1024);
  assert.equal(FOCO_ATE, 1280);
  assert.equal(lateralNoFoco({ ...aberto, largura: 1023 }), "aberta", "1023: Folha, nada muda");
  assert.equal(lateralNoFoco({ ...aberto, largura: 1024 }), "recolhida");
  assert.equal(lateralNoFoco({ ...aberto, largura: 1279 }), "recolhida");
  assert.equal(lateralNoFoco({ ...aberto, largura: 1279.5 }), "recolhida", "zoom: ainda abaixo de 1280");
  assert.equal(lateralNoFoco({ ...aberto, largura: 1280 }), "aberta", "1280: nada muda");
  assert.equal(lateralNoFoco({ ...aberto, largura: 1920 }), "aberta");
  assert.equal(lateralNoFoco({ ...aberto, largura: 600 }), "aberta");
});

test("fora da faixa ou com o painel fechado, a escolha da pessoa, qualquer que seja", () => {
  for (const lateralDaPessoa of ["aberta", "recolhida"]) {
    for (const largura of [900, 1023, 1024, 1279, 1280, 1440]) {
      assert.equal(lateralNoFoco({ largura, painelAberto: false, lateralDaPessoa }), lateralDaPessoa, `${largura} fechado`);
    }
    for (const largura of [900, 1023, 1280, 1440]) {
      assert.equal(lateralNoFoco({ largura, painelAberto: true, lateralDaPessoa }), lateralDaPessoa, `${largura} aberto`);
    }
  }
});

test("na faixa, quem já recolheu continua recolhida; mexeu com o painel aberto, vale a escolha", () => {
  assert.equal(lateralNoFoco({ largura: 1100, painelAberto: true, lateralDaPessoa: "recolhida" }), "recolhida");
  assert.equal(lateralNoFoco({ largura: 1100, painelAberto: true, lateralDaPessoa: "aberta", mexeuComPainelAberto: true }), "aberta");
  assert.equal(lateralNoFoco({ largura: 1100, painelAberto: true, lateralDaPessoa: "recolhida", mexeuComPainelAberto: true }), "recolhida");
});

test("sem mexeuComPainelAberto vale false; escolha inválida é \"aberta\", como no lerLateral", () => {
  assert.equal(lateralNoFoco({ largura: 1100, painelAberto: true, lateralDaPessoa: "aberta" }), "recolhida");
  assert.equal(lateralNoFoco({ largura: 1300, painelAberto: true, lateralDaPessoa: "qualquer" }), "aberta");
  assert.equal(lateralNoFoco({ largura: 1300, painelAberto: false, lateralDaPessoa: undefined }), "aberta");
});

// O que o app faz, com um armazenamento de mentira que conta as gravações:
// abrir, trocar de registro, reabrir a lateral, trocar de novo, fechar.
function app(largura, guardado) {
  const dados = new Map(guardado ? [[CHAVE_LATERAL, guardado]] : []);
  const gravacoes = [];
  const storage = { getItem: (c) => dados.get(c) ?? null, setItem: (c, v) => { gravacoes.push(v); dados.set(c, v); } };
  const s = { largura, painelAberto: false, lateralDaPessoa: lerLateral(storage), mexeuComPainelAberto: false, registro: null };
  const tela = () => lateralNoFoco(s);
  return {
    storage, gravacoes, tela,
    abrir(id) { s.painelAberto = true; s.registro = id; },
    trocar(id) { s.registro = id; },
    alternar() {
      s.lateralDaPessoa = alternarLateral(storage, tela());
      if (s.painelAberto) s.mexeuComPainelAberto = true;
    },
    fechar() { s.painelAberto = false; s.mexeuComPainelAberto = false; s.registro = null; },
    redimensionar(l) { s.largura = l; },
  };
}

test("a 1100 com a lateral aberta: abre recolhe, troca não mexe, reabrir vale até fechar, fechar volta; nada gravado pelo automático", () => {
  const a = app(1100, "aberta");
  assert.equal(a.tela(), "aberta");
  a.abrir(1);
  assert.equal(a.tela(), "recolhida", "abrir recolhe");
  a.trocar(2);
  assert.equal(a.tela(), "recolhida", "trocar de registro continua recolhida");
  assert.deepEqual(a.gravacoes, [], "o recolhimento automático não grava");
  assert.equal(a.storage.getItem(CHAVE_LATERAL), "aberta");
  a.alternar();
  assert.equal(a.tela(), "aberta", "reabriu");
  a.trocar(3);
  a.trocar(4);
  assert.equal(a.tela(), "aberta", "não recolhe de novo a cada troca");
  a.fechar();
  assert.equal(a.tela(), "aberta", "fechar volta ao de antes");
  a.abrir(5);
  assert.equal(a.tela(), "recolhida", "um painel novo recolhe de novo");
  a.fechar();
  assert.equal(a.tela(), "aberta");
  assert.equal(a.storage.getItem(CHAVE_LATERAL), "aberta", "a escolha guardada é a mesma do começo");
});

test("a 1100 com a lateral recolhida pela pessoa: abrir e fechar não mudam nada", () => {
  const a = app(1100, "recolhida");
  a.abrir(1);
  assert.equal(a.tela(), "recolhida");
  a.fechar();
  assert.equal(a.tela(), "recolhida");
  assert.deepEqual(a.gravacoes, []);
});

test("recolher de novo com o painel aberto é escolha: grava e vale depois de fechar", () => {
  const a = app(1100, "aberta");
  a.abrir(1);
  a.alternar();
  a.alternar();
  assert.equal(a.tela(), "recolhida");
  a.fechar();
  assert.equal(a.tela(), "recolhida");
  assert.equal(a.storage.getItem(CHAVE_LATERAL), "recolhida");
});

test("a 1023 e a 1280 o painel não mexe na lateral; redimensionar com o painel aberto entra e sai da regra", () => {
  for (const largura of [1023, 1280]) {
    const a = app(largura, "aberta");
    a.abrir(1);
    assert.equal(a.tela(), "aberta", `${largura}`);
    a.fechar();
    assert.equal(a.tela(), "aberta", `${largura}`);
  }
  const a = app(1440, "aberta");
  a.abrir(1);
  assert.equal(a.tela(), "aberta");
  a.redimensionar(1200);
  assert.equal(a.tela(), "recolhida");
  a.redimensionar(1280);
  assert.equal(a.tela(), "aberta");
  assert.deepEqual(a.gravacoes, []);
});

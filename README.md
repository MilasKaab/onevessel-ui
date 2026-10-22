# onevessel-ui

Identidade compartilhada dos apps OneVessel: **Materiais**, **Paradas** e **Bordo**, mais a plataforma.

Este repositório é a única fonte das cores, tipografia, espaçamentos, CSS de componentes, fontes, ícones de PWA e do logo dos relatórios. Os apps instalam por versão; nenhum app copia valores para dentro de si.

## O que tem aqui

| Pasta | O que é |
| --- | --- |
| `tokens/tokens.json` | Fonte de tudo: cores nos dois temas, tipografia, espaçamentos, raios, sombras, tamanhos e camadas |
| `css/tokens.css` | Gerado do arquivo acima. Variáveis CSS (`--ov-*`), tema escuro na raiz e claro em `[data-theme="claro"]` |
| `css/casca.css` | Só a estrutura das telas: barra lateral (240px; 56px recolhida abaixo de 1024px), barra superior, cabeçalho e barra inferior do celular (abaixo de 768px), seletor de embarcação, conta, sincronização, menu (com o rótulo de grupo e o item da seção aberta), paleta (com a lista, o aviso e o anel do campo), folha móvel do "Mais" (com o topo, a lista e a conta, desde a v3.11.0), etiqueta, estado (`.ov-estado`), faixa e estados de tela. Importável sozinha: sem `body`, sem base de 14px, sem impressão |
| `css/janelas.css` | As camadas sobre a tela: Diálogo, Toast, Painel lateral, rodapé e alturas da folha móvel, e o `ov-btn-perigo`. Importável sozinho, como a casca (depende de `tokens.css` e `casca.css`; o `ov-btn-perigo`, da base do `controles.css`) |
| `css/telas.css` | O que vai dentro da tela (v3.7.0; o miolo do item do Precisa de você e o cartão que estica na grade desde a v3.8.0): tipografia, cartão e indicadores (grade 4/2/1), Precisa de você, visões e filtros, contador, progresso, segmentado, checkbox, tabela (lista de linhas abaixo de 768px), barra de ações em massa e esqueleto. Importável sozinho, como a casca (depende de `tokens.css` e, para o movimento reduzido, de `casca.css`) |
| `css/controles.css` | Botões e campo (v3.12.0; antes, só no `onevessel.css`): `.ov-btn` e as variantes, `.ov-campo-grupo`, `.ov-label`, `.ov-campo`, `.ov-ajuda` e `.ov-erro-campo`. Importável sozinho, como a casca (depende só de `tokens.css`) |
| `css/onevessel.css` | A base de 14px, o ícone de app e a matriz de permissões. Começa importando `casca.css`, `janelas.css`, `telas.css`, `relatorio.css` e `controles.css` |
| `css/relatorio.css` | O papel dos relatórios internos (v3.10.0): folha, timbre, resumo, seções, tabela, coluna numérica e estado com símbolo. Só `.rel-*`; importável sozinho, como a casca (depende de `tokens.css` e `fontes.css`). Importa o `previa.css` |
| `css/previa.css` | A barra da Página de impressão e a área em volta da folha (v3.11.0): `.rel-barra`, `.rel-barra-titulo` e `.rel-area`, interface em `--ov-*`, sem a folha e sem `@page`; no papel, a barra some. Importável sozinho, também pela prévia de um formulário oficial |
| `css/impressao.css` | O `@page relatorio` e o `@page relatorio-paisagem` (com o rodapé nas caixas de margem) e o `@media print` das `.rel-*`. Sem seletor global (v3.10.0) |
| `css/fontes.css` | IBM Plex Sans e Mono servidas pelo próprio app, sem Google Fonts. Só para o que é impresso: a interface usa a fonte do sistema |
| `fonts/` | Os `.woff2` do subconjunto latino (400, 500, 600) |
| `tailwind/preset.js` | Preset do Tailwind 3 que aponta para as mesmas variáveis |
| `icons/` | Ícones de PWA de cada app (192, 512, maskable, apple-touch-icon) e o SVG de origem |
| `marca/` | O logo horizontal da BRAM Offshore (`bram-offshore-horizontal.png`, 2425×1073, fundo transparente), para o timbre dos relatórios (v3.10.0) |
| `manifestos/` | Modelos de `.webmanifest` dos quatro instaláveis (plataforma, Materiais, Paradas, Bordo) |
| `js/` | O comportamento que os apps repetiam linha a linha (D1): o núcleo da paleta de comandos, o foco preso dos diálogos e, desde a v3.6.0, o núcleo do Toast, o teclado do Painel lateral, a pilha de camadas modais e o registro de alterações, e, desde a v3.8.0, o teclado da linha da tabela. ESM puro, sem dependência (nem de React), com `.d.ts` |
| `exemplo/` | Página de conferência com tudo aplicado nos dois temas, inclusive a casca |
| `scripts/conferir.mjs` | `npm run conferir`: confere a divisão entre `casca.css`, `janelas.css`, `telas.css`, `controles.css`, `relatorio.css`, `previa.css`, `onevessel.css` e `impressao.css` (o `relatorio.css` só com `.rel-*`, sem base e importando o `previa.css`; o `previa.css` só com a barra e a área, sem `@page` e, no papel, só escondendo; o `impressao.css` só com `.rel-*` e `@page` com nome, sem `visibility` nem `position: absolute`; e que todo CSS está em `exports`), que nenhum CSS tem `outline: none` (sem exceção desde a v3.12.0), que nenhum nome antigo de app sobrou e que `js/` só importa caminho relativo, tem um `.d.ts` por `.js` e está todo em `exports` |
| `test/` | `npm run testar`: os testes de `js/`, sem DOM, e os da divisão do CSS (`css.test.mjs`: o que saiu do `onevessel.css` na v3.5.0 mora no `janelas.css`, o `.ov-estado` da v3.6.0 no `casca.css` e as telas da v3.7.0 no `telas.css`, com os mesmos valores; na v3.8.0, toda regra do `telas.css` da v3.7.0 com os mesmos valores, mais o miolo do item e o cartão que estica; na v3.9.0, toda regra do `casca.css` e do `janelas.css` da v3.8.0 igual, fora a lista que ganhou o recuo lateral, e nela a fórmula da v3.8.0 com o recuo em 0; e o contraste dos estados novos nos dois temas, pelos tokens; e `relatorio.test.mjs`, da v3.10.0: o `onevessel.css` com o que importa igual ao da v3.9.0 fora as três regras alteradas pelo nome, o `relatorio.css` e o `impressao.css` sem seletor global, `th` com 8,5pt ou mais, as duas páginas com nome e o logo pelo sha256; `temas.test.mjs`, da v3.10.1: o `tokens.css` com `color-scheme: dark` na raiz e no escuro e `light` no claro; e `v3.11.0.test.mjs`: toda regra dos CSS da v3.10.1 igual, fora as alteradas pelo nome (a sombra do cartão no claro, a alça, o campo da paleta e o hover do primário), o que nasceu exatamente pela lista, os valores das classes novas, o `previa.css` e o contraste do hover do primário, do cartão aberto e da paleta; e `v3.12.0.test.mjs`: toda regra dos CSS da v3.11.0 igual, fora as alteradas pelo nome (o campo, o foco do campo, o botão no toque e o hover do indicador), o que nasceu exatamente pela lista, o `controles.css` importável sozinho e importado por último pelo `onevessel.css`, nenhum `outline: none`, o cartão clicável, os alvos de toque e o contraste do campo e do realce. Desde a v3.11.0, os testes das versões anteriores comparam fixture com fixture). Roda `node --test "test/*.test.mjs"`, com o glob do próprio Node: no Node 24, `node --test test/` não abre pasta |

## Cor e tipografia, em uma linha

Duas identidades, e nunca se misturam:

- **Interface dos apps** — paleta petrol/ciano da Bram Power sobre o navy `#040a12`: `--ov-acao` é o petrol `#0e7490`, igual nos dois temas; `--ov-acao-hover` e `--ov-foco` são o ciano `#22d3ee` no escuro e o petrol escurecido `#0a5f77` no claro. Tipografia é a **fonte do sistema** (`--font-sans`): a bordo a conexão cai e o app tem que abrir sem esperar download nenhum.
- **Tudo que é impresso** — timbre da BRAM: `--rel-*` (marinho `#0d4b88` e laranja `#ec6a3b`) e **IBM Plex** (`--font-rel-sans`, `--font-rel-mono`), servida em woff2 pelo próprio app. É o que as classes `.rel-*` usam.

Fora disso ficam os **formulários oficiais** (NORMAM-08/DPC, ANVISA): reproduzem o anexo do órgão e não recebem nada daqui.

## Instalar num app

```bash
npm i "onevessel-ui@github:MilasKaab/onevessel-ui#v3.12.0"
```

Use sempre uma **tag de versão**. Quando a design system mudar, sai uma tag nova e cada app atualiza quando quiser — nunca no meio de outra entrega.

### Qual CSS importar

| Arquivo | Quem importa |
| --- | --- |
| `tokens.css` | Todo app, sempre primeiro |
| `casca.css` | App que mantém a própria base (Bordo, Paradas): só as classes de estrutura (e, desde a v3.6.0, o `.ov-estado`), sem mexer no `body` nem na impressão |
| `janelas.css` | App que mantém a própria base (Bordo, Paradas), depois de `casca.css`: Diálogo, Toast, Painel lateral e folha |
| `telas.css` | App que mantém a própria base (Bordo, Paradas), depois de `janelas.css`: indicadores, Precisa de você, visões, tabela, barra de massa, esqueleto |
| `controles.css` | App que mantém a própria base (Bordo, Paradas), depois de `telas.css`: botões e campo (v3.12.0). Quem importa `janelas.css` importa este também (o `ov-btn-perigo` é só a cor sobre o `ov-btn`) |
| `onevessel.css` | App que adota a base de 14px e todos os componentes (já traz `casca.css`, `janelas.css`, `telas.css`, `relatorio.css` e `controles.css`; não importe junto) |
| `relatorio.css` | Bordo e Paradas: **só nas rotas dos relatórios internos**, nunca no CSS global. No Materiais chega pelo `onevessel.css` (só `.rel-*`, nenhum `@page`: sem dano). Já traz o `previa.css` |
| `previa.css` | A prévia de um formulário oficial, que não pode receber o `relatorio.css`: só a barra e a área (v3.11.0). Nas rotas dos relatórios internos ele já vem pelo `relatorio.css` |
| `impressao.css` | Todo app: **só nas rotas dos relatórios internos**, depois do `relatorio.css` (ou do `onevessel.css`). Nunca no CSS global, nunca numa rota de formulário oficial |
| `fontes.css` | Quem imprime relatório (IBM Plex) |

### Casca

```html
<div class="ov-casca">
  <nav class="ov-lateral">
    <div class="ov-lateral-marca">
      <svg …glifo do app…/>
      <div class="ov-lateral-marca-texto">
        <span class="ov-lateral-marca-nome">Bordo</span>
        <span class="ov-lateral-marca-sub">Conveses, embarque e despacho</span>
      </div>
    </div>
    <button class="ov-seletor-embarcacao" aria-haspopup="menu" aria-expanded="false" title="Bram Power">
      <svg …anchor…/><span class="ov-lateral-texto">Bram Power</span>
    </button>
    <button class="ov-busca-gatilho" title="Buscar">
      <svg …search…/><span class="ov-lateral-texto">Buscar…</span><kbd class="ov-tecla">Ctrl K</kbd>
    </button>
    <a class="ov-nav" href="/bordo/" aria-current="page" title="Conveses">
      <svg …/><span class="ov-lateral-texto">Conveses</span>
    </a>
    <div class="ov-lateral-grupo">Outros apps</div>
    …
    <div class="ov-lateral-rodape">
      <button class="ov-conta" title="Ana Souza"><svg …circle-user…/><span class="ov-lateral-texto">Ana Souza</span></button>
    </div>
  </nav>
  <div class="ov-conteudo">
    <header class="ov-cabecalho-movel">…</header>        <!-- só abaixo de 768px -->
    <header class="ov-superior">
      <div class="ov-trilha">Bordo / <b>Conveses</b></div>
      <div class="ov-superior-direita">                  <!-- nesta ordem -->
        <button class="ov-conta">Ana Souza</button>
        <span class="ov-sincronizacao" data-tom="atencao">Sem conexão<span class="ov-sincronizacao-fila"> · 3 na fila</span></span>
        …até 2 ações (um Menu ⋮ conta como uma)…
      </div>
    </header>
    <main class="ov-tela">…</main>
    <nav class="ov-barra-inferior">                      <!-- só abaixo de 768px -->
      <a class="ov-barra-inferior-item" aria-current="page">…</a>   <!-- até 4 destinos -->
      <button class="ov-barra-inferior-item" aria-expanded="false">…Mais</button>
    </nav>
  </div>
</div>
```

- Tudo que é texto na lateral vai em `.ov-lateral-texto` (ou `.ov-lateral-marca-texto`): abaixo de 1024px a lateral recolhe para 56px, esse texto sai da tela (continua para o leitor de tela) e o `title` de cada item fica.
- O topo da lateral num app é o glifo solto de 20px em `currentColor`; `.ov-monograma` é só da plataforma.
- `.ov-seletor-embarcacao` desenha a própria seta. Com um navio só, use `data-fixo` num elemento que não é botão: sem seta, sem cursor.
- Em tela de toque (`pointer: coarse`), os itens da lateral passam a 48px.
- Margem da tela: 32px no computador, 24px de 768 a 1023px, 16px abaixo de 768px.
- Abaixo de 768px, `.ov-paleta` vira a tela "Buscar", inteira.
- **Miolo da paleta** (v3.11.0): `.ov-paleta-lista` rola por dentro até `min(60vh, 480px)` (4px em cima; no celular, sem limite e com a área segura de baixo), os `.ov-paleta-item` dela com cursor de mão, `a.ov-paleta-item` sem cor de link (Ctrl/Cmd-clique abre outra aba) e `.ov-paleta-aviso` para o aviso de um grupo ou o vazio, em 13px e `ov-texto-terciario`. O campo da `.ov-paleta-busca` tem o anel único do livro no próprio campo (o `outline: none` saiu).
- **Folha do "Mais"** (v3.11.0): dentro da `.ov-folha`, depois da `.ov-folha-alca`, o `.ov-folha-topo` (com o `h2.ov-folha-titulo` e o Fechar do app) e a `.ov-folha-menu`, que rola por dentro com a área segura de baixo e dá 48px aos `.ov-menu-item`. A alça e o topo são puxador (`touch-action: none`). A conta vai em `p.ov-folha-conta`. Os grupos ("Outros apps", "Conta") em `.ov-menu-grupo`, que serve também ao `.ov-menu` (lá com `aria-hidden`). O item da seção aberta leva `aria-current="page"` e ganha o desenho do `.ov-nav` ativo, no menu e na folha.

```html
<div class="ov-folha" role="dialog" aria-modal="true" aria-labelledby="mais">
  <div class="ov-folha-alca"></div>
  <div class="ov-folha-topo"><h2 class="ov-folha-titulo" id="mais">Mais</h2>…Fechar…</div>
  <div class="ov-folha-menu">
    <a class="ov-menu-item" href="…" aria-current="page">…</a>
    <h3 class="ov-menu-grupo">Conta</h3>
    <p class="ov-folha-conta"><svg …circle-user…/>Ana Souza</p>
  </div>
</div>
```
- Recuos laterais da área segura (desde a v3.9.0, para o iPhone deitado; precisam de `viewport-fit=cover`): a lateral cresce por dentro o recuo da esquerda, e o de baixo no rodapé, sem encolher o alvo; `.ov-superior`, `.ov-tela` e `.ov-faixa` recebem o da direita; abaixo de 768px, `.ov-cabecalho-movel`, `.ov-barra-inferior` e `.ov-tela` recebem os dois; a `.ov-folha` e o Painel lateral em folha (abaixo de 1024px), na própria caixa. Sem recorte, todo recuo vale 0 e nada muda.

### Janelas

Desde a v3.5.0 (D3 da F4). A Bordo e o Paradas importam `tokens.css`, `casca.css` e `janelas.css`; quem usa o `onevessel.css` já recebe tudo. As regras de uso (quando é Diálogo, quando é Toast, Desfazer) estão em `janelas-e-avisos.md`, no `onevessel-docs`.

```html
<!-- Diálogo: div do app, véu e foco preso (focoQueGira), não <dialog> -->
<div class="ov-veu"></div>
<div class="ov-dialogo" data-tamanho="confirmacao" role="alertdialog" aria-labelledby="t" aria-describedby="f">
  <h2 class="ov-dialogo-titulo" id="t">Remover o dia 14/10?</h2>
  <p class="ov-dialogo-frase" id="f">As atividades do dia somem para todas as estações.</p>
  <div class="ov-dialogo-acoes">                      <!-- Cancelar antes da ação -->
    <button class="… Cancelar">Cancelar</button>
    <button class="ov-btn-perigo …">Remover dia</button>
  </div>
</div>

<div class="ov-dialogo" data-tamanho="formulario" role="dialog" aria-labelledby="t2">
  <h2 class="ov-dialogo-titulo" id="t2">Encerrar TT</h2>
  <div class="ov-dialogo-corpo">…campos…</div>      <!-- rola por dentro -->
  <div class="ov-dialogo-acoes">…</div>
</div>

<!-- Toasts: no layout, sobrevivem à troca de tela -->
<div class="ov-toasts">                               <!-- data-com-barra com a .ov-acoes-massa na tela -->
  <div class="ov-toast" role="status">
    <div class="ov-toast-linha"><svg …/>3 contagens aprovadas<button class="ov-toast-acao">Desfazer</button></div>
    <div class="ov-toast-tempo"><span></span></div>
  </div>
  <div class="ov-toast" data-tipo="erro" role="alert">
    <div class="ov-toast-linha"><svg …/>Não consegui encerrar a TT.<button class="ov-toast-acao">Tentar de novo</button></div>
  </div>
</div>

<!-- Painel lateral: data-abas dá 480px -->
<aside class="ov-painel" data-abas role="complementary">
  <div class="ov-painel-cab">…</div>
  <div class="ov-painel-corpo">…<div class="ov-abas-internas">…</div><dl class="ov-dados">…</dl></div>
</aside>

<!-- Folha móvel: data-altura="rapida" (40%), "detalhe" (90%) ou "cheia" (100%) -->
<div class="ov-folha" data-altura="detalhe">
  <div class="ov-folha-alca"></div>
  <div class="ov-folha-corpo">…</div>
  <div class="ov-folha-rodape">…até 2 botões…</div>
</div>
```

- **Diálogo**: `data-tamanho="confirmacao"` (ou sem atributo) tem 440px (`--ov-dialogo`); `"formulario"` tem 640px (`--ov-dialogo-formulario`), com o `.ov-dialogo-corpo` rolando. Abaixo de 768px a confirmação continua centrada, com 16px de margem, e **o formulário vira folha em tela cheia pelo próprio CSS** (`@media` sobre `data-tamanho="formulario"`): o app não troca classe nem precisa saber a largura. Nesse caso as ações ganham a geometria do `.ov-folha-rodape`.
- **`ov-btn-perigo`** só existe dentro do Diálogo e traz **só as cores** (`--ov-erro` e `--ov-sobre-erro`). A base do botão (altura, padding, fonte) é o `ov-btn` do `controles.css` (v3.12.0): o `janelas.css` não o importa, como não importa a casca (a soma do `onevessel.css` repetiria as regras); o app importa os dois.
- **Toast**: centro inferior no computador; com a barra de ações em massa na tela, o app põe `data-com-barra` na `.ov-toasts` e a pilha sobe para 96px. Abaixo de 768px, logo abaixo da barra superior (`--ov-barra-superior` + área segura + 12px), entrando de cima. Sem `data-tipo` (ou `"sucesso"`) o ícone vai em `--ov-toast-sucesso`; `data-tipo="erro"` usa `--ov-toast-erro` e o CSS esconde a barra de tempo. O máximo de 3 é do app.
- **Barra de tempo**: anda de 100% a 0 em `--ov-toast-duracao` (8s, em `tokens.css`; o app pode trocar a variável) e **pausa com `:hover` e `:focus-within`** no toast. O temporizador do núcleo do toast (`js/toast-nucleo.js` desde a v3.6.0) pausa e retoma **nos mesmos eventos** (`mouseenter`/`mouseleave`, `focusin`/`focusout` do toast), senão a barra e o fechamento se desencontram.
- **Painel lateral**: não é modal no computador. **Abaixo de 1024px vira Folha móvel de 90%** (`data-altura="cheia"` no painel dá a tela inteira) e passa a ser modal: **o app põe o `.ov-veu` antes dele e prende o foco** enquanto a folha estiver aberta.
- **Folha**: sem `data-altura`, a altura do conteúdo (o "Mais"). Na `"cheia"` some o raio e a alça, e entra a área segura de cima. Os botões do `.ov-folha-rodape` têm 48px e a mesma largura.
- **Movimento reduzido** (`janelas.css` e `casca.css`): as entradas não sobem nem escalam, só aparecem; a barra de tempo continua, porque diz quanto falta.

### Controles

Desde a v3.12.0 (V17: PV-2, PV-3, BV-4, BV-9, BV-10). Botões e campo saíram do `onevessel.css` para o `controles.css`, importável sozinho, com a régua do livro para a suíte inteira. As regras de uso estão em `componentes.md` (Botão, Campo), no `onevessel-docs`.

```html
<button class="ov-btn ov-btn-primario" type="button">Salvar</button>
<button class="ov-btn ov-btn-secundario" type="button">Cancelar</button>
<button class="ov-btn ov-btn-fantasma ov-btn-icone" type="button" aria-label="Imprimir" title="Imprimir">…</button>

<div class="ov-campo-grupo">
  <label class="ov-label" for="imo">IMO</label>
  <input class="ov-campo" id="imo" aria-invalid="true" aria-describedby="imo-erro">
  <span class="ov-erro-campo" id="imo-erro">…ícone…O IMO tem 7 dígitos.</span>
</div>
```

- **Botão**: 36px no computador e **48px no toque** (`pointer: coarse`; até a v3.11.0, 44), peso 500, raio `ov-raio-md`. O `.ov-btn-sm` (28px) é só do computador: no toque vai a 48 como os outros. O `.ov-btn-icone` fica quadrado (36 ou 48). O `.ov-btn-primario` sob o mouse tem o texto em `ov-fundo` (desde a v3.11.0: 10,99:1 no escuro e 6,40:1 no claro, em vez de 1,72:1).
- **Campo**: 44px em qualquer tela, texto de 16px, borda `ov-borda-controle`, fundo `ov-superficie-recuada` (o do livro para o campo dentro de cartão, e o mesmo fora dele: no cartão fica recuado, na página um tom acima). **Foco: o anel único do livro** (`outline: 2px solid var(--ov-foco)`, recuo 2px), sem halo e sem trocar a borda; o `outline: none` saiu. Erro: `aria-invalid="true"` põe a borda em `ov-erro`.
- **Rótulo** (`.ov-label`): 14px/500 em `ov-texto`; `small` dentro dele para "(opcional)". Ajuda em `.ov-ajuda` e erro em `.ov-erro-campo`, os dois em 13px.
- **O que muda na tela de quem recebe o `onevessel.css` (a plataforma):** o botão no toque sobe de 44 para 48px; o campo perde o halo e a borda `ov-acao` do foco e ganha o anel; o fundo do campo passa de `ov-fundo` a `ov-superficie-recuada`. No computador com mouse, o botão continua com 36. Das telas, sob o mouse o indicador que é link troca a borda forte pelo realce, e a `.ov-visao` e o segmentado sobem a 48 no toque. A plataforma muda ao adotar a tag, num PR dela.

### Telas

Desde a v3.7.0 (D1 da F5). O CSS que ficava só no `onevessel.css` (e que a Bordo e o Paradas não importam por causa da base) mora no `telas.css`, com os mesmos valores, e o que faltava nasceu lá. As regras de uso estão em `componentes.md`, no `onevessel-docs`.

```html
<!-- Precisa de você: até 5 itens (regra do app); sem item, o vazio -->
<section class="ov-cartao ov-pendencias" aria-labelledby="pv">
  <div class="ov-pendencias-cab">
    <h2 class="ov-titulo-3" id="pv">Precisa de você</h2>
    <span class="ov-contador-destaque">3</span>
    <a class="ov-pendencias-ver-tudo" href="…">Ver tudo</a>
  </div>
  <ul class="ov-pendencias-lista">
    <li>
      <a class="ov-pendencia" href="…">
        <span class="ov-estado ov-pendencia-estado" data-tom="atencao">Atenção</span>
        <span class="ov-pendencia-texto">
          <span class="ov-pendencia-titulo"><span class="ov-pendencia-id">1234</span>Título</span>
          <span class="ov-pendencia-contexto">Contexto</span>
        </span>
        <svg class="ov-pendencia-seta" aria-hidden="true">…</svg>
      </a>
    </li>
    <!-- item sem link: <div class="ov-pendencia">…</div>, o mesmo miolo, sem a seta -->
  </ul>
  <!-- ou: <p class="ov-pendencias-vazio">Nada pendente com você.</p> -->
</section>

<!-- Aba de rota (v3.11.0): link com aria-current, no desenho da visão selecionada -->
<nav class="ov-visoes" aria-label="Conveses">
  <a class="ov-visao" href="…" aria-current="page">Principal</a>
  <a class="ov-visao" href="…">Superior</a>
</nav>

<!-- Cartão aberto (v3.11.0): o registro do painel -->
<button class="ov-cartao" aria-current="true">…</button>

<!-- Indicadores: 4 colunas, 2 de 768 a 1023px, 1 no celular -->
<div class="ov-indicadores">
  <a class="ov-cartao ov-indicador" href="…">…</a>
</div>

<!-- Tabela: a célula do nome leva .nome; abaixo de 768px vira lista de linhas -->
<table class="ov-tabela">
  <thead><tr><th></th><th>Nome</th><th>Função</th><th>Estado</th></tr></thead>
  <tbody><tr><td><input class="ov-check" type="checkbox" aria-label="…"></td><td class="nome">João Pereira</td><td>Mecânico</td><td><span class="ov-estado" data-tom="sucesso">A bordo</span></td>
    <td class="num">14<span class="ov-so-no-celular"> dias a bordo</span></td><td class="ov-fora-do-celular">…Excluir…</td></tr></tbody>
</table>

<!-- Barra de ações em massa: data-flutuante dá a posição e a entrada -->
<div class="ov-acoes-massa" data-flutuante role="toolbar" aria-label="3 selecionadas">…</div>

<!-- Esqueleto: no formato da tela, sem spinner -->
<div aria-busy="true"><div aria-hidden="true">
  <div class="ov-esqueleto-linha"><span class="ov-esqueleto-texto"></span><span class="ov-esqueleto-texto"></span></div>
  <span class="ov-esqueleto" style="height: 120px"></span>
</div></div>
```

- **Lista do celular**: abaixo de 768px, **a `.ov-tabela` que tem uma `td.nome`** vira lista de linhas de 64px ou mais, com o nome em cima em 16px e as outras células numa linha de `legenda`, separadas por "·", e divisor `ov-borda`. O cabeçalho sai da tela e continua para o leitor de tela; a célula com `.ov-check` fica à esquerda. O app não troca de classe. Tabela sem `td.nome` (as da plataforma até a v3.6) continua como estava, rolando de lado, e navegador sem `:has()` também.
- **Só na lista, fora da lista** (v3.11.0): dentro da `.ov-tabela`, o `.ov-so-no-celular` (um rótulo, `inline`) só aparece na lista do celular, onde o cabeçalho sai ("12 atividades"); o `.ov-fora-do-celular` (uma célula, ou o `th` dela) some na lista e fica de 768px para cima, no tablet também.
- **Cartão** (v3.11.0): sem sombra em nenhum tema (o livro: cartão em repouso se separa por borda). **Cartão aberto**: `aria-current="true"` no `.ov-cartao` dá borda `ov-acao` e `ov-acao-suave` sobre a superfície, como a linha selecionada da tabela. A regra é fraca (`:where`): a borda de alerta que o app põe numa classe dele, depois do pacote, continua vencendo.
- **Aba de rota** (v3.11.0): a `.ov-visao` também é link de navegação, com `aria-current="page"` na rota aberta, no desenho da selecionada e sem sublinhado. O `tablist` (`aria-selected`) fica para a visão que filtra a mesma tela.
- **Cartão clicável** (v3.12.0): `a.ov-cartao` e `button.ov-cartao` têm cursor de mão e, sob o mouse, o realce do livro, `ov-linha-hover` por cima da superfície; a borda não muda e o cartão aberto fica como está. O `a.ov-indicador` ganhou o mesmo realce no lugar da borda `ov-borda-forte` (o livro cita cartão e indicador na mesma regra); a borda de alerta fica visível sob o mouse. Regras fracas (`:where`), como a do aberto.
- **Alvos de toque** (v3.12.0): em `pointer: coarse`, a `.ov-visao` e os botões do `.ov-segmentado` têm 48px de altura mínima (eram 32 e 30; o segmentado fica com 56). Uma linha de `.ov-visoes` que quebra ganha outra fileira de 48px, 4px abaixo: 52px a mais por fileira.
- **Miolo do item** (v3.8.0): o `.ov-pendencia-estado` vai ao lado do `.ov-estado`, numa coluna de 88px (as palavras alinham); título (`.ov-pendencia-titulo`, 600, com elipse) e contexto (`.ov-pendencia-contexto`, 12px/16px) em duas linhas; o identificador (`.ov-pendencia-id`, mono 12px/16px) antes do título; a seta (`.ov-pendencia-seta`) no fim. Identificador, contexto e seta em `ov-texto-terciario`. **Item sem link** é `div.ov-pendencia`, sem a seta e sem CSS próprio: o realce e o anel de foco são só do `a`. O título da caixa é do app.
- **Indicadores**: a grade é a `.ov-indicadores`, em `div` ou `ul`; o máximo de 4 é do app. Em `ul`, desde a v3.8.0 o `li` é flex e o cartão ocupa a altura dele: os cartões de uma linha ficam da mesma altura nas duas formas. A grade continua 4/2/1 (1 coluna até 767px).
- **Barra de ações em massa**: `data-flutuante` põe a `.ov-acoes-massa` fixa, centrada, 24px acima do rodapé e da área segura (no celular, acima da `.ov-barra-inferior`), em `--ov-z-flutuante` e `--ov-fundo-barra` sem desfoque, entrando de 12px em 180ms. Sem o atributo, a caixa é a da v3.6. Com ela na tela, a `.ov-toasts` leva `data-com-barra`. Esc e ✕ limpam a seleção no app.
- **Esqueleto**: `.ov-esqueleto` é o bloco (o app dá a altura; 48px sem ela), `.ov-esqueleto-texto` uma linha de texto (o app dá a largura) e `.ov-esqueleto-linha` uma linha de tabela (44px; 64px no celular). Também serve uma `<tr>` da `.ov-tabela` com um `.ov-esqueleto-texto` por célula. Pulsa só na opacidade.
- **Movimento reduzido** (`telas.css`): a barra de massa só aparece, já no lugar (`ovFade`, da casca), e o esqueleto não pulsa.
- **Teclado da tabela** (↑↓, Enter, X): o núcleo é o `js/teclas-da-tabela.js` desde a v3.8.0 (ver `js/`); quem diz onde está o foco dentro da linha é a tabela, no app.

### Relatório (papel e impressão)

Desde a v3.10.0 (D1 da F7). As `.rel-*` que moravam no `onevessel.css` estão no `relatorio.css`, com os mesmos valores, fora três regras: a `.rel-pagina` ganhou `page: relatorio`, o `.rel-tabela th` subiu de 11px para 8,5pt e a `.rel-barra` virou interface (fonte do sistema, `--ov-*`, sem o `max-width: 210mm`). O `impressao.css` foi reescrito sem seletor global. As regras do documento (Timbre, resumo, estados, nome do arquivo) estão em `relatorios-e-logos.md`, no `onevessel-docs`.

**Onde importar.** O app importa o `relatorio.css` e o `impressao.css` **só nas rotas dos relatórios internos**, nunca no CSS global. Nenhum dos dois chega a um formulário oficial (NORMAM, ANVISA): nem o CSS, nem uma classe `.rel-*`, nem o logo. No Materiais o `relatorio.css` vem pelo `onevessel.css` global, sem dano (só classes `.rel-*`); o `impressao.css`, que tem o `@page`, entra só nas rotas de relatório em todo app.

```js
// Rota de relatório interno (Bordo, Paradas): o layout dela, não o globals.css
import 'onevessel-ui/css/fontes.css'
import 'onevessel-ui/css/relatorio.css'   // já traz o previa.css
import 'onevessel-ui/css/impressao.css'
```

```js
// Prévia de um formulário oficial: só a barra e a área, nada da folha nem @page
import 'onevessel-ui/css/previa.css'
```

```html
<html style='--rel-rodape: "OneVessel · Bordo · Ocupação do convés"'>
…
<div class="rel-area">
  <div class="rel-barra">
    <button>Voltar</button>                    <!-- os botões são do app -->
    <h1 class="rel-barra-titulo">Ocupação do convés A</h1>
    <button>Imprimir ou salvar PDF</button>
  </div>
  <article class="rel-pagina">                <!-- data-orientacao="paisagem" para A4 deitado -->
    <header class="rel-timbre">
      <img src="/marca/bram-offshore-horizontal.png" alt="BRAM Offshore">
      <div><h2 class="rel-titulo">Ocupação do convés</h2><div class="rel-sub">&lt;navio&gt; · Convés A</div></div>
      <div class="rel-meta">20/10/2026<br>Emitido por &lt;pessoa&gt;</div>
    </header>
    <div class="rel-resumo"><div><b>22 / 49</b><span>leitos ocupados</span></div>…</div>
    <h3 class="rel-secao">Camarotes</h3>
    <table class="rel-tabela">
      <thead><tr><th>Camarote</th><th>Estado</th><th class="rel-num">Leitos</th></tr></thead>
      <tbody><tr>
        <td>A-101</td>
        <td><span class="rel-estado"><span aria-hidden="true">●</span> Concluído</span></td>
        <td class="rel-num">4</td>
      </tr></tbody>
    </table>
    <footer class="rel-rodape">…</footer>     <!-- só na tela; no papel, as caixas de margem -->
  </article>
</div>
```

- **Páginas com nome.** A `.rel-pagina` pede `page: relatorio` (`@page relatorio`: A4 em pé, margem de 16mm); com `data-orientacao="paisagem"`, `page: relatorio-paisagem` (A4 deitado, 16mm), e na tela a folha tem 297mm e a proporção do A4 deitado (`aspect-ratio: 297 / 210`). Não há `@page` sem nome: o do formulário oficial fica intacto. Duas consequências:
  - `page: relatorio` sem o `impressao.css` (o Materiais, que recebe a `.rel-pagina` pelo `onevessel.css`) não muda tamanho nem margem, mas força uma quebra de página antes e depois da folha, como toda troca de página com nome.
  - **Na rota do relatório, nenhum `@page` sem nome pode vir depois do `impressao.css`.** No Chromium 156 (medido em 20/10, no PDF), um `@page { size; margin }` sem nome que venha depois ganha do `@page relatorio` no tamanho e na margem: o Chromium decide pela ordem, não pelo nome. Antes dele, não atrapalha.
- **Rodapé.** Sai inteiro pelas caixas de margem das duas páginas, em IBM Plex Sans 8pt, `rel-mudo`: à esquerda (`@bottom-left`) o texto de `--rel-rodape`; à direita (`@bottom-right`) "pág. n/N", dos contadores `page` e `pages`. **O app escreve `--rel-rodape` no `<html>` (`:root`) da prévia, com o texto entre aspas** (`--rel-rodape: "OneVessel · Bordo · Ocupação do convés"`, pelo atributo `style` do `<html>` ou por um `:root { }` da rota). Definida no `body` ou na `.rel-pagina`, a caixa sai vazia (medido no Chromium 156: a caixa de margem herda da raiz, não da folha); sem a variável, a esquerda sai vazia e a numeração continua. Só o Chrome e o Edge 131+ desenham caixas de margem: fora deles, o documento sai sem rodapé. A `.rel-rodape` da folha some no papel, para o texto não sair duas vezes; na tela ela continua. No diálogo do Chrome, desmarcar "Cabeçalhos e rodapés", senão o navegador soma os dele.
- **Papel em preto e branco** (`@media print`): a `.rel-barra` some e a `.rel-area` perde o fundo (pelo `previa.css`); filete em preto; logo em cinza, com 10mm de altura (40px na tela); sem fundos (a `.rel-area` e a folha ficam sem cor, o resumo sem tinta e com borda fina); títulos e números do resumo em preto. Linha de tabela não quebra entre páginas (`.rel-tabela tr`), e o cabeçalho (`.rel-tabela thead`) se repete em cada página.
- **Tamanhos**: todo texto da folha com 8,5pt ou mais (o `th` subiu para 8,5pt); o rodapé, 8pt.
- **Coluna numérica**: `.rel-num` no `th` e no `td` da coluna: à direita, `tabular-nums`.
- **Estado e prioridade**: `.rel-estado` é símbolo e palavra, sem fundo e sem cor de estado (herda a cor do texto). O app escreve o símbolo num `span` com `aria-hidden` (● ○ ▲ × △, a tabela está em `relatorios-e-logos.md`); a Plex não tem esses glifos, e eles caem na fonte do sistema.
- **Barra** (`.rel-barra`): interface, não papel — fonte do sistema e `--ov-*`. Voltar à esquerda, o título (`.rel-barra-titulo`, `titulo-3`: 16px, 600, com elipse) ocupa o resto, e a ação fica à direita. Ocupa a largura da `.rel-area`, para alinhar com a folha em pé e deitada. Os botões são do app. Desde a v3.11.0 (BV-8) a barra e a área moram no `previa.css`, com os mesmos valores: o `relatorio.css` o importa, e a prévia de um formulário oficial importa só ele.
- **Fora daqui**: o JSX da barra e do Timbre, o conteúdo de cada relatório, o `<title>` e o nome do arquivo são do app; o PDF por código do Paradas (pdfmake) segue as mesmas medidas, com o tema próprio conferido contra os tokens.

### App com CSS próprio (Materiais)

```js
// main.jsx, antes do CSS do app
import 'onevessel-ui/css/fontes.css'
import 'onevessel-ui/css/tokens.css'
import 'onevessel-ui/css/onevessel.css'
import './estilos-do-app.css'
```

Na fase F1, aponte as variáveis antigas para as novas em vez de trocar tudo de uma vez:

```css
:root {
  --bp-fundo: var(--ov-fundo);
  --bp-texto: var(--ov-texto);
  --bp-acento: var(--ov-acao);
}
```

Assim a tela inteira muda de aparência sem tocar em componente nenhum, e as variáveis antigas vão sendo apagadas aos poucos.

### App com Tailwind 3 (Paradas)

```js
// tailwind.config.js
module.exports = {
  presets: [require('onevessel-ui/tailwind/preset.js')],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
}
```

```js
// main.jsx
import 'onevessel-ui/css/fontes.css'
import 'onevessel-ui/css/tokens.css'
import 'onevessel-ui/css/casca.css'
import 'onevessel-ui/css/janelas.css'
import 'onevessel-ui/css/telas.css'
import 'onevessel-ui/css/controles.css'
import './index.css' // onde ficam as diretivas do Tailwind
```

Depois disso, `bg-fundo`, `text-texto`, `bg-acao`, `rounded-lg`, `shadow-1`, `h-campo` e `text-titulo-1` já saem com os valores da OneVessel.

**O preset não declara `spacing` nem `darkMode`** (decidido em 12/10, v3.3.0):

- `spacing`: a escala padrão do Tailwind (`p-4` = `1rem`) já coincide com `--ov-esp-*` com raiz de 16px, e em `rem` ela cresce quando a pessoa aumenta a fonte do navegador. Use `p-4`, `gap-2` etc. normalmente; `--ov-esp-*` continua valendo no CSS escrito à mão.
- `darkMode`: os tokens trocam de tema sozinhos, por variável, com `data-theme` no `<html>`; `bg-fundo` já está certo nos dois temas. Se o app ainda usa `dark:`, ele declara o próprio `darkMode` no `tailwind.config.js` e mantém a classe em sincronia com `data-theme`.

### App com Tailwind 4 (Bordo)

O Tailwind 4 não usa preset. Importe os tokens e repasse as variáveis no `@theme`:

```css
@import 'tailwindcss';
@import 'onevessel-ui/css/fontes.css';
@import 'onevessel-ui/css/tokens.css';
@import 'onevessel-ui/css/casca.css';
@import 'onevessel-ui/css/janelas.css';
@import 'onevessel-ui/css/telas.css';
@import 'onevessel-ui/css/controles.css';

@theme {
  --color-fundo: var(--ov-fundo);
  --color-superficie: var(--ov-superficie);
  --color-borda: var(--ov-borda);
  --color-texto: var(--ov-texto);
  --color-texto-secundario: var(--ov-texto-secundario);
  --color-acao: var(--ov-acao);
  --color-sucesso: var(--ov-sucesso);
  --color-atencao: var(--ov-atencao);
  --color-erro: var(--ov-erro);
  --radius-md: var(--ov-raio-md);
  --radius-lg: var(--ov-raio-lg);
  --color-foco: var(--ov-foco);
  /* sem var(--font-sans) aqui: o nome seria igual ao da variável e viraria um laço */
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
```

Os utilitários próprios do app (`bg-painel`, `text-texto`) continuam funcionando enquanto você troca um por um.

## js/

Comportamento sem framework que a Bordo e o Paradas tinham igual, linha a linha (D1; desde a v3.4.0). ESM puro, sem DOM e sem importar pacote nenhum; os tipos vêm junto, para TypeScript strict.

| Arquivo | O que é |
| --- | --- |
| `js/paleta-nucleo.js` | O núcleo da paleta de comandos: filtro (sem acento e sem caixa), ordem dos grupos, seleção, teclado (↑↓, Enter, Esc), atalho Ctrl K / ⌘K, atributos ARIA e o anúncio do `aria-live`. Reexporta `focoQueGira` |
| `js/foco-preso.js` | `focoQueGira` e `FOCAVEIS`: o foco preso da folha do "Mais" e da paleta |
| `js/toast-nucleo.js` | O núcleo do Toast (v3.6.0): fila de 3, prazo de 8s com pausa por ponteiro e foco, erro sem prazo, filtro do Ctrl Z |
| `js/teclas-do-painel.js` | O teclado do Painel lateral (v3.6.0): ↑↓ trocam de registro, Esc fecha, e onde está o foco |
| `js/camada.js` | A pilha de camadas modais (v3.6.0): quem está no topo e a trava de rolagem do `<html>` |
| `js/alteracoes-nucleo.js` | "Há alterações nesta tela" (v3.6.0): o registro em árvore e o texto único do "Descartar alterações?" |
| `js/teclas-da-tabela.js` | O teclado da linha da `.ov-tabela` (v3.8.0): ↑↓ só movem o foco entre linhas, Enter abre, X marca onde há seleção; o destino sem dar a volta e a linha que recebe o Tab |

```js
import { abrir, digitar, teclar, anuncio } from 'onevessel-ui/js/paleta-nucleo.js'
import { FOCAVEIS, focoQueGira } from 'onevessel-ui/js/foco-preso.js'
import { filaVazia, acrescentar, pausar, retomar, vencer, toastDoCtrlZ } from 'onevessel-ui/js/toast-nucleo.js'
import { acaoDaTecla, ondeEstaOFoco, vizinho } from 'onevessel-ui/js/teclas-do-painel.js'
import { abrirCamada, camadasAbertas } from 'onevessel-ui/js/camada.js'
import { criarRegistroDeAlteracoes, DESCARTAR } from 'onevessel-ui/js/alteracoes-nucleo.js'
import { acaoDaTeclaNaLinha, linhaDeDestino, linhaDoTab } from 'onevessel-ui/js/teclas-da-tabela.js'
```

`js/package.json` só tem `{"type": "module"}`: o pacote é CommonJS (o preset do Tailwind usa `module.exports`), e assim o Node carrega `js/` como ESM sem aviso.

O app fornece as fontes (os grupos, já montados por função) e desenha o componente; o núcleo só filtra, ordena e anda pela seleção. Os tipos (`GrupoDaPaleta`, `ItemDaPaleta`, `EstadoDaPaleta`…) saem do mesmo caminho.

Os quatro da v3.6.0 importam a Bordo e o Paradas (a adoção sai num PR por app). O que é de cada um fica no app:

- **`toast-nucleo.js`**: funções puras sobre a fila e um relógio que o app passa (`agora`, em ms). O app desenha a `.ov-toasts`, liga `mouseenter`/`mouseleave` e `focusin`/`focusout` a `pausar`/`retomar`, agenda o próximo `vencer` com `proximoVencimento` e chama `toastDoCtrlZ` no `keydown`, passando `camadasAbertas() > 0`.
- **`teclas-do-painel.js`**: o componente descreve a tecla e a situação (`ondeEstaOFoco` com o `document.activeElement` e o `body`), e `acaoDaTecla` diz `"anterior"`, `"proximo"`, `"fechar"` ou `null`. A troca de registro (`vizinho` na lista do app) e a pergunta antes de fechar com dado digitado são do componente.
- **`camada.js`**: `abrirCamada()` devolve quem fecha (a própria função, ou `fechar()`) e `estaNoTopo()`; a primeira camada trava a rolagem do `<html>` e a última devolve, e sem `document` (servidor, teste) só conta. **O gancho do React fica no app** (`useCamadaModal` na Bordo, `useCamada` no Paradas), como invólucro fino: abre no `useEffect` e fecha na limpeza.
- **`alteracoes-nucleo.js`**: `criarRegistroDeAlteracoes(pai?)` com `marcar(chave, sujo)`, `remover(chave)`, `ha()` e `filho()`; o filho conta no pai como uma chave só. `DESCARTAR` (congelado) tem `titulo`, `frase`, `continuar` e `descartar` do Diálogo. **Quem diz se houve digitação fica no app**: `retratoDosCampos` na Bordo (entradas de `FormData`), `retrato`, `mudou` e `reportSujo` no Paradas (estado do React).

Desde a v3.8.0, o `teclas-da-tabela.js` (V10 da v3.8.0; era `src/lib/teclas-da-tabela.ts` na Bordo e `src/lib/teclas-da-tabela.js` no Paradas, iguais linha a linha). A adoção sai no PR de cada app, com o resto da v3.8.0:

- **`teclas-da-tabela.js`**: a tabela descreve a tecla e onde está o foco dentro da linha (`'campo'`, `'linha'` ou `'outro-controle'`), e `acaoDaTeclaNaLinha` diz `"anterior"`, `"proximo"`, `"abrir"`, `"marcar"` (só com `comSelecao`) ou `null`; `linhaDeDestino` e `linhaDoTab` andam numa lista de ids que o app passa. **Quem classifica o foco (`alvoNaLinha`) fica no app**, porque muda de tabela para tabela (o checkbox do Embarcar da Bordo é "outro-controle"); os quatro de hoje usam o `ehCampo` do `teclas-do-painel.js`.

## Temas

O tema escuro é o padrão e vale sem nenhum atributo. Para o claro, ponha `data-theme="claro"` no `<html>`:

```js
document.documentElement.dataset.theme = 'claro'
```

Guarde a escolha da pessoa e aplique antes da primeira pintura, para a tela não piscar.

O `tokens.css` declara o `color-scheme` junto do tema (v3.10.1): `dark` na raiz e no `[data-theme="escuro"]`, `light` no `[data-theme="claro"]`. É o que faz o navegador pintar os controles nativos (o ícone do calendário e do relógio dos campos de data e hora, a barra de rolagem) para o tema certo. Os apps não repetem isso no CSS deles.

## Ícones de PWA

Copie a pasta do app para dentro do seu `public/` e use o manifesto correspondente:

```
public/icones/            ← icons/materiais/*
public/manifest.webmanifest ← manifestos/materiais.webmanifest
```

Os caminhos dentro do manifesto já apontam para o escopo do app (`/materiais/`). Ajuste se o endereço do app for outro.

## Logo dos relatórios

`marca/bram-offshore-horizontal.png` (v3.10.0): o logo horizontal da BRAM Offshore, 2425×1073, fundo transparente, 33.494 bytes, sha256 `86070cbcbbc1bb3d70c699b1eb049dc62d5ac295f421f35aecee3457811e7a95`. Vai no `.rel-timbre` de todo relatório interno, com 10mm de altura no papel e 40px na tela, sempre sobre branco; nunca num formulário oficial.

**O app copia o arquivo, com teste de bytes**, como os ícones: copia para dentro de si (por exemplo, `public/marca/`) e tem um teste que compara o sha256 da cópia com o do pacote (`onevessel-ui/marca/bram-offshore-horizontal.png`, em `exports` como `./marca/*`). Ao subir de versão, o teste acusa se o logo mudou.

```
public/marca/bram-offshore-horizontal.png ← marca/bram-offshore-horizontal.png
```

## Mudar a design system

1. Altere `tokens/tokens.json`, `css/casca.css`, `css/janelas.css`, `css/telas.css`, `css/controles.css`, `css/relatorio.css`, `css/previa.css`, `css/onevessel.css` ou `css/impressao.css`. Classe de estrutura vai na casca, camada sobre a tela (Diálogo, Toast, Painel, folha) vai nas janelas, o que vai dentro da tela (tabela, indicadores, pendências, visões) vai nas telas, botões e campo vão nos controles; nenhum seletor fica em dois arquivos.
2. `npm run build` (regenera `css/tokens.css`).
3. `npm run conferir` e `npm run testar`.
4. Abra `exemplo/index.html` e confira nos dois temas, com a janela larga, entre 768 e 1023px e abaixo de 768px.
5. `npm run icones` só quando mudar cor da marca ou glifo (precisa do Playwright). `npm run icones -- paradas bordo` gera só essas pastas.
6. Suba uma tag nova (`v3.12.1`) e avise os apps.

Decisão de design não nasce aqui: ela vem da conversa da design system, e este repositório só a publica.

## Regras que não mudam

- Nada de valor solto no código do app: cor, espaçamento e raio saem sempre de uma variável.
- Nada de `confirm()` nem `alert()`: use as classes `ov-dialogo` e `ov-toast` (em `janelas.css`).
- Este repositório é público e guarda só estilo. As diretrizes de uso, de permissão e de documento ficam no repositório privado `onevessel-docs`.

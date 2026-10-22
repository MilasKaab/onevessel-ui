# onevessel-ui

<!-- onevessel-regras:inicio (fonte: ../onevessel-docs/claude-md-regras.md, não editar aqui) -->
## Regras da suíte OneVessel

### Onde está a verdade
- `../onevessel-docs/` é a fonte das decisões (`implementacao.md` primeiro). Leia antes de decidir qualquer coisa que toque outro app, permissão, banco ou infraestrutura.
- `../onevessel-docs/` e as pastas dos outros apps são **só leitura**. Nunca edite, commite ou rode comando que escreva nelas.
- Decisão não se inventa aqui. Diante de um conflito com os docs, de duas saídas razoáveis ou de algo irreversível: **liste o conflito com as opções e PARE**. Não escolha o caminho óbvio.

### Git
- Commit, push e abrir PR: livres, em branch própria. Nunca commite direto na `main`.
- **Merge só depois de o Salim escrever "pode mergear"** na conversa. Aprovação de revisão, CI verde ou "parece bom" não valem.
- Uma migração por PR. Exceção única: mudança de enum, que o Postgres obriga a partir em duas (`add value` numa, o uso do valor na seguinte) — as duas vão no mesmo PR, seguidas, e nada mais. Migração aplicada nunca se edita — correção é migração nova.
- Mensagem de commit sem acento.
- Ao terminar um PR, entregue: número e link, o que mudou, **o diff das partes que merecem revisão**, como foi testado e o que ficou de fora. O resumo não substitui o código — ele vai ser lido.

### Segurança
- Nunca digite senha nem faça login em serviço nenhum. Login é sempre do Salim.
- Segredo e connection string vivem só na Vercel. Nunca em arquivo, commit, log, URL, mensagem de erro ou resposta. Nada de `vercel env pull` nem `.env` com valor de produção.
- `gh` e CLI da Vercel já estão logados pelo Salim na máquina dele; a sessão nunca faz login, nunca guarda token, nunca usa `--admin` nem pula revisão obrigatória do GitHub.
- CLI da Vercel **só leitura** (`vercel ls`, `vercel inspect --logs`), pedindo autorização na primeira vez de cada tipo de ação. `vercel env` (pull, add, rm), deploy manual, domínio e integração são do Salim.
- **Produção fora do merge é do Salim**: SQL em produção, variáveis de ambiente, integrações, planos, apagar branch do Neon, rodar Cron. Entregue o passo a passo, com o caminho exato dos menus, e espere ele confirmar.
- O e-mail do Salim ou de qualquer pessoa real nunca entra no repositório (seed, teste, comentário).
- Não cadastre gente de verdade sem a credencial inicial ter validade de 24 h e troca obrigatória no primeiro acesso.

### Regras de produto que valem em todo app
- Toda rota valida permissão no servidor; esconder na interface não é segurança.
- Falhar fechado: sem segredo, sem banco ou sem resposta, nenhuma permissão.
- Chave de função `app.módulo.tela.função`, quatro segmentos; depois de em uso, nunca muda.
- Todo caminho de app termina em barra.
- Interface nova não usa `alert()` nem `confirm()` (ver `janelas-e-avisos.md`).

### Ambiente do Salim
- Mac (macOS, zsh), desde 09/10. Os repositórios ficam lado a lado em `/Users/salimrabelo/Projetos Claude/01 - Codigo/` — o caminho tem espaços: sempre entre aspas. `&&` funciona; não há `cmd /c`.
- O Node veio do instalador oficial: `npm install -g` pede `sudo`, e a senha é o Salim quem digita. Comandos para ele: poucos por vez, prontos para colar.
- Ele fala português. Respostas diretas; aponte premissa errada em vez de concordar.
<!-- onevessel-regras:fim -->

## Este repositório

A design system dos apps OneVessel publicada como pacote: tokens, CSS, `js/`
sem framework, fontes, ícones de PWA, manifestos e o logo dos relatórios. O
que cada pasta é e como os apps importam está no `README.md`; aqui fica o
método.

**Do bloco acima, não se aplicam aqui:** migração e enum (não há banco),
Vercel e Neon (não há deploy nem segredo), e as regras de rota, permissão e
chave de função (não há servidor). O resto vale igual.

### Nada nasce aqui
- Toda mudança vem de uma decisão registrada no `../onevessel-docs/implementacao.md`
  (e no `livro-da-marca.md` ou no `componentes.md`). O que não está decidido
  vira pergunta, com as opções, e a sessão para.
- O repositório é **público** e guarda só estilo: nenhum texto do
  `onevessel-docs`, nenhum dado de gente real, nenhum e-mail.

### Onde cada coisa mora
- Estrutura das telas e camadas da casca (barras, menu, paleta, folha) no
  `css/casca.css`; o que fica sobre a tela (Diálogo, Toast, Painel) no
  `css/janelas.css`; o que vai dentro da tela no `css/telas.css`; o papel dos
  relatórios no `css/relatorio.css`; a barra da Página de impressão no
  `css/previa.css`; o `@page` e o `@media print` do papel no `css/impressao.css`;
  os botões e o campo no `css/controles.css`; a base de 14 px no
  `css/onevessel.css`.
- Os importáveis sozinhos não têm regra de base (`html`, `body`, `*`, `a` ou
  `button` soltos), fonte fora de classe nem impressão; cada caixa declara a
  própria fonte e cor. Nenhum seletor em dois arquivos.
- Nenhum `outline: none` em CSS nenhum (o `conferir` cobra, sem exceção desde
  a v3.12.0).
- `css/tokens.css` só pelo `npm run build`, a partir de `tokens/tokens.json`.
  `npm run icones` precisa do Playwright e só roda quando muda cor da marca ou
  glifo.

### Versão
- Classe, regra ou arquivo novo é **minor**; correção de valor sem seletor
  novo é **patch**. Nada que um app usa some ou muda de valor sem estar numa
  lista de alteradas pelo nome, no teste da versão.
- **Fixture por versão:** o CSS que muda é copiado da tag anterior para
  `test/fixtures/<arquivo>-vX.Y.Z.css`, sem edição, e o teste da versão nova
  cobra toda regra dele igual, fora a lista pelo nome. Os testes de versões
  passadas comparam fixture com fixture, nunca com o arquivo atual.
- No mesmo PR: `package.json` (versão e, se for o caso, `exports`), a linha
  de instalação do README e a seção do que mudou. Branch `ov/vX.Y.Z`; a tag
  é leve, posta no merge, e só depois do "pode mergear".
- Classe nova entra no `exemplo/index.html` nos dois temas, no mesmo PR.

### Antes do PR
```bash
npm run conferir
```
```bash
npm run testar
```
E o `exemplo/index.html` aberto nos dois temas, com a janela larga, entre 768
e 1023 px e abaixo de 768 px. O `testar` roda `node --test "test/*.test.mjs"`:
no Node 24, `node --test test/` não abre pasta.

Com o PR pronto, o diff completo vai para `.revisao/pr<número>.diff` (gerado
com `git diff <base>...HEAD`, sobrescrito se já existir); a pasta está no
`.git/info/exclude` e não entra no repositório. Na conversa vai o caminho do
arquivo, o número do PR, o sha do HEAD, o resultado do `conferir` e da suíte e
o que muda na tela dos apps.

### Adoção
Cada app adota a tag nova num PR dele, depois do merge e da tag, nunca no meio
de outra entrega. O pacote não muda código de app.

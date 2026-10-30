# Discovery: projeto aberto à contribuição (2026-10-30)

Ideia do caderno (29/10): "Deixar à vista que o projeto é aberto a contribuição de outras pessoas, já que é open source (ex.: guia de contribuição, créditos, link para o repositório no Studio)."

## Problema
Quem usa o Explicaí e quer ajudar (corrigir texto, relatar bug, propor recurso) não vê por onde começar. O diferencial principal da marca é "open source e gratuito" (`brand/discovery/90_SYNTHESIS.md`, posicionamento), mas só o README diz como contribuir, em uma frase. Quem está dentro do Studio não encontra o repositório. Hipótese: ainda não há contribuidor real nem pedido de contribuição (PRODUCT.md, "Evidence on Hand").

## O que já existe
**explicai (Studio)**
- `LICENSE` MIT, "Copyright (c) 2026 Gabriel Sampaio".
- `README.md`, seção "Desenvolvimento": comandos, e a frase "Contribuições são bem-vindas. Abra uma issue para conversar sobre a ideia, ou mande um pull request com `npm run check` passando." Rodapé "MIT. Um projeto codesampa.io", com a licença das fontes.
- `package.json` tem `homepage`, `repository` e `bugs` apontando para `gabriel-codesampaio/explicai-studio` (linhas 7-14).
- `CLAUDE.md` e `.claude/rules/` descrevem arquitetura, estilo, testes e commits. Estão escritos para a equipe de agentes, mas servem de base para pessoas.
- **Não há:** `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, pasta `.github/` (templates de issue e de PR), nem arquivo de créditos.
- **Interface:** nenhum link para o repositório. O rodapé da barra lateral tem `AppearancePanel` e `ShortcutsDialog` (`web/src/layout/Sidebar.tsx:106-109`). O `StatusBar` mostra só o caminho do arquivo e o estado do salvamento.
- **Manual exportado:** rodapé "Manual feito com o Explicaí Studio." sem link (`src/core/export/labels.ts:19,33`; `html.ts:49`).

**explicai-mcp**
- Só `LICENSE` (MIT) e um `README.md` com o título. Nada mais.

**Marca**
- "Endosso: um projeto codesampa.io no rodapé do site e do README. O fundador não aparece na interface" (PRODUCT.md). Isso limita "créditos" no Studio: nada de nome pessoal na tela.
- Voz do app e do README: formal, "você", uma ideia por frase, sem hype (módulo 5). O guia de contribuição segue esse registro.

## O que projetos parecidos fazem
Só tenho fonte para o que o GitHub reconhece e exibe:

- O GitHub reconhece `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `FUNDING.yml` e templates em `.github/ISSUE_TEMPLATE`. Quem abre issue ou PR vê o link para o guia de contribuição. Fonte: [GitHub Docs](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file).
- Esses arquivos podem ficar numa conta em um repositório `.github` e valer para todos os repositórios sem o seu. Serve ao `explicai-mcp` e ao Studio. Mesma fonte.

Não verifiquei o que Scribe, Tango, GitBook, Notion ou Mintlify fazem para contribuição. Eles são produtos fechados, então o caso é pouco comparável. Hipótese a checar: ferramentas open source de documentação costumam ter um link "Contribuir" ou "GitHub" no site e no menu de ajuda, e "Edit this page" nos docs. Não confirmei.

Onde ser diferente: o Studio roda local e sem conta. Um link discreto para o repositório e para as issues basta, sem pedir estrela, sem banner e sem rastreio.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A** | `CONTRIBUTING.md` curto (como rodar, `npm run check`, commits, como abrir issue e PR) e `CODE_OF_CONDUCT.md`; README aponta para eles. Em cada repo | P | Prometer revisão que não dá para cumprir; texto com tom de IA | Templates, interface, créditos |
| **B** | A + templates de issue (bug, ideia) e de PR em `.github/`, e link "Ajuda e contribuição" no Studio (diálogo de ajuda com repositório, issues e guia; abre em nova aba) | M | Tela nova; link sai do app local (offline não abre); i18n pt/en | Créditos, rodapé do manual exportado |
| C | B + arquivo de créditos/CONTRIBUTORS, seção "Sobre" no Studio com licenças das fontes, "good first issue" e link no manual exportado | G | Crédito vira manutenção; link no manual do cliente pode ser indesejado; nome pessoal na interface contraria PRODUCT.md | — |

**Recomendação: A, com o link do Studio (parte de B) só depois.** O guia é o que falta de verdade e custa quase nada. Quando existir, o link no Studio tem para onde apontar. Observar: chegam issues e PRs de fora? Se sim, vale B inteiro. Se ninguém aparece, o link no app era enfeite.

Link no Studio, quando entrar: dentro de um diálogo de ajuda que já existe (`ShortcutsDialog`) ou ao lado dele, não na tela de edição. Sem cor nova, sem ícone chamativo.

## Riscos
- **Prometer demais.** O guia diz o que dá para cumprir: "Respondo quando puder" é mais honesto que prazo.
- **Manual do cliente.** O rodapé exportado é do cliente final. Link para o repositório ali é decisão de marca, não de contribuição. Fica fora.
- **Código de conduta.** Copiar um texto padrão (como o Contributor Covenant) exige confirmar a licença e o contato de denúncia. É decisão sua, porque o contato é seu.
- **Privacidade.** Link do Studio abre site externo, sem enviar dado nenhum. Sem script de terceiros.
- **Dois repositórios, dois guias.** Duplicar texto desatualiza. Usar um repositório `.github` da conta resolve, ou o guia do MCP apontar para o do Studio.
- **Equipe de agentes.** `CLAUDE.md` e `.claude/rules/` não são guia para pessoas. O `CONTRIBUTING.md` deve resumir e linkar, sem copiar.

## Decisões suas (com recomendação)
1. Começar só pelo guia (A)? → Sim.
2. Um guia por repositório ou um repositório `.github` da conta? → Um `CONTRIBUTING.md` no Studio; o do MCP linka para ele.
3. Código de conduta: adotar o Contributor Covenant? → Sim, com o seu contato para denúncias.
4. Que contato recebe denúncia e segurança? → Um e-mail do projeto, não o pessoal.
5. Link para o repositório no Studio: quando? → Depois do guia, no diálogo de ajuda.
6. Créditos com nome de pessoas na interface? → Não. Fica no `CONTRIBUTORS` ou no GitHub; a interface segue "um projeto codesampa.io".
7. Link no rodapé do manual exportado? → Não.
8. Idioma do guia? → Português primeiro e um resumo em inglês, como no README.

## Rascunho de spec (opção A)
- **Escopo:** `CONTRIBUTING.md` na raiz do Studio, em pt-BR, com resumo em inglês no fim. Conteúdo: como rodar (`npm install`, `npm run dev:server`, `npm run dev:web`); `npm run check` antes do PR; commits no padrão de `.claude/rules/commits.md`; o que não muda sem conversa (formato em Markdown, licença MIT, sem dependência GPL); como abrir uma issue; o que esperar de resposta. `CODE_OF_CONDUCT.md`. Linkar os dois no README (trocar a frase atual por link). Mesmo para o `explicai-mcp`, enxuto. Só dentro de cada repositório; sem tocar o código do Studio.
- **Critérios de aceite:**
  - O README do Studio e o do MCP linkam o guia; os links abrem.
  - Seguir só o guia leva a um clone que passa em `npm run check`.
  - O guia usa "você", frases curtas, sem hype e sem citar concorrente.
  - Nenhum nome de pessoa novo aparece na interface.
  - O guia não repete `CLAUDE.md` e não cita os agentes.
  - `npm run check` segue passando (a mudança é só de documentação).
- **Riscos:** prometer prazo; contato pessoal exposto; guias duplicados nos dois repositórios.

Não verificado: o que concorrentes e ferramentas parecidas fazem na interface para contribuição (não achei fonte); se existe repositório `.github` na conta.

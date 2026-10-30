# Discovery: checagem do manual no sistema (2026-10-30)

Ideia do caderno (28/10): "verificar se o que está no manual ainda funciona no sistema. Abrir o sistema, seguir os passos e apontar o que quebrou: tela mudou, botão sumiu, print desatualizado."

## Problema
Quem mantém o manual de um sistema (dev, software house, suporte) não sabe quando uma tela mudou e o passo escrito ficou errado. Descobre quando o cliente reclama. Hoje faz sem ferramenta: abre o sistema, relê o manual e compara a olho, ou nem faz. Gatilho "a tela mudou e o manual ficou velho" (`brand/discovery/90_SYNTHESIS.md:41`). Hipótese: ainda não há usuário real que confirme a dor (PRODUCT.md, "Evidence on Hand").

## O que já existe
- **A spec deixa de fora de propósito:** "checagem automática do manual no sistema (Chrome DevTools MCP)" está em "Fora da v1" (`docs/spec-v1.md:51`). Este discovery decide se sai de lá.
- **Passos são texto livre.** Lista numerada com `**negrito**` no botão (`docs/manual-format.md`, exemplo de página). Não há campo de URL, seletor ou "resultado esperado". Quem vai ler isso é um modelo, não um script.
- **Imagem + anotações em JSON ao lado** (`assets/<img>.json`, `docs/manual-format.md`, "Anotações da imagem"): `markers` com `label` ("Novo cliente"), `highlights`, `hotspots`, coordenadas de 0 a 1. O `label` do marcador é a melhor pista de "qual elemento é este".
- **Nada guarda a URL de origem do print** nem a data em que foi tirado. Sem isso, a checagem não sabe onde abrir cada tela. Formato de dados mudando: risco alto (ver abaixo).
- **PDF já usa navegador headless** (`src/core/export/pdf.ts:51`, `EXPLICAI_BROWSER`). Há código que acha Chrome, mas não conduz páginas.
- **`explicai-mcp`** (irmão, só leitura): hoje só tem README e LICENSE, sem código. Usará `explicai/core` (`CLAUDE.md`, "Estrutura"). A spec o define como "funciona sem o Studio aberto" (`docs/spec-v1.md:46`).
- **Versões e status** (`.versoes/`, `status:`, `published`) já permitem marcar uma página como "revisada em tal data".

## Concorrentes
| Produto | O que faz | Fonte |
|---|---|---|
| Doc Detective (open source) | Executa em navegador os passos escritos na documentação e devolve PASS/FAIL em JSON; testes inline em Markdown; sai com código 1 no CI | [npm](https://npmjs.com/package/doc-detective), [inline tests](https://www.mintlify.com/doc-detective/doc-detective/guides/inline-tests), [FOSDEM 2025](https://fosdem.org/schedule/event/fosdem-2025-4928-no-more-broken-docs-keep-docs-accurate-with-doc-detective) |
| Scribe, Tango, GitBook, Confluence, Notion | Não achei recurso que teste o guia contra o sistema real. Hipótese, não afirmação: a busca não cobriu esses produtos | — |

Padrão: quem testa documentação é ferramenta de dev, com teste escrito à mão (JSON ou comentário no Markdown). Ninguém que eu tenha achado lê um manual em linguagem natural, abre o sistema e diz "o botão Novo cliente não está mais aqui". Onde ser diferente: o manual do Explicaí já tem rótulo, passo e imagem anotada; a checagem lê isso sem exigir que a pessoa escreva teste.

Não verificado: os recursos atuais de Scribe e Tango. Antes de afirmar "ninguém faz", ler a ajuda de cada um.

## Onde vive: MCP, não Studio
- O Studio é editor local sóbrio e **não captura tela** (`CLAUDE.md`, "Decisões que não mudam"). Abrir o sistema de um cliente é outra natureza: navegador, login, rede.
- Quem conduz o Chrome DevTools MCP é o agente de IA (a pessoa já tem o MCP configurado no Claude). O `explicai-mcp` é o lugar natural para oferecer as ferramentas de **ler o roteiro e gravar o resultado**; o navegador fica com o outro MCP.
- O Studio só **mostra** o resultado (selo "verificado em 29/10" ou "3 passos não bateram" na página). Sem navegador, sem credencial.
- Portanto o `explicai` (este repositório) toca só em formato e exibição; a checagem em si é trabalho do `explicai-mcp` mais uma instrução (prompt/skill) para o agente.

## Corte mínimo: sem formato novo
O menor jeito de entregar o valor não precisa de código de navegador:
1. O `explicai-mcp` expõe uma ferramenta `roteiro_de_checagem(manual, pagina)` que devolve, por passo: o texto, os rótulos dos marcadores da imagem e o caminho do print.
2. O agente abre o sistema com o Chrome DevTools MCP (`navigate_page`, `take_snapshot`, `click`), segue o roteiro e compara o snapshot com os rótulos.
3. O agente devolve um relatório em Markdown no chat: passo, o que esperava, o que viu, print novo (opcional).
4. A pessoa decide o que corrigir. Nada é gravado sem pedir.

Perguntas que esse corte não responde (e ficam para depois): onde fica o login, em que URL cada página começa, como detectar print desatualizado sem comparar pixels.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A** | Roteiro + instrução para o agente (skill/prompt). A pessoa roda a checagem no Claude com o Chrome DevTools MCP e lê o relatório no chat. Nenhum formato novo | P | Qualidade depende do modelo; passo ambíguo gera falso alarme; login e URL ficam por conta da pessoa | Selo no Studio, histórico, print comparado, CI |
| B | A + `theme`-like campo opcional no `manual.json` (`system.baseUrl`) e no frontmatter (`url`, `checkedAt`); Studio mostra "verificado em" e "não bateu" por página | M | Formato muda (campo opcional, preservado por `readManual`, sem `FORMAT_VERSION` 2); dado de data "envelhece"; selo falso passa confiança que o sistema não tem | Comparação de imagem, execução sem agente |
| C | B + comparação do print novo com o do manual (diff visual) e checagem agendada no CI | G | Diff de pixel dá falso positivo (dado, fonte, tema); precisa de ambiente com login; vira produto de teste, concorrente do Doc Detective | — |

**Recomendação: A.** Prova se a dor existe sem tocar no formato nem no Studio. O resultado é relatório no chat, descartável. Medir: quantas vezes a pessoa roda e quantos achados ela corrige. Se corrigir de verdade e pedir "lembrar quando foi a última checagem", aí vale B.

## Riscos
- **Credenciais:** sistema do cliente tem login. O agente não deve receber senha em texto; usar o Chrome já logado da pessoa. O Chrome DevTools MCP pode se ligar a um Chrome aberto (flag de URL do navegador): confirmar na documentação antes de prometer. Hipótese.
- **Falso alarme:** botão renomeado de "Novo cliente" para "Adicionar cliente" é mudança real ou ajuste de texto? O relatório deve dizer "provável" e mostrar o que viu.
- **Ação destrutiva:** seguir "Clique em **Excluir**" num sistema de produção apaga dado. A checagem deve ser só de leitura por padrão: abre, localiza, não clica em botão que altera. Isso precisa estar escrito na instrução do agente.
- **Formato (opções B e C):** campos novos em `manual.json`/frontmatter são opcionais e preservados, mas o `explicai-mcp` e o Studio precisam concordar. Mudança em `docs/manual-format.md` exige revisão.
- **Marca:** o Studio é sóbrio. Selo de verificação é texto e ícone neutros, sem cor de alerta enfeitada.

## Decisões suas (com recomendação)
1. Isto sai do "fora da v1" da spec? → Sim, só a opção A, e fica registrada como pós-v1.
2. Onde vive? → No `explicai-mcp` (ferramenta de roteiro) mais uma skill/prompt; o Studio só exibe, e só na opção B.
3. A checagem pode clicar? → Não por padrão: só abrir, localizar e comparar. Clique só com a pessoa confirmando.
4. Quem faz login? → A pessoa, no Chrome dela. O agente nunca guarda senha.
5. Tem usuário real para testar a dor? → Rodar em um manual de verdade seu antes de abrir ticket de B.

## Rascunho de spec (opção A)
- **Escopo:** (no `explicai-mcp`) ferramenta `roteiro_de_checagem` que lê uma página e devolve passos, rótulos dos marcadores e caminho dos prints. Uma instrução para o agente: abrir o sistema com o Chrome DevTools MCP, seguir o roteiro só em leitura, devolver relatório. (Neste repositório) atualizar `docs/spec-v1.md:51` para "pós-v1, em avaliação" e, se o `core` precisar de um helper de leitura de passos+rótulos, expô-lo em `src/core`. Sem mudança no formato, no Studio nem no HTML exportado.
- **Critérios de aceite:**
  - Para uma página com 5 passos e 3 marcadores, o roteiro lista os 5 passos e os 3 rótulos, na ordem.
  - Página sem imagem devolve só os passos, sem erro.
  - Rodando contra um sistema de exemplo onde um botão foi renomeado, o relatório aponta o passo e o que viu no lugar.
  - O relatório não altera nenhum arquivo do manual.
  - A checagem não clica em botão cujo nome indique exclusão ou envio, sem confirmação.
- **Riscos:** falso alarme; ação destrutiva; credenciais; qualidade do modelo variando. Dependência do `explicai-mcp`, que ainda não tem código.

Não verificado: flags atuais do Chrome DevTools MCP (conectar a navegador já aberto); recursos de Scribe e Tango.

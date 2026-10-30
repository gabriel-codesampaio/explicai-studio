# Discovery: botão Exportar sempre à direita, em destaque (2026-10-30)

Ideia original no caderno (30/10/2026): `#app` - Inverter a ordem do botão de Exportar, colocar ele sempre a direita, com cores que chamem a atenção

Complementa [T-006](../tickets/fechados/T-006-exportar-no-topo.md), que levou "Exportar manual" para o topo da página. Ideia do caderno (#app): "Inverter a ordem do botão de Exportar, colocar ele sempre a direita, com cores que chamem a atenção".

## Problema
Quem termina de escrever e quer entregar o manual procura "Exportar manual" no canto onde as ferramentas costumam guardar a ação final (direita). Hoje ele é o primeiro de quatro itens do topo, e os três vizinhos são texto cinza pequeno, então a ação principal fica no meio do grupo. Hipótese: sem usuário real que tenha reclamado; é leitura do caderno.

## O que existe hoje (verificado no código)
- `web/src/layout/PageView.tsx:49-72`: uma linha `flex flex-wrap` com o caminho (`basis-full` abaixo de `sm`, `flex-1` de `sm` para cima), depois `ExportDialog`, `StatusMenu`, `PageOutlineButton` (só com títulos na página) e `VersionsPanel`.
- De `sm` para cima, o `flex-1` do caminho já empurra o grupo para a direita, mas Exportar é o item mais à esquerda dele. Abaixo de `sm`, o caminho ocupa a linha inteira e os botões caem na segunda linha, alinhados à esquerda. Então "sempre à direita" hoje não vale em 375 px.
- `ExportDialog.tsx:58`: `<Button>` sem variante, ou seja, `variant="default"` = `--primary` = cobalto sólido (`tokens.css:30`; claro `#2B4FE0` com texto branco; escuro `#8098FF` com texto `#0E1120`). A cor já é a de destaque. Percebe-se pouco porque os vizinhos têm `text-[13px]` e o botão fica na primeira posição.
- `VersionsPanel.tsx:68`: botão-texto de 13 px, e a etiqueta "Versão do manual" usa `bg-marca` (amarelo, permitido: conteúdo realçado).
- Testes e2e localizam por papel e nome (`e2e/studio.e2e.ts:305,332,361-362`), então trocar a ordem não os quebra.

## Concorrentes
| Produto | O que faz | Fonte |
|---|---|---|
| Confluence Cloud | Ação final do editor ("Publicar", depois "Atualizar") fica na barra de ferramentas como botão de destaque; o rótulo muda com o estado da página | [Atlassian Support](https://support.atlassian.com/confluence-cloud/docs/what-is-the-new-and-improved-publishing-experience/), [comunidade](https://community.atlassian.com/t5/Confluence-questions/No-publish-button/qaq-p/1171521) |
| Notion (botão Compartilhar) | Hipótese: canto superior direito, ao lado de menus discretos. Não verificado nesta pesquisa. | — |
| GitBook (Publicar) | Hipótese: ação principal no canto superior direito do editor. Não verificado. | — |

Fato confirmado: só o Confluence, e a fonte não informa a posição exata nem a cor. A convenção "ação final à direita, uma só em destaque" é hipótese de design comum, não fato citado. Dá para ser diferente em coisa pequena: o botão diz o que acontece ("Exportar manual") e é o único sólido, como o brand book já manda (`marca-resumo.md:13`).

## Cor
"Cores que chamem a atenção" cabe no cobalto sólido, que já é o primário. Amarelo está fora: `marca-resumo.md:6` restringe o marca-texto a conteúdo realçado e página ativa, e a etiqueta "Versão do manual" já o usa ao lado. Dois amarelos na mesma linha se confundem. Chamar atenção sai de três coisas, todas dentro dos tokens:
1. Posição: último à direita.
2. Peso: `font-semibold` e altura `h-9` contra os 13 px dos vizinhos.
3. Único sólido da linha (já é).
Contraste: branco sobre `#2B4FE0` passa 4,5:1 no claro (hipótese de cálculo, medir com script); no escuro `#0E1120` sobre `#8098FF` também (medir). Cor nunca é o único sinal: o rótulo em texto fica.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| 0 | Nada muda; só aumentar o peso do botão (`font-semibold`, `h-9`) | P | Continua no meio do grupo | Posição |
| **1** | Exportar vira o último item, sempre à direita (também em 375 px, `ml-auto`/`justify-end` na linha de botões); ordem: Versões, Status, Índice, Exportar; peso um pouco maior | P | Cabe em 375 px? Quatro itens somam ~360 px contra ~335 úteis (estimativa, medir); se não couber, quebra de linha ou Índice só com ícone | Cor nova, barra fixa |
| 2 | 1 + barra do topo fixa (sticky) com Exportar sempre visível ao rolar | M | Come altura útil em tela pequena; conflita com o índice sticky do `xl`; mais uma superfície para testar | Cor nova |

Estados no corte 1: hover e foco visível já vêm do `Button` (anel cobalto 3 px). Sem páginas, o botão continua oculto (`PageView.tsx:61`), sem mudar a posição dos outros, pois ele fica por último. Durante a exportação o estado aparece dentro do diálogo, sem mudar. Rótulo não muda por estado (sem "Atualizar" como no Confluence; não há "publicar").

## Recomendação: opção 1
Resolve o que o caderno pede (direita, ordem invertida, destaque) com uma troca de ordem e uma classe, nenhum token novo, nenhum formato de dado tocado. Observar depois: se em 375 px o botão não couber sem quebrar, ou se as pessoas rolarem a página longa e voltarem ao topo para exportar, a opção 2 vale.

## Acessibilidade
- Ordem visual e de DOM iguais (mover o JSX, sem `order-*`), para o Tab seguir o que se vê. Exportar é o último Tab da linha.
- Alvo de toque 44 px em tela de toque, como o T-006 fez no ⋯ (`20a0872`).
- Foco sempre visível e 4,5:1 no texto, nos dois temas.

## Decisões suas (com recomendação)
1. Amarelo no botão? → Não; cobalto sólido, amarelo fica restrito.
2. Em 375 px, Exportar sozinho na linha à direita ou junto com os outros? → Junto, se couber; senão linha própria à direita.
3. Barra fixa ao rolar? → Não agora (opção 2 depois, se observarmos a necessidade).
4. O índice da página (ícone/botão) fica antes de Exportar? → Sim: Versões, Status, Índice, Exportar.

## Rascunho de spec (opção 1)
- **Escopo:** em `web/src/layout/PageView.tsx`, mover `<ExportDialog />` para depois de `VersionsPanel`; a linha de botões fica à direita em qualquer largura (`ml-auto`, `justify-end`); em `ExportDialog.tsx`, botão com `font-semibold` e `h-9` (44 px em toque, como o ⋯). Sem token, sem cor nova, sem texto novo (nada em `i18n.en.ts`).
- **Critérios de aceite:**
  - Em 375, 960 e 1440 px, Exportar é o último item da linha e encosta na borda direita da coluna do texto, sem rolagem lateral.
  - É o único botão sólido da tela e o amarelo não aparece nele.
  - Tab percorre Versões, Status, Índice, Exportar, nessa ordem.
  - Claro e escuro: texto do botão com contraste ≥ 4,5:1, medido por script.
  - Exportar continua funcionando (e2e de exportação existente passa) e continua oculto em manual sem páginas.
- **Riscos:** quatro itens em 375 px podem não caber (medir antes de decidir o plano B); o `PinnedNotice` e a etiqueta "Versão do manual" alargam o grupo; o escuro nunca foi visto no T-006.
- **Verificação:** `npm run check`, `npm run test:e2e`, medidas em 375/960/1440, claro e escuro.

Não verificado: contraste calculado (só lido dos tokens), largura real em 375 px, Notion e GitBook, app rodando.

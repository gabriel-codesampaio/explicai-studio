# T-073: Controles de tabela direto na tabela

- Prioridade: P2
- Tamanho: G
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-30

## Problema
Com o cursor na tabela, a barra fixa mostra Adicionar linha, Adicionar coluna e Remover tabela, mas ninguém acha olhando a tabela. A pessoa quer os botões na própria tabela, como no Confluence e no Notion.

## Critérios de aceite
- [x] "+" na borda direita (adicionar coluna) e na borda de baixo (adicionar linha), visíveis ao passar o mouse ou com a tabela em foco.
- [x] Menu por linha e por coluna (alça na lateral ou no topo da célula): inserir acima/abaixo, inserir à esquerda/direita, remover linha, remover coluna, alternar linha de cabeçalho; remover a tabela inteira.
- [x] Comandos do TableKit do Tiptap já existentes (addRowBefore/After, addColumnBefore/After, deleteRow, deleteColumn, toggleHeaderRow, deleteTable); sem dependência nova.
- [x] Teclado: tudo alcançável também pela barra fixa ou por menu com nome acessível; Tab entre células continua.
- [x] 375 px, claro e escuro; o Markdown salvo não muda (teste de ida e volta da tabela GFM).
- [x] e2e: adicionar e remover linha e coluna pelos controles novos e recarregar. O design decide a forma (revisar-design).

## Onde
`web/src/features/editor/Toolbar.tsx`, extensão de tabela em `extensions.ts`, componente novo de controles.

## Como verificar
Teste primeiro; e2e da área; medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
Commits e183dd6 (comandos e teste) e 236239e (controles). Alças por linha e por coluna (menu: inserir acima/abaixo, esquerda/direita, remover, linha de cabeçalho, remover tabela), "+" na borda direita e na de baixo, visíveis com o mouse sobre a tabela ou o cursor nela. A barra fixa ganhou "Opções da tabela" com as mesmas ações, para o teclado. Sem dependência nova; o Markdown salvo não muda (teste de ida e volta). Testes: web/test/tableCommands.test.ts e e2e/studio.tabela.e2e.ts. Conferido no Chrome, claro e escuro, 1280 e 375 px. Fora: arrastar para reordenar linha ou coluna.

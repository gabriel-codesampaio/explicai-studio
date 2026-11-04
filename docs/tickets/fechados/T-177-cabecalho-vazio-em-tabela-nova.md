# T-177: Dar texto ao cabeçalho de tabela nova

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado B7 (avaliado no commit 60a0e3d)

## Problema
Achado B7, axe menor, critério 1.3.1. Tabela nova sai com cabeçalho de célula vazio.

## Critérios de aceite
- [x] Tabela nova não tem cabeçalho de célula vazio.
- [x] Axe sem violação de 1.3.1 na tabela nova.

## Onde
- web/src/features/editor (criação de tabela; confirmar o arquivo ao começar)

## Como verificar
Inserir uma tabela nova e rodar axe. Conferir o HTML do cabeçalho.

## Registro
Commit: este commit. Tabela nova (menu / e barra) sai com cabeçalho Coluna 1..3 via insertNewTable em tableCommands.ts, sem th vazio. Axe não rodado, só teste de DOM em web/test/newTable.test.ts.

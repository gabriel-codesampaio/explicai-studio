# T-583: reserva de nome em uniquePath deixa arquivo vazio órfão se a gravação falha

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: revisão do 1.0.1 (2026-11-06)

## Problema
`src/core/fs.ts:38-45` (`uniquePath`) reserva o nome criando um arquivo vazio. Se quem chamou falha antes de gravar, sobra o arquivo vazio: `pages.ts` (newPageFile), `versions.ts` (saveVersion; `listVersions` pode listar versão vazia) e `trash.ts` (restorePage).

## Outros achados menores da mesma revisão
- `trash.ts` removePage: sem rollback dos `moved` se `updateManual` falhar.
- `replaceAsset.ts`: pasta `.lixeira/imagens-<ms>` pode colidir no mesmo milissegundo; `sameKind` só olha a extensão.
- `search.ts` searchBodies: leitura sem limite (EMFILE em manual com centenas de páginas).

## Critério
Apagar a reserva no catch do chamador; teste de falha de gravação em saveVersion.

# T-015: "Só páginas aprovadas" desabilitado quando não há nenhuma

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
A opção fica marcável com zero páginas aprovadas, e a exportação sai vazia.

## Critérios de aceite
- [x] Com zero páginas aprovadas ou publicadas, a opção fica desabilitada com a explicação.
- [x] A exportação nunca gera um manual vazio sem avisar.

## Onde
`features/export/ExportDialog.tsx`, `src/core/export/index.ts`.

## Como verificar
Teste do núcleo para exportação vazia; teste de ponta a ponta do diálogo.

## Registro
Commit: bf91cab.

Feito: opção desabilitada (e desmarcada no envio) com a explicação quando há zero aprovadas ou publicadas; `exportManual` lança erro se `onlyApproved` e nenhuma página entra. Teste do núcleo e e2e do diálogo. Fora: nada.

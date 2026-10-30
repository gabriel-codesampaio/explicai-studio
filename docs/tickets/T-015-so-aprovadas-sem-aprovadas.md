# T-015: "Só páginas aprovadas" desabilitado quando não há nenhuma

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
A opção fica marcável com zero páginas aprovadas, e a exportação sai vazia.

## Critérios de aceite
- [ ] Com zero páginas aprovadas ou publicadas, a opção fica desabilitada com a explicação.
- [ ] A exportação nunca gera um manual vazio sem avisar.

## Onde
`features/export/ExportDialog.tsx`, `src/core/export/index.ts`.

## Como verificar
Teste do núcleo para exportação vazia; teste de ponta a ponta do diálogo.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

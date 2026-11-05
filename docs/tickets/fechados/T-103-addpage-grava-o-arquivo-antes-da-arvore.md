# T-103: `addPage` grava o arquivo antes da árvore

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 20 (`docs/discovery/archives/2026-11-02-auditoria-ponytail.md`)

## Problema
`addPage` grava o arquivo antes da árvore

## Critérios de aceite
- [x] `addPage` grava o arquivo antes da árvore
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
Ver a seção do achado na auditoria.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 20 da auditoria.

## Registro
Commit b9496ba. `addPage` grava o arquivo, depois a árvore; falha na árvore remove o arquivo. Testes em `test/robustness.test.ts`. Fora: colisão de nome em duas criações simultâneas (já existia).

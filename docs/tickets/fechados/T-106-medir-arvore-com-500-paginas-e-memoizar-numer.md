# T-106: Medir árvore com 500 páginas e memoizar numeração

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: qa
- Origem: auditoria ponytail de 2026-11-02, achado 25 (`docs/discovery/archives/2026-11-02-auditoria-ponytail.md`)

## Problema
Medir árvore com 500 páginas e memoizar numeração

## Critérios de aceite
- [x] Medir árvore com 500 páginas e memoizar numeração
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
Ver a seção do achado na auditoria.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 25 da auditoria.

## Registro
- Medido (500 páginas): `numberPages` 0,035 ms (mediana de 3x200); re-render do PageTree ~400 ms (happy-dom, ruidoso) por tecla/dragOver. A numeração não era o gargalo; `useMemo([pages])` em `PageTree.tsx` evita 2 de 3 chamadas durante dragOver (teste `web/test/pageTreeNumbers.test.tsx`). O custo real são as 500 linhas: T-422 (React.memo na linha).

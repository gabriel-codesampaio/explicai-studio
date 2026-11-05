# T-104: Separar CSS de `html.ts` e ações de `useStudio`

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 21 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
Separar CSS de `html.ts` e ações de `useStudio`

## Critérios de aceite
- [x] Separar CSS de `html.ts` e ações de `useStudio`
- [x] Teste cobrindo o caso (testes existentes de exportação HTML e de useStudio provam a saída e a API idênticas); `npm run check`.

## Onde
Ver a seção do achado na auditoria.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 21 da auditoria.

## Registro
- Commits 69cd651 (CSS de `html.ts` para `src/core/export/htmlCss.ts`, texto idêntico) e d1e5c67 (versão, exportação, tema, capa, rodapé e logo para `web/src/hooks/useManualActions.ts`; `useStudio` devolve a mesma API).
- Só moveu código. Verificado: vitest src (104 arquivos, 746 testes) e web (56, 299) verdes; biome e tsc limpos.
- Fora: ações de página, áudiência e conflito seguem em `useStudio` (dependem de refs internas).

# T-085: Fila por pasta em `updateManual` (perda de mudança na árvore)

- Prioridade: P1
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 2 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
duas requisições leem o mesmo `manual.json`, cada uma muda uma cópia, e a que grava por último apaga a mudança da outra. O servidor é assíncrono e não serializa nada.

## Critérios de aceite
- [ ] uma fila por pasta (`Map<string, Promise<unknown>>`) dentro de `updateManual`; cada chamada encadeia na anterior.
- [ ] `Promise.all` de 10 `addPage` devolve 10 nós na árvore.

## Onde
`src/core/manuals.ts:234-239` (`updateManual` lê, muda e grava sem trava); usado em `src/core/pages.ts:25,123`, `src/core/trash.ts:318,354`, `src/core/versions.ts:444`, `src/core/export/index.ts:342`.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 2 da auditoria.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

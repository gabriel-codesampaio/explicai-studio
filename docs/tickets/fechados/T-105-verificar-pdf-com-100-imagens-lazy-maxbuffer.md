# T-105: Verificar PDF com 100 imagens (`lazy`, `maxBuffer`)

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: qa
- Origem: auditoria ponytail de 2026-11-02, achado 24 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
Verificar PDF com 100 imagens (`lazy`, `maxBuffer`)

## Critérios de aceite
- [x] Verificar PDF com 100 imagens (`lazy`, `maxBuffer`)
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
Ver a seção do achado na auditoria.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 24 da auditoria.

## Registro
- Medido (100 PNGs 1280x720, 3 rodadas, Chrome real): PDF em 4,8 s (mediana), RSS do Node 86 MB, 1,2 MB, 100 de 100 imagens presentes; stderr do Chrome 76 bytes no pior caso (3000 imagens quebradas) contra limite de 1 MB do execFile. `lazy` e `maxBuffer` não falham; sem mudança em `html.ts`/`pdf.ts`. Teste de regressão `test/export-pdf-images.test.ts` (pula sem Chrome).

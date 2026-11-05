# T-098: Descartar resposta antiga ao trocar de página

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 15 (`docs/discovery/archives/2026-11-02-auditoria-ponytail.md`)

## Problema
Descartar resposta antiga ao trocar de página

## Critérios de aceite
- [x] Descartar resposta antiga ao trocar de página
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
Ver a seção do achado na auditoria.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 15 da auditoria.

## Registro
Commit c1c8e26. `showPage` (e `addPage`) usam um contador de abertura; resposta de página antiga é descartada e não troca a página nem o endereço. Teste: `web/test/useStudio.test.tsx`. Fora: `openManual` com página inexistente e `restorePage` não bumpam o contador.

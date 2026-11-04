# T-099: Posição da imagem colada acompanha edição durante o envio

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 16 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
Posição da imagem colada acompanha edição durante o envio

## Critérios de aceite
- [x] Posição da imagem colada acompanha edição durante o envio
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
Ver a seção do achado na auditoria.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 16 da auditoria.

## Registro
Commit 1164a5a. `insertImages` ouve as transações do editor e mapeia a posição (`transaction.mapping`), então a imagem entra onde o ponto de colagem foi parar e a posição não passa do fim do documento. Teste: `web/test/imageUpload.test.ts` (vermelho antes).

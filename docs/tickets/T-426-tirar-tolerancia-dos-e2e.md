# T-426: Tirar a tolerância dos e2e que só falham no CI

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: qa
- Origem: sobras do T-129 e do lote de regressões, 2026-11-05

## Problema
`studio.imagem.e2e.ts:460` ("reabre no primeiro clique") e `studio.publicos-dialogo.e2e.ts:101` falharam no CI e nunca local. Ganharam `toPass`/`expect.poll` (5b760f1), o que pode esconder defeito.

## Critérios de aceite
- [ ] Depois de 10 runs de CI seguidos sem falha nesses testes, tirar a tolerância e ver se seguem verdes; se voltarem a falhar, achar a causa com o trace do CI.
- [x] Varrer os e2e com `goto("/")` seguido de `goto` com hash (mesmo padrão do `bigPng`) e trocar por `about:blank`.

## Registro
- Estado: aberto. Varredura feita; faltam os 10 runs de CI seguidos sem falha em `studio.imagem.e2e.ts` ("reabre no primeiro clique") e `studio.publicos-dialogo.e2e.ts`, para então tirar o `toPass`/`expect.poll`.
- Varredura: `grep` de `goto("/")` em `e2e/` acha um só, em `studio.erros.e2e.ts` (403), sem `goto` com hash depois na mesma página. `studio.passeio.e2e.ts` vai de `/#/slug/id` para `/?passeio=1#...`, o que muda a query e recarrega, então não cai no caso de navegação no mesmo documento. `bigPng` já usa `about:blank` (T-425). Nada a trocar.
- 2026-11-06: 2 CIs seguidos verdes na main (#160, #161), logo 2 de 10. Segue aberto.

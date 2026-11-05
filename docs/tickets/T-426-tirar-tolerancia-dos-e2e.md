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
- [ ] Varrer os e2e com `goto("/")` seguido de `goto` com hash (mesmo padrão do `bigPng`) e trocar por `about:blank`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

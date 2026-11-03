# T-021: Apagar as pastas temporárias que o e2e/serve.mjs cria

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: qa
- Origem: Combinado com a pessoa (2026-10-29)

## Problema
O `e2e/serve.mjs` cria uma pasta `explicai-e2e-*` em `os.tmpdir()` a cada execução (`mkdtemp`) e nunca apaga. Cada `npm run test:e2e` e cada conferência na tela deixa uma pasta com manuais de teste para trás.

## Critérios de aceite
- [x] Ao encerrar o servidor (SIGINT, SIGTERM ou fim do Playwright), a pasta temporária criada por ele é apagada.
- [x] Uma rodada de `npm run test:e2e` não deixa pasta `explicai-e2e-*` nova no temporário.

## Onde
`e2e/serve.mjs`.

## Como verificar
Rodar `npm run test:e2e` e listar `explicai-e2e-*` no temporário antes e depois.

## Registro
Fechado na branch fix/lote-4-tecnico. Pasta fixa por porta (`explicai-e2e-<porta>`), apagada pelo `globalTeardown` do Playwright (no Windows o servidor morre sem sinal) e por SIGINT/SIGTERM fora dele; `serve.mjs` limpa sobra ao subir. Pastas antigas aleatórias (~440) continuam no temporário, apagar à mão.

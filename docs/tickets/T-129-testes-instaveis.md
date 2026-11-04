# T-129: Testes que falham às vezes: reduzir e unused-assets-race

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: qa
- Origem: CI e revisão do T-122 (2026-11-03)

## Problema
`e2e/studio.reduzir.e2e.ts:78` falhou duas vezes no CI, com timeout de 30 s num clique, e passou ao rodar de novo. `test/unused-assets-race.test.ts` falhou uma vez na suíte completa, também na main. Cada falha obriga a rodar o CI de novo.

## Critérios de aceite
- [ ] Causa medida, não presumida (skill `diagnosticar`).
- [ ] Os dois passam com `--repeat-each` e 2 workers.

## Como verificar
`npx playwright test e2e/studio.reduzir.e2e.ts --repeat-each=10 --workers=2` e `npx vitest run test/unused-assets-race.test.ts --maxWorkers=2` em repetição.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

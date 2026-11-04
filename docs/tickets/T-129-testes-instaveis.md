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
- Unit `unused-assets-race` (resolvido, 7f53d9c): com grace 0, `Date.now()` (inteiro) menos `mtimeMs` (fração) dá negativo e o arquivo recém-gravado contava como recente. Medido: 18116 de 20000 gravações. Falha quando o teste é rápido. Correção em `src/core/assets.ts` (grace 0 desliga a poupança) e teste novo com mtime à frente. 50 rodadas sem falha. O mesmo bug podia afetar o e2e "imagem sem uso" (servidor e2e usa grace 0).
- Aberto: `studio.reduzir.e2e.ts:78`. Não reproduz sem carga (20 de 20, 4 s por rodada). Com 8 processos de CPU, 2 de 75 falharam: a região "Reduzir imagem" não aparece em 5 s (info nunca carrega; `ReducePanel` engole o erro de loadImage/fetch com `.catch(() => {})`). No CI o sintoma foi a imagem não aparecer no editor em 30 s. Mecanismo não provado. Em 140 rodadas do mesmo fluxo com diagnóstico (requestfailed, console), 0 falhas.
- Aberto: `studio.imagem.e2e.ts:457` e `:637`: 10 de 10 passam, sem e com carga. Sem causa medida.

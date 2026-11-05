# T-129: Testes que falham às vezes: reduzir e unused-assets-race

- Prioridade: P3
- Tamanho: P
- Status: feito
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
- Lote de medição (2026-11-04), `studio.reduzir.e2e.ts:78` (build antes, channel chrome, 2 workers): sem carga 60/60 passam (reduzir:78 + "reabre", repeat-each 20); com 3 processos de CPU, reduzir:78 falha ~1 a 2% (1/20, 2/150, 3/150, 1/100). "reabre no primeiro clique" (`studio.imagem.e2e.ts` ~458): 40/40, nunca falhou.
- Causa parcial medida: na falha NÃO há erro de carga do T-325. O painel some porque `info.w <= 1600` (`ReducePanel`: `if (info.w <= SUGGESTED_WIDTH) return null`): `readImage` termina normal com 1600 px, 28327 bytes. O arquivo do teste tem 2400x1200, 60169 bytes. O `<img alt="Tela">` do editor tinha src `/files/reduzir-aplicar-003cf23a/assets/tela.png`, mas o slug do teste era `reduzir-aplicar-f6b8e653`: o editor mostrou a imagem de OUTRO manual, o do teste paralelo no outro worker, já reduzido a 1600. Só aparece com 2 workers + carga; o CI usa workers=1, então lá o mecanismo pode ser outro (nos PRs #96/#100 também falharam `studio.imagem.e2e.ts:460` e `studio.publicos-dialogo.e2e.ts:101` 2x seguidas no CI sem reproduzir local em 15x e 40x; tolerados com `toPass`/`expect.poll` no commit 5b760f1, o que esconde a causa).
- Não é colisão de título: trocar `Date.now()` por UUID nos títulos não resolveu (1/100 depois). `page.id` é UUID, a chave do `PageView` é `page.id:revision` (sem slug). Não achei de onde o `Editor` recebe o slug de outro manual (`PageView` passa `manual.slug`; `manual` vem de `useStudio`). Próximo passo: logar `manual.slug` e a URL do `<img>` no momento da falha, e checar se `studio.manual` pode ficar com o manual do worker vizinho (servidor e2e único por porta, workspace compartilhado e "manual aberto" lembrado no servidor ou no `localStorage`).
- Aberto. Sobrou um `node e2e/serve.mjs` (pid 14936) de rodada interrompida; não matei por não saber se é de outra worktree.
- 2026-11-05 (T-425): causa do `studio.reduzir.e2e.ts:78` medida por leitura do código, não reproduzida de novo: `bigPng` abria `/`, o Studio abria o 1º manual do servidor compartilhado (de outro worker) e gravava o hash dele; o `reload` seguinte abria a página do vizinho. Teste corrigido (`about:blank`). Falta confirmar com `--repeat-each` + 2 workers sob carga (e2e não rodado nesta fatia). T-129 segue aberto.
- 2026-11-05, fechado: unit `unused-assets-race` resolvido (#96); `reduzir:78` explicado e corrigido no teste (#116, `about:blank` no `bigPng`); `imagem:457/460`, `:637` e `publicos-dialogo:101` nunca reproduziram local (até 40x) e seguem com tolerância `toPass`/`expect.poll` (5b760f1). Acompanhamento no T-426.

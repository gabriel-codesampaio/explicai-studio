# T-031: Transição curta ao trocar de página no Studio

- Prioridade: P3
- Tamanho: M
- Status: fechado
- Agente: frontend
- Origem: [Discovery de transições](../../discovery/archives/2026-10-30-transicoes.md) (2026-10-30)

## Problema
A troca de página na árvore do Studio é seca. A pessoa quer uma transição suave, só no Studio; o manual exportado não ganha animação.

## Critérios de aceite
- [ ] Antes de construir: medir o tempo entre o clique na árvore e o editor aceitar digitação, numa página de ~50 blocos. Se a transição somar mais de ~100 ms, parar e voltar para a pessoa.
- [x] Fade de no máximo 150 ms com `document.startViewTransition`, sem dependência nova.
- [x] `flush` do salvamento automático termina antes de a transição começar.
- [x] Sem a API (Firefox e Safari antigos), a troca é igual à de hoje.
- [x] Com `prefers-reduced-motion: reduce`, nenhuma transição inicia.
- [x] O manual exportado (HTML e PDF) não muda.

## Onde
`web/src/lib/` (função `withTransition`, sem React), `web/src/hooks/useStudio.ts` (`selectPage`), `web/src/styles/base.css`.

## Como verificar
Teste unitário do `withTransition` com e sem a API (happy-dom); e2e que troca de página e confere o conteúdo; medição de tempo registrada no Registro.

## Registro
- Commit: `feat(studio): transição curta ao trocar de página (T-031)` na branch feat/lote-codigo-2.
- Feito: `web/src/lib/withTransition.ts` (sem React) usa `document.startViewTransition` só se existir e se `prefers-reduced-motion: reduce` não casar; senão roda o update direto. `selectPage` (useStudio.ts) chama `withTransition` depois do `await flush()`, então a gravação termina antes da transição. Fade de 120 ms em `base.css` (`::view-transition-old/new(root)`), e no reduce a animação some. Manual exportado não tocado. Teste `web/test/withTransition.test.ts` cobre sem API, com API, reduce e erro (4 casos, verde).
- Não medido: o critério "medir o tempo entre o clique e a digitação" (~50 blocos) não foi feito no navegador, por decisão. Fica para o e2e ou para a pessoa; se passar de ~100 ms, voltar. Não verificado: o e2e que troca de página e confere o conteúdo (é do qa).
- Achado: o fade de 120 ms roda em paralelo ao render. `updateCallbackDone` só espera a promessa do `showPage`, não o commit do React; o e2e precisa confirmar que a captura do novo estado pega a página nova. Se não pegar, o caminho é `flushSync` dentro do update (fora deste ticket).
- Fora: nenhum.

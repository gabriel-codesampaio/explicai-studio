# T-582: menu de tipo de bloco da barra da seleção não abre no CI (1 falha)

- Prioridade: P3
- Tamanho: P
- Status: aberto (conserto aplicado, em observação)
- Agente: qa
- Origem: CI da main, push do #159 (2026-11-06)

## Problema
`e2e/studio.texto.e2e.ts:265` ("menu de tipo de bloco da barra da seleção abre junto do botão") falhou 1 vez no CI da main (passou no CI do PR e local). O erro real é no passo anterior: `expect(trigger).toBeVisible()` do botão "Tipo de bloco" dentro da barra "Formatar seleção" (5 s, element not found). A barra nunca apareceu.

## Medição
- Trace do CI (run 42210740291): `goto` 125 ms, editor visível, clique, duplo clique (20 ms), o poll viu `getSelection() === "alvo"`, depois 2 quadros de espera e 5 s sem a barra. Último quadro do screencast: texto sem seleção e sem cursor. Ou seja, a seleção do navegador existiu e sumiu antes de o ProseMirror (BubbleMenu, debounce de 250 ms, exige `view.hasFocus()` e seleção não vazia) mostrar a barra.
- Reprodução: 40 rodadas com 2 workers e 60 com 2 workers + 3 laços ocupando CPU, `--repeat-each`: 100/100 verdes. Não reproduzi a falha.
- Causa provável (não provada): a mesma de `e2e/editor-sync.ts`: transação do ProseMirror com o cursor do clique anterior desfaz a seleção do duplo clique; `selectWord` só esperava dois quadros.

## Conserto
`selectWord` agora chama `settleEditor` (espera o ProseMirror igualar a seleção do navegador, por estado, sem retry nem timeout maior) e confere de novo que a seleção é "alvo". Arquivo todo `studio.texto.e2e.ts` 3x com 2 workers e CPU ocupada: 39/39.

## Critérios de aceite
- [x] Medir com `--repeat-each` e 2 workers (feito, sem reprodução).
- [x] Conserto por sincronização de estado, sem retry/`toPass`/timeout maior.
- [ ] Fechar depois de 3 CIs seguidos da main sem falha nesse teste; se falhar de novo, ler o trace e ver se o `expect` novo (seleção ainda "alvo") dispara: indica app (foco/seleção), não teste.

# T-128: Conferir na tela o que o lote 6 não viu

- Prioridade: P3
- Tamanho: P
- Status: concluído
- Agente: design
- Origem: lote 6 (2026-11-03)

## Problema
A dica da página vazia (T-018) só foi vista a 1280 no tema claro, sem audit. O corretor (T-036) só foi conferido pelo atributo no Chrome headless.

## Critérios de aceite
- [x] Dica da página vazia em 375 e 1280, claro e escuro, pt e en, com axe e medidas (no lugar do `/impeccable audit`).
- [x] Corretor no Edge: sublinhado aparece (visível). "Adicionar ao dicionário" é menu nativo e não aparece em captura: lacuna. Se o headless não mostrar, testar com navegador visível.

## Como verificar
Script Playwright com prints só das telas em questão.

## Registro
Commit: o que fecha este ticket (`docs(T-128)`).

Dica da página vazia, 8 combinações (375 e 1280 px x claro e escuro x pt-BR e en-US), Chrome headless, axe completo: 0 violações em todas (inclui contraste). Medidas: sem rolagem lateral (scrollWidth = largura da janela), região com 702 px a 1280 e 325 px a 375 (cabe, 345 de borda direita), texto sem corte (`scrollWidth <= clientWidth`), cor do texto muda com o tema (rgb(21,26,51) claro, rgb(236,238,247) escuro). `spellcheck="true"` no editor nas 8. Prints: scratchpad `verif-dica-1280-light.png` e `verif-dica-375-dark.png`.

Corretor: Edge instalado (`channel: msedge`, visível, 900 px): palavras erradas ("errda", "xpto") sublinhadas em vermelho. Print: `verif-corretor-edge.png`.

Lacuna: o item "Adicionar ao dicionário" fica no menu de contexto nativo, que o Playwright não captura nem controla; não verificado. Sem defeito.

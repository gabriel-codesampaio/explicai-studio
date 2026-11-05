# T-580: HTML exportado sem ícone e com navs de mesmo nome

- Prioridade: P3
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: demo exportado

## Problema
- O HTML exportado não tem `<link rel="icon">`: o navegador pede `/favicon.ico` e a demo mostra 404.
- O axe acusa `landmark-unique`: cada página tem um `<nav class="page-nav">` com o mesmo `aria-label`.

## Critérios de aceite
- [x] O export gera um ícone inline (data URI SVG) na cor de destaque do manual, sem arquivo extra.
- [x] Cada `<nav>` do export tem `aria-label` único (o da página leva o título dela).

## Onde
`src/core/export/html.ts`; teste em `test/export.test.ts`.

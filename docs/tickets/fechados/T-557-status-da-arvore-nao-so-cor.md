# T-557: Status da árvore não depende só de cor

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [critique 2026-11-05 (27/40)](../../.impeccable/critique/2026-11-05T12-50-20Z__web-src-app-tsx.md)

## Problema
O status das páginas na árvore é só cor; "Publicado" (cobalto) se confunde com número/link.

## Critérios de aceite
- [x] Legenda de uma linha no cabeçalho PÁGINAS e `title` no hover.
- [x] "Publicado" com forma diferente (bolinha cheia x anel), além da cor.
- [x] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Como verificar
Teste de unidade do que for lógica; conferir a tela com script Playwright (uma largura, um tema) e medir com `evaluate_script`/script.

## Registro
- Fechado na branch feat/ui-lote2-a. Legenda de uma linha (Em revisão, Aprovado, Publicado) abaixo do cabeçalho PÁGINAS, com `title`; Publicado virou alvo (anel com miolo), distinto da bolinha cheia e do anel vazio do rascunho. Teste web/test/statusLegend.test.tsx; i18n em pt e en. Design confere a marca.
- 2026-11-05: Legenda visível removida por decisão da pessoa (branch chore/remove-conferida). O status segue sem depender só de cor: forma por etapa, `title` e texto para leitor de tela em cada item da árvore (`StatusMark`); teste `web/test/statusMark.test.tsx` no lugar de `statusLegend.test.tsx`.

# T-545: Data de conferência por página e filtro de páginas sem conferência

- Prioridade: P1
- Tamanho: G
- Status: removido por decisão da pessoa
- Agente: core (+ frontend)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 6 (esforço P, risco B)

## Problema
Não dá para saber quais páginas ninguém olha há meses. `status` diz o estado do texto, não quando alguém confirmou que ainda vale. Princípio 1 do produto (o manual acompanha o código). É o substituto honesto de "detectar guia desatualizado", que fica fora da v1.

## Escopo
- Campo opcional `reviewed: AAAA-MM-DD` no frontmatter da página (aditivo; campos desconhecidos já são preservados, T-200 e T-264).
- Botão "Marcar como conferida" no menu da página; rótulo "Conferida em …".
- Filtro na árvore: "não conferida há mais de 90 dias" (N fixo; outro valor só se alguém pedir).
- Achado "página sem conferência" entra no checar manual (T-540), quando existir.

## Critérios de aceite
- [x] `reviewed` é opcional: manual sem o campo abre e exporta igual.
- [x] "Marcar como conferida" grava a data de hoje e aparece na página, em pt e en.
- [x] O filtro mostra páginas sem data ou com data mais de 90 dias atrás.
- [x] O MCP e o editor preservam o campo (T-200, T-264); `manual-format.md` documenta o campo.
- [x] Nada bloqueia: só marca e filtra.
- [x] Teste de frontmatter com campo presente, ausente e com data inválida (não quebra o manual).

## Onde
Frontmatter (`src/core/`, formato em `docs/manual-format.md`), menu da página e filtro da árvore (`web/src/features/`).

## Como verificar
Teste de unidade do frontmatter; e2e: marcar, ver a data, filtrar a árvore.

## Riscos
Vira burocracia: por isso sem bloqueio. Formato aditivo dentro da política de compatibilidade da 1.x (T-198).

## Decisão
Decidido em 2026-11-05: sim, campo `reviewed` no frontmatter (em inglês, como `status` e `audience`), rótulo "Conferida em" na interface.

## Registro
- 2026-11-05: Decidido em 2026-11-05: sim, campo `reviewed` no frontmatter (em inglês, como `status` e `audience`), rótulo "Conferida em" na interface.
Feito em `feat/pagina-conferida`. Núcleo: `src/core/reviewed.ts` (`isReviewedDate`, `isStale`, 90 dias), `Page.reviewed`/`PageTreeNode.reviewed`, `updatePage({ reviewed })` valida AAAA-MM-DD, data inválida no arquivo vale como sem data e volta intacta (fica em `extra`). Achado `not-reviewed` no `checkManual`. UI: `ReviewedControl` ao lado do status (rótulo "Conferida em …" e botão), botão "Só não conferidas" na árvore (`staleOnly`, mantém a mãe de página pendente). Doc em `docs/manual-format.md`. Testes: `test/reviewed.test.ts`, `web/test/reviewed.test.ts`, `e2e/studio.conferida.e2e.ts`; e2e do checar e testes de check ajustados (página nova agora tem o achado). Fora: marcar conferida em lote, N configurável, ferramenta MCP própria (o MCP preserva o campo pelo núcleo).
- 2026-11-05: Removido por decisão da pessoa em 2026-11-05: a feature "conferida" (botão, "Conferida em", filtro "Só não conferidas", campo `reviewed`, achado `not-reviewed`) saiu na branch chore/remove-conferida. Manual antigo com `reviewed:` no frontmatter abre e o campo volta ao arquivo como campo desconhecido.

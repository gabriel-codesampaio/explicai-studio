# T-545: Data de conferência por página e filtro de páginas sem conferência

- Prioridade: P1
- Tamanho: G
- Status: aberto
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
- [ ] `reviewed` é opcional: manual sem o campo abre e exporta igual.
- [ ] "Marcar como conferida" grava a data de hoje e aparece na página, em pt e en.
- [ ] O filtro mostra páginas sem data ou com data mais de 90 dias atrás.
- [ ] O MCP e o editor preservam o campo (T-200, T-264); `manual-format.md` documenta o campo.
- [ ] Nada bloqueia: só marca e filtra.
- [ ] Teste de frontmatter com campo presente, ausente e com data inválida (não quebra o manual).

## Onde
Frontmatter (`src/core/`, formato em `docs/manual-format.md`), menu da página e filtro da árvore (`web/src/features/`).

## Como verificar
Teste de unidade do frontmatter; e2e: marcar, ver a data, filtrar a árvore.

## Riscos
Vira burocracia: por isso sem bloqueio. Formato aditivo dentro da política de compatibilidade da 1.x (T-198).

## Decisões pendentes
3. **Nome do campo `reviewed`?** Recomendação do relatório: manter em inglês no frontmatter, como `status` e `audience`, e rótulo em pt/en na interface ("Conferida em").

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

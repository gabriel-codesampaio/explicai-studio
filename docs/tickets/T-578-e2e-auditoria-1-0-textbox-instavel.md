# T-578: e2e auditoria 1.0 (dark) falha 1 vez em 194 no textbox do editor

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: qa
- Origem: rodada 2026-11-05 (`studio.menus-axe.e2e.ts`, auditoria 1.0 dark)

## Problema
`expect(page.getByRole("textbox", { name: "Conteúdo da página" })).toBeVisible()` (logo após `page.goto` no teste "auditoria 1.0") falhou 1 vez em 194 rodadas; passa 8/8 com `--repeat-each`.

## Hipótese
Sem causa medida. O `toBeVisible` já espera 5 s; o provável é montagem lenta do editor (TipTap) sob carga com o teste criando manual, páginas e asset antes. Não é uma linha óbvia: consertar com timeout maior seria mascarar.

## Critérios de aceite
- [ ] Reproduzir (`--repeat-each` com 2 workers, sob carga) e medir o que atrasa a montagem (rede, hash route, editor).
- [ ] Conserto na causa, sem retry nem `toPass`.

## Onde
`e2e/studio.menus-axe.e2e.ts` (~linha 164).

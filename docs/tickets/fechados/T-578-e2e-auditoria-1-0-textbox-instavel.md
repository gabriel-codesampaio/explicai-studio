# T-578: e2e auditoria 1.0 (dark) falha 1 vez em 194 no textbox do editor

- Prioridade: P3
- Tamanho: P
- Status: bloqueado (sem repro)
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

## Medição 2026-11-05 (sem reprodução)
- 5 rodadas do teste dark com 2 núcleos ocupados por laço: todas passaram.
- 25 rodadas do mesmo preparo (manual, páginas, asset, delete) com 3 núcleos ocupados, medindo `goto` até o textbox visível: `goto` 144 a 395 ms, textbox 194 a 610 ms. Margem de uns 8x sobre os 5 s do `toBeVisible`.
- A falha de 1 em 194 não vem da montagem do editor em carga comum: é uma parada rara de fora (CPU/Chrome). Aumentar timeout mascararia; retry/`toPass` proibidos. Não mexi no teste.
- Próximo passo: na próxima falha no CI, ler o trace (`retain-on-failure`) para ver se o editor montou e ficou oculto ou se a página nem carregou. Sem trace, fechar como não reproduzível depois de 2 rodadas limpas do CI.

# T-019: Tirar as cores extras do Studio e manter só no manual exportado

- Prioridade: P1
- Status: aberto
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Esmeralda, ameixa e grafite não estão no brand book e diluem o cobalto. Decisão da pessoa (2026-10-29): o Studio fica sempre no cobalto; a cor continua escolhível só para o manual exportado.

## Critérios de aceite
- [ ] Aparência mostra só tema e idioma; o Studio usa sempre o cobalto.
- [ ] Quem já tinha escolhido outra cor volta ao cobalto sem erro.
- [ ] A cor do manual exportado continua na exportação, com o nome de cada cor visível.

## Onde
`features/settings/AppearancePanel.tsx`, `lib/theme.ts`, `styles/tokens.css`, `web/index.html`, `features/export/ExportDialog.tsx`.

## Como verificar
Teste de ponta a ponta da Aparência; prints; teste de exportação com cor.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

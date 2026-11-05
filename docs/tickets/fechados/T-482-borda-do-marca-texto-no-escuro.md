# T-482: Borda do marca-texto com contraste baixo no tema escuro

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: relatório da rodada final, 2026-11-04 (medido no T-321)

## Problema
No tema escuro, a borda do destaque em rosa (2,67:1), azul (2,66:1) e laranja (2,86:1) fica abaixo de 3:1 contra o fundo. Elemento gráfico precisa de 3:1 (WCAG 1.4.11).

## Critérios de aceite
- [x] As 5 cores de marca-texto com borda >= 3:1 no claro e no escuro, medido por script, no editor e no export.
- [x] Brand book e `docs/marca-resumo.md` com os valores novos.

## Registro
- Commit: (sem hash; fechado no lote regr)
- Feito: a borda do destaque era a mesma nos dois temas. Paleta ganhou `borderDark` (a cor do preenchimento) em `src/core/annotationStyle.ts` e na cópia `web/src/lib/annotationStyle.ts`; no Studio `--hl-borda` vira `light-dark(claro, escuro)`, o export (sempre claro) fica como era. Contraste da borda escura contra a superfície `#161a2e` (antes -> depois): amarelo 3,49 -> 12,06; verde 3,19 -> 9,14; rosa 2,67 -> 7,30; azul 2,66 -> 8,14; laranja 2,86 -> 9,20 (contra `#0e1120` o menor é 7,96). Claro: 4,92 a 6,45 contra branco, sem mudança. Testes em `test/highlight-palette.test.ts`. Valores em `docs/marca-resumo.md`.
- Fora: o brand book (repo explicai-brandbook) não tem a paleta de destaque nem as cores do T-321; acrescentar lá é outro repo. Contorno sem cor escolhida (`--borda-destaque`) não foi medido. Sem conferência no navegador do export.

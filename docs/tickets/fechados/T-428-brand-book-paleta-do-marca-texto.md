# T-428: Pôr a paleta do marca-texto no brand book

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: design
- Origem: sobras do T-129 e do lote de regressões, 2026-11-05 (T-482 mudou as bordas no escuro)

## Critérios de aceite
- [x] `explicai-brandbook/index.html`, seção Studio: as 5 cores de marca-texto com borda no claro e no escuro, valores de `web/src/styles/tokens.css` e contraste medido.

## Registro
- Commit: `docs(studio): põe a paleta do marca-texto...` em `explicai-brandbook`, PR #3 (`docs/paleta-marca-texto`); publica ao mesclar.
- Feito: tabela da seção Studio com preenchimento, borda e razões do texto (cheio e suave), borda no claro (hex e razão contra branco) e no escuro (hex e razão contra #161A2E); linha de amostras sobre fundo escuro; texto antigo ("abaixo de 3:1, vira ticket") trocado. Valores de `HIGHLIGHT_PALETTE`; razões escuras re-medidas por script (12,06 / 9,14 / 7,30 / 8,14 / 9,20; contra #0E1120 o menor é 7,96).
- Fora: sem conferência visual no navegador; os 5 valores de `--hl-fundo`/`--hl-borda` vêm do código (TS), não de `tokens.css`, que só tem `--marca`.

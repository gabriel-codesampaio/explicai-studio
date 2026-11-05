# T-531: Trocar cores soltas nos componentes por tokens

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B1 (Baixo)

## Problema
O DESIGN.md manda token, mas alguns componentes usam cor solta: `web/src/features/versions/VersionsPanel.tsx:99,151` e `ItemStylePanel.tsx:47` (`#151a33`, em `web/src/features/annotations/`); `web/src/features/settings/CoverFooterFields.tsx:83,87,92` (`#151a33`, `#575e78`, `bg-white`). Relacionado: T-019 e T-027, fechados.

## Critérios de aceite
- [x] Nos arquivos citados, nenhum `#151a33`, `#575e78` ou `bg-white` solto: usar `text-nanquim` / `text-grafite` via `tokens.css` (ou o token que existir).
- [x] Visual igual no claro; no escuro, sem fundo branco fixo.
- [x] O texto sobre o destaque continua nanquim e legível (contraste mantido).

## Onde
Arquivos acima. Esforço do relatório: P.

## Como verificar
`grep` dos hex nesses componentes dá vazio; um print antes e depois da Aparência e das Versões, em claro e escuro.

## Registro
- Fechado em feat/ui-lote3. Tokens novos --nanquim (fixo, texto sobre marca-texto), text-tinta, text-grafite em tokens.css; trocados em VersionsPanel, PinnedNotice, ItemStylePanel e CoverFooterFields (prévia agora bg-superficie, sem branco fixo no escuro). Sem print antes/depois (visual igual no claro).

# T-066: Revisão de design das páginas de erro (T-051) e do feedback do export (T-052)

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: pedido da pessoa em 2026-10-30

## Problema
T-051 e T-052 passaram só por impeccable audit e conferência própria; faltou revisar-design.

## Critérios de aceite
- [ ] revisar-design nas telas de T-051 e T-052, claro e escuro, 1280 e 375 px; corrigir o que acusar.
- [ ] `ConnectionBanner` usa `border-l-4` (side-tab marcado pelo detector): trocar por outro tratamento.

## Onde
`web/src/components/ErrorPage.tsx`, `web/src/features/export/ExportStatus.tsx`, `ConnectionBanner`.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

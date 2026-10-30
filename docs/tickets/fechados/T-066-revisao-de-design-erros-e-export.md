# T-066: Revisão de design das páginas de erro (T-051) e do feedback do export (T-052)

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: design
- Origem: pedido da pessoa em 2026-10-30

## Problema
T-051 e T-052 passaram só por impeccable audit e conferência própria; faltou revisar-design.

## Critérios de aceite
- [x] revisar-design nas telas de T-051 e T-052, claro e escuro, 1280 e 375 px; corrigir o que acusar.
- [x] `ConnectionBanner` usa `border-l-4` (side-tab marcado pelo detector): trocar por outro tratamento.

## Onde
`web/src/components/ErrorPage.tsx`, `web/src/features/export/ExportStatus.tsx`, `ConnectionBanner`.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
Commits 3de9b19 e 708e54c.

Revisão no Chrome em claro e escuro, 1280 e 375 px. ErrorPage: sem achados (contraste do texto 5,9:1 a 8,1:1, título 15:1, sem rolagem lateral). `ConnectionBanner` perdeu o `border-l-4` (fundo e borda inferior em tom de erro; e2e confere borda esquerda 0). Achado extra: os avisos do `ExportStatus` tinham faixa `border-l-2` e título em coral com 3,56:1 no claro; viraram caixa com borda inteira e título na cor do texto.

Ficou de fora: a tela de avisos do export não foi vista renderizada (precisa de export com aviso real); conferi só por contraste medido. A `impeccable` foi aplicada como checagem manual (detector de faixa lateral e contraste), sem rodar a CLI.

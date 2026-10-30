# T-051: Páginas de erro em tela cheia

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: Pedido da pessoa (2026-10-30), continuação do T-047

## Problema
O T-047 tratou os erros, mas as telas eram genéricas. Faltavam páginas de erro de verdade, no padrão de produtos maduros.

## Feito
- `ErrorPage` (web/src/components/ErrorPage.tsx): marca, título curto com marca-texto no trecho central (`*...*`), uma frase, ação principal, ação secundária, código técnico tracejado e copiável. Foco no título, `role="alert"`/`status`, 44 px em toque, claro/escuro, 375 px.
- Variantes: 404 (manual ou página), servidor fora com reconexão, erro inesperado (ErrorBoundary), 403 e 500 (`RequestErrorScreen`). 404 e falha ao abrir o manual saem do layout com barra lateral e ocupam a tela. Erro de render na página mantém a árvore de pé.
- Lógica em `web/src/lib/errorPages.ts` (destaque, tipo do erro, código técnico).
- Página HTML do servidor de produção (`src/server/errorPage.ts`) com a mesma composição e `prefers-color-scheme`. Sem a fonte Archivo (cai em Arial Narrow/sistema), porque a página existe justamente quando o editor não carrega.
- Audit do impeccable: o detector acusou rótulo em caixa alta sobre o título; o rótulo saiu (o código já está na caixa técnica). Sem achados depois.

## Critérios de aceite
- [x] 404, servidor fora com reconexão, erro de renderização, 403 e 500 em tela cheia
- [x] pt/en, claro/escuro, 375 px sem rolagem lateral, alvos de 44 px
- [x] HTML estático alinhado
- [x] e2e: 404, servidor fora, render, 403, 500, 375 px

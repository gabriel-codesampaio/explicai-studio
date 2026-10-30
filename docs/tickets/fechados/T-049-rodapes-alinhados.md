# T-049: Rodapés da barra lateral e da página na mesma linha

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: Pedido da pessoa (2026-10-30)

## Problema
O rodapé da barra lateral ("Ajustes", `pt-3` mais o `py-4` da barra) e a barra de status da página (`py-2`) tinham alturas diferentes e as bordas de cima ficavam em linhas diferentes. Na barra recolhida não havia rodapé. O botão "Tentar de novo" da barra de status não tinha 44 px em toque.

## Critérios de aceite
- [x] Mesma altura nos dois rodapés, via token `--rodape-h` (3rem) em `tokens.css`; conteúdo centralizado na vertical.
- [x] Borda de cima na mesma linha, de ponta a ponta, com a barra aberta, recolhida (faixa vazia com a mesma borda) e na gaveta em 375 px.
- [x] "Tentar de novo" com 44 px em toque.
- [x] e2e de medida: diferença do topo das bordas ≤ 1 px, em 1280 px claro e escuro (aberta e recolhida) e em 375 px.

## Onde
`web/src/styles/tokens.css`, `layout/MoreMenu.tsx`, `layout/Sidebar.tsx`, `layout/Navigation.tsx`, `layout/StatusBar.tsx`, `e2e/studio.e2e.ts`.

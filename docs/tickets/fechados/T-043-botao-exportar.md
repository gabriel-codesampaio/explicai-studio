# T-043: Exportar manual como último item do topo, à direita

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [Discovery do botão Exportar](../../discovery/archives/2026-10-30-botao-exportar.md) (2026-10-30), opção 1

## Problema
"Exportar manual" era o primeiro de quatro itens do topo da página, no meio do grupo, e abaixo de `sm` ficava à esquerda.

## Critérios de aceite
- [x] Ordem Versões, Status, Índice, Exportar (DOM e tela iguais; Tab segue a ordem).
- [x] Exportar é o último item e encosta na direita em 1280 e em 375 px; em 375 px desce para a própria linha, à direita (os quatro não cabem em 335 px), sem rolagem lateral.
- [x] Continua cobalto, botão primário (`variant` default): 600 de peso, 36 px, 44 px em toque. Único botão sólido da linha.
- [x] Auditoria de acessibilidade (Lighthouse do chrome-devtools-mcp), claro e escuro, 1280 e 375 px; contraste do botão 7,0:1 nos dois temas.
- [x] Teste e2e: ordem, posição, altura e Tab em 375 px (toque) e em 1280 px.

## Onde
`web/src/layout/PageView.tsx`, `web/src/features/export/ExportDialog.tsx`, `StatusMenu.tsx`, `VersionsPanel.tsx`, `PageOutline.tsx`, `e2e/studio.e2e.ts`.

## Registro
Achado da auditoria corrigido: Versões, Status e Índice tinham 29 px em toque; agora 44 px. Fora: Lighthouse ainda acusa `label-content-name-mismatch` em "Colar print Ctrl+V" (Toolbar, nome acessível sem o atalho visível), não relacionado a este ticket.

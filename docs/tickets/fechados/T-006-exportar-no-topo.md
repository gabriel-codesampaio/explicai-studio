# T-006: Levar "Exportar manual" para o topo da página como botão principal

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Exportar é a entrega do produto, mas é um botão com contorno perdido na barra lateral. A barra lateral também tem sete pontos de decisão antes da árvore.

## Critérios de aceite
- [x] "Exportar manual" é o único botão sólido na cor de destaque, no topo da área da página.
- [x] A barra lateral fica com: manual, busca, árvore e um menu "⋯" no rodapé com Lixeira, Aparência e Atalhos.
- [x] Funciona em 960 px e no celular.

## Onde
`web/src/layout/PageView.tsx`, `web/src/layout/Sidebar.tsx`, `features/export/ExportDialog.tsx`.

## Como verificar
Teste de ponta a ponta de exportação a partir do topo; prints em 375, 960 e 1440 px.

## Registro
Commits: 759610c (menu ⋯ com Lixeira, Aparência e Atalhos), 060a936 (Exportar manual no topo da página), 9e78b09 e 25453de (design: coluna dos atalhos alinhada, ícones decorativos fora do botão Exportar, de Versões e do ⋯), 05e33c5 (e2e do ⋯ dentro da gaveta), a850d75 (lixeira fecha ao restaurar), 20a0872 (⋯ com 44 px em tela de toque).

O que foi feito: `ExportDialog` com botão sólido na linha do topo da `PageView`, único botão de destaque da tela. `layout/MoreMenu.tsx` novo; Lixeira e Aparência viraram Dialog controlado (antes popover ancorado no gatilho que saiu); ShortcutsDialog controlado.

Verificação: `npm run check` 96 testes, `npm run test:e2e` 17 verdes (exportar pelo topo, painéis pelo ⋯ com foco voltando, os mesmos painéis dentro da gaveta em 375×800, restaurar fecha a lixeira). Medidas em 375, 960 e 1440: botão dentro da janela, acima do título, sem rolagem lateral. Design aprovou 1440 claro e a gaveta em 375 (prints em `C:/Users/PC/explicai-prints/p1/T-006/`). Revisão sem achados que bloqueiem.

Ficou de fora: o escuro não foi visto. Se a restauração falhar, a lixeira fecha e o erro aparece em toast.

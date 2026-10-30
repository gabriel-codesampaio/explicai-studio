# T-050: "Cor do texto" com 44 px em toque e barra da seleção sem cobrir a barra fixa

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: Pedido da pessoa (2026-10-30); registro de T-044

## Problema
1. O botão "Cor do texto" (`TextColorMenu`) media 32 px em tela de toque; os outros botões da barra têm 44 px.
2. A barra flutuante da seleção (`top-start`) caía sobre a barra fixa quando o texto selecionado estava na primeira linha. Medido: barra fixa em y 206-255, flutuante em y 225-267. Ela escondia os botões da barra fixa e, com eles, as dicas.

O segundo item era problema real: a dica da barra fixa tem z 50, acima da flutuante (z 20), mas o botão que a abre ficava coberto.

## Correção
- `TextColorMenu`: `h-11 min-w-11` em `pointer:coarse`.
- `SelectionMenu`: `flip` do Floating UI com o topo útil começando onde a barra fixa termina (`[data-editor-toolbar]`), então a flutuante vai para baixo da seleção. Medido depois: flutuante em y 304-346.

## Critérios de aceite
- [x] "Cor do texto" com 44 px em toque (e2e "alvos de toque").
- [x] Flutuante não cruza a barra fixa nem a dica dela (e2e "não cobre a barra fixa").

## Onde
`web/src/features/editor/TextColorMenu.tsx`, `SelectionMenu.tsx`, `Toolbar.tsx`, `e2e/studio.e2e.ts`.

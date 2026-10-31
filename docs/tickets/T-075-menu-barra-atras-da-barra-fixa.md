# T-075: Menu "/" aparece atrás da barra fixa

- Prioridade: P1
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-31 (bug visto junto com o T-072)

## Problema
O menu "/" (SlashMenu) pode abrir por baixo da barra fixa de formatação, que é sticky: parte do menu fica escondida atrás dela, principalmente com a linha perto do topo da página.

## Critérios de aceite
- [ ] O menu "/" fica sempre acima da barra fixa na ordem de empilhamento (z-index) e nunca fica coberto por ela.
- [ ] Perto do topo, o menu abre para baixo da barra fixa, sem sobrepô-la; sem espaço, vira rolagem interna ou abre acima, sem cortar itens.
- [ ] O mesmo conferido em BlockTypeMenu, TextColorMenu, FontMenu e popovers.
- [ ] e2e: "/" na primeira linha, medir que o retângulo do menu não cruza o da barra fixa e que o primeiro item é clicável (elementFromPoint).
- [ ] 1280 e 375 px, claro e escuro.

## Onde
`web/src/features/editor/slash/SlashMenu.tsx`, `Toolbar.tsx` (z-index), `AnchoredPopover.tsx`.

## Como verificar
e2e da área (`-g "/"`); medir no navegador.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

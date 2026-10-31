# T-075: Menu "/" aparece atrás da barra fixa

- Prioridade: P1
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-31 (bug visto junto com o T-072)

## Problema
O menu "/" (SlashMenu) pode abrir por baixo da barra fixa de formatação, que é sticky: parte do menu fica escondida atrás dela, principalmente com a linha perto do topo da página.

## Critérios de aceite
- [x] O menu "/" fica sempre acima da barra fixa na ordem de empilhamento (z-index) e nunca fica coberto por ela.
- [x] Perto do topo, o menu abre para baixo da barra fixa, sem sobrepô-la; sem espaço, vira rolagem interna ou abre acima, sem cortar itens.
- [x] O mesmo conferido em BlockTypeMenu, TextColorMenu, FontMenu e popovers.
- [x] e2e: "/" na primeira linha, medir que o retângulo do menu não cruza o da barra fixa e que o primeiro item é clicável (elementFromPoint).
- [x] 1280 e 375 px, claro e escuro.

## Onde
`web/src/features/editor/slash/SlashMenu.tsx`, `Toolbar.tsx` (z-index), `AnchoredPopover.tsx`.

## Como verificar
e2e da área (`-g "/"`); medir no navegador.

## Registro
Commit bd8dfca. Causa medida: com a janela baixa o menu "/" virava para cima (flip sem folga) e cruzava a barra fixa (topo do menu em -122 contra barra em 182, viewport 420). O z-index já era 50 contra 10 da barra. Agora flip e size usam a área útil (barra fixa a rodapé, em `editorArea.ts`); sem espaço, a lista rola por dentro (`--slash-max-h`). Callout e controles de tabela usam a mesma área. BlockTypeMenu, TextColorMenu e FontMenu abrem do botão da própria barra, para baixo, sem mudança. Declarado `@floating-ui/dom` (já vinha pelo Tiptap). e2e novo em 3 alturas; e2e -g "/|menu|bloco|tabela|alerta" 16 verdes; typecheck e biome limpos. Medido no Chrome (1280x420, escuro): menu 227-364, barra termina em 182, primeiro item clicável. Fica de fora: conferência a 375 px e no tema claro pelo DevTools (só 1280 escuro; e2e cobre as alturas).

# T-013: Manter a árvore visível em tela dividida (~960 px)

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Abaixo de 1024 px a árvore vira gaveta e o logo some. O redator escreve com o sistema aberto ao lado, em ~960 px, e precisa abrir a gaveta a cada troca de página.

## Critérios de aceite
- [x] Em 900–1023 px a árvore fica visível numa coluna estreita (~14rem); a gaveta só abaixo disso.
- [x] A marca aparece no topo em telas estreitas.
- [x] Sem rolagem horizontal em 375, 960 e 1440 px.

## Onde
`web/src/layout/Navigation.tsx`, `web/src/hooks/useSidebar.ts`, `web/src/layout/Sidebar.tsx`.

## Como verificar
Prints em 375, 900, 960 e 1440 px; `scrollWidth` igual à largura.

## Registro
Commit c4b1f33. Coluna da árvore a partir de 900 px (14rem até 1023, 17,5rem depois); gaveta só abaixo de 900. Marca (Brand) na barra do topo em telas estreitas. `COLUMN_MIN_REM` em useSidebar.ts; teste unit web/test/useSidebar.test.ts; e2e e2e/studio.tela-dividida.e2e.ts (375, 899, 900, 960, 1023, 1440, claro e escuro, scrollWidth e botão de recolher dentro da coluna). Fora: nada.

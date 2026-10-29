# T-013: Manter a árvore visível em tela dividida (~960 px)

- Prioridade: P2
- Status: aberto
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Abaixo de 1024 px a árvore vira gaveta e o logo some. O redator escreve com o sistema aberto ao lado, em ~960 px, e precisa abrir a gaveta a cada troca de página.

## Critérios de aceite
- [ ] Em 900–1023 px a árvore fica visível numa coluna estreita (~14rem); a gaveta só abaixo disso.
- [ ] A marca aparece no topo em telas estreitas.
- [ ] Sem rolagem horizontal em 375, 960 e 1440 px.

## Onde
`web/src/layout/Navigation.tsx`, `web/src/hooks/useSidebar.ts`, `web/src/layout/Sidebar.tsx`.

## Como verificar
Prints em 375, 900, 960 e 1440 px; `scrollWidth` igual à largura.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

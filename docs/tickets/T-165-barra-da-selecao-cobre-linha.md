# T-165: Barra da seleção não cobrir a linha seguinte

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: relatório UX 2026-11-04, achado A16 (avaliado no commit 60a0e3d)

## Problema
Achado A16. A barra flutuante da seleção cobre a linha seguinte do texto. Relacionado ao T-039 e ao T-050 (fechados: barra na seleção, sem cobrir a fixa).

Decidido (pessoa, 2026-11-04): perto do topo, a barra da seleção abre para cima e **sobrepõe a barra fixa**, em vez de abrir para baixo e cobrir a linha seguinte. Revoga, só nesse caso, a regra do T-050 de não cobrir a barra fixa.

## Critérios de aceite
- [ ] Com seleção de várias linhas, a barra não cobre a linha seguinte à seleção em 1280 e 375 px.
- [ ] A barra continua visível e clicável.

## Onde
- web/src/features/editor/SelectionMenu.tsx

## Como verificar
Selecionar duas ou três linhas em 1280 e 375 px. Medir com evaluate_script a posição da barra e da última linha selecionada e conferir que não se sobrepõem.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

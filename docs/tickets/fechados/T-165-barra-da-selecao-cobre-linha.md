# T-165: Barra da seleção não cobrir a linha seguinte

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: design
- Origem: relatório UX 2026-11-04, achado A16 (avaliado no commit 60a0e3d)

## Problema
Achado A16. A barra flutuante da seleção cobre a linha seguinte do texto. Relacionado ao T-039 e ao T-050 (fechados: barra na seleção, sem cobrir a fixa).

Decidido (pessoa, 2026-11-04): perto do topo, a barra da seleção abre para cima e **sobrepõe a barra fixa**, em vez de abrir para baixo e cobrir a linha seguinte. Revoga, só nesse caso, a regra do T-050 de não cobrir a barra fixa.

## Critérios de aceite
- [x] Com seleção de várias linhas, a barra não cobre a linha seguinte à seleção em 1280 e 375 px.
- [x] A barra continua visível e clicável.

## Onde
- web/src/features/editor/SelectionMenu.tsx

## Como verificar
Selecionar duas ou três linhas em 1280 e 375 px. Medir com evaluate_script a posição da barra e da última linha selecionada e conferir que não se sobrepõem.

## Registro
Commit: ver git log (fix(editor): barra da seleção abre para cima perto do topo).
Feito: SelectionMenu sem flip (`flip: false`); removido FLIP_BELOW_TOOLBAR. A barra abre sempre para cima (shift mantém no viewport); z-20 fica sobre a barra fixa (z-10).
Medida (Playwright headless, 3 linhas selecionadas, y em px):
- 1280: barra 160-192; 1a linha 200-226; ultima selecionada 251-277; linha seguinte 277-302; barra fixa 133-182. Sem sobreposição com texto; elementFromPoint no centro = barra.
- 375: barra 266-298; 1a linha 306-331; ultima 357-382; seguinte 382-408; barra fixa 239-288. Idem.
Sem teste de unidade: a posição é config do Floating UI, não lógica própria.

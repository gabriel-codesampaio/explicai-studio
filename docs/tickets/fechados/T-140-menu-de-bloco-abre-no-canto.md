# T-140: Menu de tipo de bloco abre no canto da tela

- Prioridade: P1
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
O menu de tipo de bloco (Texto, Título 1, Passos numerados, Alertas...) abre no canto superior esquerdo, sobre a sidebar, longe do botão "Texto" da barra do editor. Havia texto selecionado.

## Critérios de aceite
- [x] Causa achada e registrada antes da correção.
- [x] O menu abre ancorado no botão, na barra fixa e na barra flutuante da seleção, em 375 e 1280.
- [x] Teste (e2e) mede a posição do menu em relação ao botão.

## Onde
`web/src/features/editor/` (barras e menu de blocos).

## Registro
Causa: o menu (Radix, em portal no body) abria fora da barra da seleção; ao receber o foco o editor perdia o foco, o BubbleMenu do Tiptap escondia a barra e o menu, sem âncora, caía em (0,4). Reproduzido por script (menu em x=0, y=4; botão em x=546). A barra fixa já abria certo. Correção: o menu do bloco e o da cor do texto abrem dentro da barra flutuante (`container` do portal), então o foco continua dentro dela. e2e novo em `studio.texto.e2e.ts` (posição junto do botão e troca para Título 1). Fora: Esc deixa a barra visível até o próximo clique (não medido).

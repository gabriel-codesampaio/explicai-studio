# T-140: Menu de tipo de bloco abre no canto da tela

- Prioridade: P1
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
O menu de tipo de bloco (Texto, Título 1, Passos numerados, Alertas...) abre no canto superior esquerdo, sobre a sidebar, longe do botão "Texto" da barra do editor. Havia texto selecionado.

## Critérios de aceite
- [ ] Causa achada e registrada antes da correção.
- [ ] O menu abre ancorado no botão, na barra fixa e na barra flutuante da seleção, em 375 e 1280.
- [ ] Teste (e2e) mede a posição do menu em relação ao botão.

## Onde
`web/src/features/editor/` (barras e menu de blocos).

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

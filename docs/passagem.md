# Passagem: fila P1, lote 1 (2026-10-30)

Branch `feat/p1-cara-de-ia`, sem push. `npm run check` verde (96 testes), `npm run test:e2e` 13 verdes em 3c3d2b3.

## Feito
- T-022 fechado (3c3d2b3): imagem solta volta para dentro de parágrafo ao abrir o Markdown, e o Enter funciona.
- T-003 (77a41f9) e T-007 (205d9c4, 9beb364): código pronto e revisado, critérios cumpridos. Ficam `em andamento` só pela conferência visual.

## Falta para fechar T-003 e T-007
- Design no claro a 1440 px: rótulos, ShortcutsDialog, exportação depois do `w-14`, PinnedNotice sem ícone.
- Copiar os prints de `test-results/dp-1440-escuro-*.png` (o `dp-1440-claro-editor.png` está errado, descartar) para `C:/Users/PC/explicai-prints/p1/T-003/` e `T-007/`. O MCP do Chrome não grava fora do workspace: salve no repo e copie com o shell.
- Depois: Registro final, `git mv` para `fechados/` e linha no índice.

## Próximo lote
T-004 (numeração na árvore, M), T-005 (manual como cabeçalho, M) e T-006 (exportar no topo, M). T-005 e T-006 mexem na barra lateral: fazer em sequência, não em paralelo.

## Achados
- Ida e volta de imagem solta dentro de item de lista e de citação sem teste próprio (sugestão da revisão do T-022).
- `exemplos/` tem o manual `manual-do-financeiro` (en-US); para testar é preciso criar dados pela API.
- O botão "Marcar imagem" só aparece com a imagem selecionada, o que atrapalha os testes de tela.

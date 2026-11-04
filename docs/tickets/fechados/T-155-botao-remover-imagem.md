# T-155: Adicionar botão Remover imagem no painel da imagem

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A5 (avaliado no commit 60a0e3d)

## Problema
Achado A5. O painel da imagem só tem tamanho e Editar imagem. Remover funciona por Esc e Delete, e Ctrl+Z desfaz, mas não há ação visível para remover.

## Critérios de aceite
- [x] O painel da imagem tem o botão Remover imagem.
- [x] O botão faz o mesmo que Delete.
- [x] Ctrl+Z restaura a imagem removida.

## Onde
- web/src/features/editor/ImagePopover.tsx

## Como verificar
Abrir o painel e clicar Remover imagem: a imagem some. Ctrl+Z: volta. Conferir o rótulo no teste de componente e a ação no e2e.

## Registro
Feito em 9d1d8e5: botao Remover imagem no ImagePopover (deleteSelection, igual ao Delete), undo restaura, testado com tiptap real. Fora: e2e.

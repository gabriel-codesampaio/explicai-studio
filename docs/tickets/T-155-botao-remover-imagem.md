# T-155: Adicionar botão Remover imagem no painel da imagem

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A5 (avaliado no commit 60a0e3d)

## Problema
Achado A5. O painel da imagem só tem tamanho e Editar imagem. Remover funciona por Esc e Delete, e Ctrl+Z desfaz, mas não há ação visível para remover.

## Critérios de aceite
- [ ] O painel da imagem tem o botão Remover imagem.
- [ ] O botão faz o mesmo que Delete.
- [ ] Ctrl+Z restaura a imagem removida.

## Onde
- web/src/features/editor/ImagePopover.tsx

## Como verificar
Abrir o painel e clicar Remover imagem: a imagem some. Ctrl+Z: volta. Conferir o rótulo no teste de componente e a ação no e2e.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

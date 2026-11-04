# T-151: Perguntar antes de fechar a marcação com marcadores novos

- Prioridade: P1
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A1 (avaliado no commit 60a0e3d)

## Problema
Achado A1. Fechar a marcação (Esc, Cancelar ou clicar fora) descarta marcadores novos sem perguntar. Medido: o rascunho foi de 1 para 2 marcadores, Esc fechou, e ao reabrir havia 1. Só a área de ocultar pendente avisa (`requestClose`, `AnnotationEditor.tsx:58`).

## Critérios de aceite
- [ ] Esc, Cancelar e clicar fora perguntam sempre que o rascunho mudou (marcador novo, editado ou removido).
- [ ] Cancelar na pergunta mantém o rascunho aberto.
- [ ] Descartar fecha sem gravar; quando nada mudou, fecha sem pergunta.

## Onde
- web/src/features/annotations/AnnotationEditor.tsx:58

## Como verificar
Abrir a marcação, adicionar um marcador e apertar Esc: a pergunta aparece. Cancelar mantém 2 marcadores. Descartar fecha e, ao reabrir, há 1. Repetir com Cancelar e clique fora. Teste unitário do critério "mudou ou não".

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

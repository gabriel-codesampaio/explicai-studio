# T-023: Deixar a legenda editável no diálogo de marcação em 375 px

- Prioridade: P2
- Status: aberto
- Agente: frontend
- Origem: Prints de referência do P1 (design, 2026-10-29)

## Problema
Em 375 px o rodapé do diálogo "Marcar imagem" (Salvar, Cancelar, Desfazer, fundo opaco) cobre os campos da legenda. O diálogo mede 763 px de altura sem rolagem (`overflow: visible`). Print: `explicai-prints/p1/antes/marcacao-375-claro.png`.

## Critérios de aceite
- [ ] Em 375 x 812 px todos os campos da legenda ficam alcançáveis por rolagem e não ficam embaixo do rodapé.

## Onde
`web/src/features/annotations/AnnotationEditor.tsx`, `components/ui/dialog.tsx`.

## Como verificar
Print em 375 px; e2e com viewport de celular editando a legenda.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-023: Deixar a legenda editável no diálogo de marcação em 375 px

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: Prints de referência do P1 (design, 2026-10-29)

## Problema
Em 375 px o rodapé do diálogo "Marcar imagem" (Salvar, Cancelar, Desfazer, fundo opaco) cobre os campos da legenda. O diálogo mede 763 px de altura sem rolagem (`overflow: visible`). Print: `C:/Users/PC/explicai-prints/p1/antes/marcacao-375-claro.png`.

## Critérios de aceite
- [x] Em 375 x 812 px todos os campos da legenda ficam alcançáveis por rolagem e não ficam embaixo do rodapé.

## Onde
`web/src/features/annotations/AnnotationEditor.tsx`, `components/ui/dialog.tsx`.

## Como verificar
Print em 375 px; e2e com viewport de celular editando a legenda.

## Registro
Commits: f8be5dd.

O que foi feito: a área de rolagem já deixava os campos alcançáveis depois do T-014 (barra de ferramentas mais baixa). O que faltava era altura: o rodapé empilhava três botões (130 px). Agora ficam lado a lado, o Desfazer vira só ícone abaixo de sm (o nome acessível continua) e o diálogo usa p-4 no celular. e2e em 375 x 812, claro e escuro: o primeiro campo da legenda cabe na área de rolagem sem rolar, acima do rodapé; o rodapé mede até 48 px; o diálogo cabe nos 812 px. Export e formato de dados não mudaram.

Ficou de fora: imagem muito alta ainda exige rolar dentro do diálogo para chegar à legenda (rolagem funciona, só não é imediata).

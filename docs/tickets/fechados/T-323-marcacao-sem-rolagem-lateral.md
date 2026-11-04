# T-323: Tirar a rolagem lateral do diálogo Editar imagem

- Prioridade: P1
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: pedido da pessoa, 2026-11-04 (print a ~1250 px de largura)

## Problema
O painel Estilo (T-194) não cabe na coluna de 20rem: "Grande", "Normal" e as bordas dos campos saem do diálogo, e aparece rolagem lateral embaixo da imagem.

## Critérios de aceite
- [x] Nenhuma rolagem horizontal no diálogo em 375, 768, 1280 e 1920 px, com scrollWidth <= clientWidth medido por script.
- [x] Controles segmentados de tamanho e borda cabem na coluna, ou quebram linha sem cortar opção.
- [x] Abaixo de `md`, painel embaixo da imagem, com a mesma regra.
- [x] Imagem encolhe para caber; marcações continuam na posição certa.

## Onde
- web/src/features/annotations/AnnotationEditor.tsx:185 (grade da coluna) e o painel Estilo

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
Medida (2026-11-04, Chrome headless, destaque selecionado, painel Estilo aberto; scrollWidth/clientWidth do diálogo): 375 = 358/358, 768 = 735/735, 1280 = 1227/1227, 1920 = 1278/1278. Nenhum controle fora do diálogo, nenhum filho com rolagem interna. O 68b225c já resolveu; sem mudança de código.

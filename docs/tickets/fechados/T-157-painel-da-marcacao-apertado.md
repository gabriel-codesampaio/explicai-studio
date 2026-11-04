# T-157: Dar espaço ao painel lateral da marcação

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: design
- Origem: relatório UX 2026-11-04, achado A7 (avaliado no commit 60a0e3d)

## Problema
Achado A7. O painel lateral da marcação está apertado. Ocultar e Recortar pendentes empurram a Legenda. Áreas clicáveis fica cortada a 800 px. "Sem descrição" se repete em cada marcador vazio.

## Critérios de aceite
- [x] Os painéis Ocultar e Recortar pendentes recolhem e não empurram a Legenda.
- [x] Áreas clicáveis aparece inteira a 1280x800.
- [x] A frase "Sem descrição" aparece uma vez, não em cada marcador vazio.

## Onde
- web/src/features/annotations/AnnotationEditor.tsx
- web/src/features/annotations/AnnotationList.tsx

## Como verificar
Abrir a marcação com 3 marcadores vazios em 1280x800 e medir com evaluate_script a posição da Legenda e da seção Áreas clicáveis. Conferir visualmente um print.

## Registro
Commit a8cbb7a. Ocultar e Recortar pendentes viram uma linha (nome e contagem) quando a ferramenta deles não está ativa; abrem com a ferramenta. "Sem descrição" sai de cada marcador e vira um aviso único sob "Legenda". Medido a 1280x800 com 3 marcadores vazios, 1 área, Ocultar e Recortar pendentes: Legenda em y=277 (antes 484), Áreas clicáveis em y=486 (antes 737, cortada), 1 ocorrência de "Sem descrição" (antes 3). Teste novo: web/test/annotationList.test.tsx. Fora: Aparência continua aberta e rola (Aparência em details é do desenho de personalizar-marcacoes).

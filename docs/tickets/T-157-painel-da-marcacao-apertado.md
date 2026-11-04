# T-157: Dar espaço ao painel lateral da marcação

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: design
- Origem: relatório UX 2026-11-04, achado A7 (avaliado no commit 60a0e3d)

## Problema
Achado A7. O painel lateral da marcação está apertado. Ocultar e Recortar pendentes empurram a Legenda. Áreas clicáveis fica cortada a 800 px. "Sem descrição" se repete em cada marcador vazio.

## Critérios de aceite
- [ ] Os painéis Ocultar e Recortar pendentes recolhem e não empurram a Legenda.
- [ ] Áreas clicáveis aparece inteira a 1280x800.
- [ ] A frase "Sem descrição" aparece uma vez, não em cada marcador vazio.

## Onde
- web/src/features/annotations/AnnotationEditor.tsx
- web/src/features/annotations/AnnotationList.tsx

## Como verificar
Abrir a marcação com 3 marcadores vazios em 1280x800 e medir com evaluate_script a posição da Legenda e da seção Áreas clicáveis. Conferir visualmente um print.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-525: Criar marcações de imagem pelo teclado

- Prioridade: P1
- Tamanho: G
- Status: aberto
- Agente: frontend (+ qa)
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado A1 (Alto)

## Problema
Na edição de imagem, marcador, destaque, seta e área só se criam com ponteiro. `web/src/features/annotations/AnnotationCanvas.tsx:149-171` deixa o canvas com `tabIndex={-1}` e só trata `onPointerDown/Move/Up`; `AnnotationEditor.tsx:142` move por teclado só o item já selecionado. O SVG da imagem tem `role="presentation"`. Quem usa só teclado ou tecnologia assistiva não consegue numerar um print (WCAG 2.1.1). Confirmado pela segunda régua (ui-ux-pro-max).

## Critérios de aceite
- [ ] Só com teclado dá para criar marcador, destaque, seta e área: ferramenta ativa, Enter no canvas focado; o item nasce no centro ou na posição de um cursor movido por setas, e já fica selecionado para mover com setas.
- [ ] A criação é anunciada por `aria-live` (tipo do item e posição).
- [ ] Tab alcança o canvas, e Esc sai sem perder o trabalho.
- [ ] Mouse continua igual (sem regressão nos testes de marcação).

## Onde
`web/src/features/annotations/AnnotationCanvas.tsx`, `AnnotationEditor.tsx`. Esforço do relatório: G.

## Como verificar
Teste de unidade do criador por teclado; e2e só com teclado criando as quatro formas e movendo uma delas; rodar os e2e de imagem existentes; axe no diálogo.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

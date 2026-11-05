# T-525: Criar marcações de imagem pelo teclado

- Prioridade: P1
- Tamanho: G
- Status: em andamento
- Agente: frontend (+ qa)
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado A1 (Alto)

## Problema
Na edição de imagem, marcador, destaque, seta e área só se criam com ponteiro. `web/src/features/annotations/AnnotationCanvas.tsx:149-171` deixa o canvas com `tabIndex={-1}` e só trata `onPointerDown/Move/Up`; `AnnotationEditor.tsx:142` move por teclado só o item já selecionado. O SVG da imagem tem `role="presentation"`. Quem usa só teclado ou tecnologia assistiva não consegue numerar um print (WCAG 2.1.1). Confirmado pela segunda régua (ui-ux-pro-max).

## Critérios de aceite
- [x] Só com teclado (unidade; falta e2e) dá para criar marcador, destaque, seta e área: ferramenta ativa, Enter no canvas focado; o item nasce no centro ou na posição de um cursor movido por setas, e já fica selecionado para mover com setas.
- [x] A criação é anunciada por `aria-live` (tipo do item e posição).
- [x] Tab alcança o canvas, e Esc sai sem perder o trabalho.
- [x] Mouse continua (testes de unidade passam; e2e de imagem não rodados) igual (sem regressão nos testes de marcação).

## Onde
`web/src/features/annotations/AnnotationCanvas.tsx`, `AnnotationEditor.tsx`. Esforço do relatório: G.

## Como verificar
Teste de unidade do criador por teclado; e2e só com teclado criando as quatro formas e movendo uma delas; rodar os e2e de imagem existentes; axe no diálogo.

## Registro
- Núcleo feito na branch feat/ui-imagem-popover: o canvas entra no Tab (`role="application"`, `tabIndex=0`); com a ferramenta ativa, setas movem um cursor (Shift anda mais; ponto visível só com foco por teclado) e Enter cria marcador, destaque, seta, área clicável, ocultar ou recorte no cursor; o item nasce selecionado e as setas passam a movê-lo (`nudge` agora vale para qualquer marcação, não só seta); `role="status"` anuncia tipo e posição; Esc segue a regra da janela (pergunta antes de descartar). Testes: `annotationCanvasKeyboard.test.tsx` e `nudge`.
- Falta (por isso segue aberto): e2e só com teclado criando as quatro formas e movendo uma; axe no diálogo; conferir com leitor de tela real; mover por seta item de ocultar/recortar selecionado (hoje as setas movem o cursor nesses casos).

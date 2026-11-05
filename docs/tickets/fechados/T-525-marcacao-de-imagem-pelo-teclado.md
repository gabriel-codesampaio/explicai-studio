# T-525: Criar marcações de imagem pelo teclado

- Prioridade: P1
- Tamanho: G
- Status: feito
- Agente: frontend (+ qa)
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado A1 (Alto)

## Problema
Na edição de imagem, marcador, destaque, seta e área só se criam com ponteiro. `web/src/features/annotations/AnnotationCanvas.tsx:149-171` deixa o canvas com `tabIndex={-1}` e só trata `onPointerDown/Move/Up`; `AnnotationEditor.tsx:142` move por teclado só o item já selecionado. O SVG da imagem tem `role="presentation"`. Quem usa só teclado ou tecnologia assistiva não consegue numerar um print (WCAG 2.1.1). Confirmado pela segunda régua (ui-ux-pro-max).

## Critérios de aceite
- [x] Só com teclado (unidade e e2e) dá para criar marcador, destaque, seta e área: ferramenta ativa, Enter no canvas focado; o item nasce no centro ou na posição de um cursor movido por setas, e já fica selecionado para mover com setas.
- [x] A criação é anunciada por `aria-live` (tipo do item e posição).
- [x] Tab alcança o canvas, e Esc sai sem perder o trabalho.
- [x] Mouse continua (unidade e os 45 e2e de imagem passam) igual (sem regressão nos testes de marcação).

## Onde
`web/src/features/annotations/AnnotationCanvas.tsx`, `AnnotationEditor.tsx`. Esforço do relatório: G.

## Como verificar
Teste de unidade do criador por teclado; e2e só com teclado criando as quatro formas e movendo uma delas; rodar os e2e de imagem existentes; axe no diálogo.

## Registro
- Núcleo feito na branch feat/ui-imagem-popover: o canvas entra no Tab (`role="application"`, `tabIndex=0`); com a ferramenta ativa, setas movem um cursor (Shift anda mais; ponto visível só com foco por teclado) e Enter cria marcador, destaque, seta, área clicável, ocultar ou recorte no cursor; o item nasce selecionado e as setas passam a movê-lo (`nudge` agora vale para qualquer marcação, não só seta); `role="status"` anuncia tipo e posição; Esc segue a regra da janela (pergunta antes de descartar). Testes: `annotationCanvasKeyboard.test.tsx` e `nudge`.
- Falta (por isso segue aberto): e2e só com teclado criando as quatro formas e movendo uma; axe no diálogo; conferir com leitor de tela real; mover por seta item de ocultar/recortar selecionado (hoje as setas movem o cursor nesses casos).
- Fechamento (lote 2 B, `feat/ui-lote2-b`): e2e novo em `studio.imagem.e2e.ts` ("só com teclado cria as quatro formas…"): letra da ferramenta + Enter no canvas cria marcador, destaque, seta e área; Esc na legenda devolve o foco ao canvas; setas movem a área selecionada; axe na janela sem violação grave. O axe achou `label-content-name-mismatch` no botão Excluir do painel de estilo (o "Del" dentro do botão): a tecla foi para fora do botão. Setas agora movem também área de ocultar e recorte selecionados (`nudgeDraft`, com teste). Rodada: 45 e2e de imagem verdes. Fica de fora: conferir com leitor de tela real (NVDA/VoiceOver), que não dá para automatizar aqui.

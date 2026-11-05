# T-421: Mostrar erro quando a imagem do canvas de marcação não carrega

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: lote de medição, 2026-11-04

## Problema
O `<img>` em `AnnotationCanvas.tsx:149` não tem `onError`: imagem que não carrega deixa o canvas vazio, sem aviso (achado do T-401).

## Critérios de aceite
- [x] Falha de carga mostra motivo e "Tentar de novo", com teste.

## Registro
- Fechado, sem hash (2026-11-05). `AnnotationCanvas.tsx`: `onError` no `<img>` troca o canvas por aviso (`role="alert"`, "Não foi possível carregar a imagem para marcar.") e botão "Tentar de novo" que remonta o `<img>`. Texto em `i18n.en.ts`. Teste `web/test/annotationCanvasError.test.tsx`.

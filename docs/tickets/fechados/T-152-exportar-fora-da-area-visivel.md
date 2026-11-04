# T-152: Deixar o botão Exportar visível no diálogo de exportação

- Prioridade: P1
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A2 (avaliado no commit 60a0e3d)

## Problema
Achado A2. O botão Exportar fica fora da área visível: 14 px visíveis a 800 px de altura, 0 px a 720 e a 600. Depois de exportar faltaram 158 px de rolagem e o X saiu da área visível. O `DialogContent` inteiro rola (`max-h-[90vh] overflow-y-auto`, `ExportDialog.tsx:73`).

## Critérios de aceite
- [ ] O botão Exportar fica num rodapé fixo, visível em 1280x600, 1280x720 e 1280x800.
- [ ] Só o conteúdo do diálogo rola; o X continua visível.
- [ ] O resultado da exportação aparece junto do botão, sem exigir rolagem.

## Onde
- web/src/features/export/ExportDialog.tsx:73

## Como verificar
Abrir o diálogo em 1280x600, 1280x720 e 1280x800 e medir com evaluate_script a posição do botão e do X (`getBoundingClientRect`). Exportar e conferir que o resultado e o botão aparecem sem rolar a janela. Repetir em 375 px.

## Registro
Commit `b13e292`. Diálogo em coluna: cabeçalho e rodapé fixos, miolo rola; resultado e erro dentro do rodapé, com foco e scrollIntoView (sem animação em prefers-reduced-motion). e2e 1280x600, 720 e 800: título, X, Exportar e link à vista. Título cortado do lote anterior sumiu (não havia mais rolagem do conteúdo inteiro). Fica: 375 px conferido só pelo T-188.

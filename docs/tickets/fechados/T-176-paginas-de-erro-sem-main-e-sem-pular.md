# T-176: Dar main, nome às regiões e link para pular nas telas de erro

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado B6 (avaliado no commit 60a0e3d)

## Problema
Achado B6, axe moderado, critérios 1.3.1 e 2.4.1. Faltam `main` nas telas de erro. Regiões repetidas estão sem nome. Não há link para pular ao conteúdo.

## Critérios de aceite
- [x] Telas de erro têm `main`.
- [x] Regiões repetidas (ex.: nav, aside) têm nome único.
- [x] Há um link "Pular para o conteúdo" como primeiro foco do teclado.
- [x] Axe sem violação moderada de 1.3.1 e 2.4.1 nas telas de erro e no Studio.

## Onde
- web/src/components/ErrorPage.tsx
- web/src/layout (regiões repetidas e link de pular)

## Como verificar
Rodar axe nas telas de erro e no Studio. Apertar Tab logo ao carregar: o primeiro foco é o link de pular.

## Registro
Commit: este commit.
Feito: main nas telas de erro de página inteira (a embutida já está no main do Studio); link "Pular para o conteúdo" (SkipLink) primeiro foco no Studio e nas telas de erro; aside da barra lateral e do índice da página com nome.
Fora: axe não rodado (sem e2e local); teste de unidade cobre main e link.

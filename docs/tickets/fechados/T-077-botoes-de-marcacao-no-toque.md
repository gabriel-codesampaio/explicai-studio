# T-077: Botões da barra de marcação abaixo de 44 px e sem nome no toque

- Prioridade: P3
- Tamanho: M
- Status: fechado
- Agente: design
- Origem: revisão de design e de código do lote 6 (2026-11-02)

## Problema
Os botões das ferramentas de marcação medem 51x36 px e o nome só aparece no `title`, que não existe no toque.

## Critérios de aceite
- [x] Alvo de toque de pelo menos 44 px em telas estreitas e nome visível (a partir de sm ou sempre no toque).

## Onde
web/src/features/annotations/AnnotationEditor.tsx

## Como verificar
Teste da área e medida por script no navegador.

## Registro
Branch `fix/t-077-botoes-marcacao-toque`. AnnotationEditor: min 44 px no toque (pointer:coarse) e nome visível a partir de sm ou sempre no toque. Medido em 375 touch: 5 botões com h=44, nome visível. Sem teste automático (CSS).

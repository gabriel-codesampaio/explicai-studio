# T-077: Botões da barra de marcação abaixo de 44 px e sem nome no toque

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: design
- Origem: revisão de design e de código do lote 6 (2026-11-02)

## Problema
Os botões das ferramentas de marcação medem 51x36 px e o nome só aparece no `title`, que não existe no toque.

## Critérios de aceite
- [ ] Alvo de toque de pelo menos 44 px em telas estreitas e nome visível (a partir de sm ou sempre no toque).

## Onde
web/src/features/annotations/AnnotationEditor.tsx

## Como verificar
Teste da área e medida por script no navegador.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

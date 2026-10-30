# T-024: Tirar a rolagem horizontal de "Nesta página" com título longo

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: Prints de referência do P1 (design, 2026-10-29)

## Problema
Com um título longo ("Gerar o relatório de contas pag…") o índice "Nesta página" ganha barra de rolagem horizontal. Print: `explicai-prints/p1/antes/menu-barra-1440-claro.png`.

## Critérios de aceite
- [ ] Título longo no índice quebra linha ou corta com reticências, sem barra de rolagem horizontal.

## Onde
`web/src/features/editor/PageOutline.tsx`.

## Como verificar
Print em 1440 px com título longo.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-422: Extrair a linha do PageTree com React.memo

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: lote de medição, 2026-11-04

## Problema
Com 500 páginas o re-render do `PageTree` leva ~400 ms por tecla de título e por `dragOver`; a numeração custa 0,03 ms (T-106). O custo são as linhas. `renameItem` troca a identidade da árvore toda.

## Critérios de aceite
- [ ] Linha em `TreeRow` com `React.memo`, callbacks estáveis, `renameItem` preservando ramos intactos; re-render medido antes e depois (500 páginas).

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-427: Sidebar com público ativo recalcula a árvore a cada render

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: sobras do T-129 e do lote de regressões, 2026-11-05 (achado do T-422)

## Problema
Com "Ver como público" ativo, `visibleFor` recria os itens da árvore a cada render e o `React.memo` do `TreeRow` (T-422) não ajuda.

## Critérios de aceite
- [ ] `useMemo` em `visibleFor` (por páginas e público); medido com 500 páginas e público ativo, tecla no título no mesmo teto do T-423 (150 ms).

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

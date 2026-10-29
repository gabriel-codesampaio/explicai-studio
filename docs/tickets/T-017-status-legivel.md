# T-017: Status da página mais legível

- Prioridade: P2
- Status: aberto
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O status é um ponto cinza com texto de 13 px em cor de apoio; na árvore só aparece a bolinha.

## Critérios de aceite
- [ ] Status legível no topo da página, com contraste de pelo menos 4,5:1.
- [ ] Na árvore e na busca, o status tem nome acessível e não depende só da cor.

## Onde
`features/pages/StatusMenu.tsx`, `features/pages/PageTree.tsx`, `features/pages/PageSearch.tsx`.

## Como verificar
Snapshot de acessibilidade; prints nos dois temas.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

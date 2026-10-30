# T-017: Status da página mais legível

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O status é um ponto cinza com texto de 13 px em cor de apoio; na árvore só aparece a bolinha.

## Critérios de aceite
- [x] Status legível no topo da página, com contraste de pelo menos 4,5:1.
- [x] Na árvore e na busca, o status tem nome acessível e não depende só da cor.

## Onde
`features/pages/StatusMenu.tsx`, `features/pages/PageTree.tsx`, `features/pages/PageSearch.tsx`.

## Como verificar
Snapshot de acessibilidade; prints nos dois temas.

## Registro
Commit 87eeb8e (e2e em 1728b71). O nome do status ficou escrito (14 px no topo, 12 px na árvore e na busca) na cor da etapa: grafite (rascunho, anel vazio), laranja (em revisão), verde (aprovado), cobalto (publicado), todos com contraste de 5,07:1 ou mais nos dois temas (teste em `web/test/pageStatus.test.ts`). Em revisão deixou o amarelo (T-011). Na árvore o título trunca e o status não. O status em texto visível dá o nome acessível. Verificado: vitest, typecheck, biome, e2e (status, árvore e busca) e Chrome em 1280 e 375 px, claro e escuro. Fora: rascunho continua sem rótulo na árvore e na busca.

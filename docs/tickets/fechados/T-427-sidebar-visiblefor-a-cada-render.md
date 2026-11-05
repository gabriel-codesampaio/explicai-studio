# T-427: Sidebar com público ativo recalcula a árvore a cada render

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: sobras do T-129 e do lote de regressões, 2026-11-05 (achado do T-422)

## Problema
Com "Ver como público" ativo, `visibleFor` recria os itens da árvore a cada render e o `React.memo` do `TreeRow` (T-422) não ajuda.

## Critérios de aceite
- [x] `useMemo` em `visibleFor` (por páginas e público); medido com 500 páginas e público ativo, tecla no título no mesmo teto do T-423 (150 ms).

## Registro
- Commit: o deste ticket em `feat/fim-da-fila` (sem hash: o arquivo entra no próprio commit)
- Feito: `useMemo` em `Sidebar` (por `manual.pages` e público) e `visibleFor` devolve a mesma identidade para ramo sem página escondida. Só o `useMemo` não bastava: digitar o título já troca `pages`, e `visibleFor` recriava as 500 linhas. Teste em `web/test/audienceTree.test.ts`.
- Medida (500 páginas, público ativo, `PageTree` re-renderizado ao digitar um título, mediana de 14 trocas em happy-dom, 2 rodadas): antes 340 e 388 ms (máx. 678 e 718); depois 12,1 e 12,2 ms (máx. 14 e 19). Teto de 150 ms cumprido. Happy-dom não é navegador: o valor vale pela razão, não pelo número.
- Fora: ramo com página escondida ainda ganha array novo a cada cálculo (comentário `shortcut:` em `visibleFor`); cache por `WeakMap` se pesar.

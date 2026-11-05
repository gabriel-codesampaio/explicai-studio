# T-422: Extrair a linha do PageTree com React.memo

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: lote de medição, 2026-11-04

## Problema
Com 500 páginas o re-render do `PageTree` leva ~400 ms por tecla de título e por `dragOver`; a numeração custa 0,03 ms (T-106). O custo são as linhas. `renameItem` troca a identidade da árvore toda.

## Critérios de aceite
- [x] Linha em `TreeRow` com `React.memo`, callbacks estáveis, `renameItem` preservando ramos intactos; re-render medido antes e depois (500 páginas).

## Registro
Fechado em 2026-11-05 (sem hash; falta commit).
- Medido (500 páginas, happy-dom, mediana de 7): digitar título 366 e 390 ms e 500 linhas; `dragOver` 359 e 585 ms e 500 linhas. Depois: 11 ms e 2 linhas (a página e a mãe); `dragOver` 11 ms e 2 linhas (a que perde e a que ganha o hover). No Chrome real, tecla no título com 500 páginas: 137 ms para 44 ms.
- Causa maior: o `PageActions` calculava `shiftTarget` (O(n)) 4 vezes por linha em todo render, mesmo com o menu fechado. Agora `ShiftItems` só monta com o submenu aberto e lê a árvore por `getPages` estável.
- `TreeRow` com `React.memo` em `PageTree.tsx`; callbacks por ref (`select`, `act`, `drop`, `getPages`); `renameItem` mantém a identidade dos ramos sem a página.
- Teste: `web/test/pageTreeMemo.test.tsx` conta renders (não ms).
- Fora: `visibleFor` no `Sidebar` recria os itens a cada render quando há perfil ativo; nesse caso o memo não ajuda. Ticket novo se for relevante.

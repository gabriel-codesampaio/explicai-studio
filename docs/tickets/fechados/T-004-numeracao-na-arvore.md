# T-004: Mostrar a numeração 2.1 na árvore de páginas e na busca

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O manual exportado numera as páginas (1, 2, 2.1) em mono cobalto, e isso é o que mais tem cara de Explicaí. A árvore do Studio e o Ctrl+P não mostram a numeração.

## Critérios de aceite
- [x] Cada página da árvore mostra o número na frente do título (mono, cor de destaque), igual ao do sumário exportado.
- [x] A busca (Ctrl+P) mostra o mesmo número e o status da página.
- [x] A numeração vem de uma função só, compartilhada entre árvore e busca, com teste.

## Onde
`web/src/features/pages/PageTree.tsx`, `features/pages/PageSearch.tsx`, `web/src/lib/tree.ts`.

## Como verificar
Teste da função de numeração em `web/test/tree.test.ts`; teste de ponta a ponta da busca conferindo o número.

## Registro
Commits: 490df93 (numera as páginas com a mesma regra do sumário exportado), c558b39 (mostra a numeração na árvore e na busca), a129b3f (comentário sobre o sumário só de aprovadas), 2e58ea3 (design: título longo trunca em vez de abrir rolagem lateral).

O que foi feito: `numberPages` em `web/src/lib/tree.ts` espelha `collectPages` (ordem da árvore, um nível por profundidade, página com problema sem número e filhos no lugar dela); `searchPages` devolve `number`. Número em mono cobalto, `tabular-nums`, `aria-hidden`, antes do título na árvore e na busca; a busca ganhou o rótulo do status.

Verificação: testes em `web/test/tree.test.ts`; e2e "a árvore e a busca mostram a numeração do sumário, como 2.1 numa subpágina"; `npm run check` 99 testes. Design aprovou a árvore no claro a 1440 (print em `C:/Users/PC/explicai-prints/p1/T-004/`). Revisão sem achados que bloqueiem.

Ficou de fora: exportando só as aprovadas, o sumário renumera e pode diferir da árvore. Leitor de tela não ouve o número (decisão: `aria-hidden`). Busca Ctrl+P não vista pelo design (coberta pelo e2e).

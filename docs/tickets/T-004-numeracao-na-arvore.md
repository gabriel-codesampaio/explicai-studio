# T-004: Mostrar a numeração 2.1 na árvore de páginas e na busca

- Prioridade: P1
- Status: aberto
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O manual exportado numera as páginas (1, 2, 2.1) em mono cobalto, e isso é o que mais tem cara de Explicaí. A árvore do Studio e o Ctrl+P não mostram a numeração.

## Critérios de aceite
- [ ] Cada página da árvore mostra o número na frente do título (mono, cor de destaque), igual ao do sumário exportado.
- [ ] A busca (Ctrl+P) mostra o mesmo número e o status da página.
- [ ] A numeração vem de uma função só, compartilhada entre árvore e busca, com teste.

## Onde
`web/src/features/pages/PageTree.tsx`, `features/pages/PageSearch.tsx`, `web/src/lib/tree.ts`.

## Como verificar
Teste da função de numeração em `web/test/tree.test.ts`; teste de ponta a ponta da busca conferindo o número.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

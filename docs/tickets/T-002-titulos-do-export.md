# T-002: Corrigir o pulo de nível de título no manual exportado

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: core
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
No HTML exportado, a página de nível 0 é `h2` e os títulos de dentro dela viram `h4` (o detector acusou `skipped-heading`). Leitor de tela perde a hierarquia.

## Critérios de aceite
- [ ] Nenhum salto de nível de título no HTML exportado (h1 → h2 → h3, sem pular).
- [ ] O Markdown exportado mantém a mesma hierarquia.

## Onde
`src/core/export/html.ts` (`renderPage`, nível dos títulos), `src/core/export/markdown.ts` (`shiftHeadings`).

## Como verificar
Teste que percorre os títulos do HTML exportado e falha se houver salto; detector do impeccable no HTML sem `skipped-heading`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

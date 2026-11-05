# T-481: Cabeçalho a 375 px repete o nome do manual

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: design
- Origem: audit do T-037 (2026-11-04)

## Problema
A 375 px o nome do manual aparece duas vezes: ao lado do logo no topo e como trilha acima do título da página. A barra de ferramentas do editor também corta o último ícone sem pista de rolagem. No celular o Studio só precisa não quebrar, por isso P3.

## Critérios de aceite
- [x] A 375 px o nome do manual aparece uma vez só.
- [x] A barra do editor mostra que rola (fade na borda) ou quebra linha.

## Onde
`web/src/layout/` (cabeçalho mobile, trilha da página), barra do editor em `web/src/features/editor/`.

## Como verificar
Print a 375 px claro: sem nome repetido; axe da `studio.menus-axe.e2e.ts` segue verde.

## Registro
- Commit: (sem hash; fechado no lote regr)
- Feito: `web/src/layout/PageView.tsx`: abaixo de `split` (900 px, onde o MobileBar aparece) a trilha esconde o nome do manual e o primeiro chevron. Medido por Playwright headless a 375 px, tema claro: nome do manual visível 2 vezes -> 1 vez (página raiz e página filha); `scrollWidth` da página 375 = largura (sem rolagem lateral). Barra do editor: `scrollWidth` 480 / `clientWidth` 341 e o fade da direita já existia (`Fade` + `useScrollEdges`), opacidade 1 medida; nada a mudar ali.
- Fora: sem e2e novo nem axe rodado (é do qa). Largura única e tema único, como combinado.

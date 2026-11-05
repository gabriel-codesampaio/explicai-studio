# T-481: Cabeçalho a 375 px repete o nome do manual

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: audit do T-037 (2026-11-04)

## Problema
A 375 px o nome do manual aparece duas vezes: ao lado do logo no topo e como trilha acima do título da página. A barra de ferramentas do editor também corta o último ícone sem pista de rolagem. No celular o Studio só precisa não quebrar, por isso P3.

## Critérios de aceite
- [ ] A 375 px o nome do manual aparece uma vez só.
- [ ] A barra do editor mostra que rola (fade na borda) ou quebra linha.

## Onde
`web/src/layout/` (cabeçalho mobile, trilha da página), barra do editor em `web/src/features/editor/`.

## Como verificar
Print a 375 px claro: sem nome repetido; axe da `studio.menus-axe.e2e.ts` segue verde.

## Registro
<!-- preenchido ao fechar -->

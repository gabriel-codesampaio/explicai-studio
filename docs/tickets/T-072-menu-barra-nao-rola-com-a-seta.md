# T-072: Menu "/": o item ativo some quando a seta desce

- Prioridade: P1
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-30

## Problema
No menu "/" (SlashMenu.tsx), descer com a seta move o destaque para itens de baixo (ex. Quote, Code block), mas a lista não rola junto: o item ativo some abaixo da borda.

## Critérios de aceite
- [ ] O item ativo fica sempre à vista com seta para baixo e para cima, também ao dar a volta no fim e no começo da lista: `scrollIntoView({ block: "nearest" })` no item ativo.
- [ ] O cabeçalho de grupo ("STRUCTURE") não cobre o item; o mouse continua funcionando.
- [ ] Conferir BlockTypeMenu, TextColorMenu, FontMenu e a busca Ctrl+P (o Radix costuma resolver; confirmar e corrigir se faltar).
- [ ] e2e: abrir o "/" em altura pequena, apertar a seta até o último item e medir que está dentro do retângulo visível da lista.

## Onde
`web/src/features/editor/slash/SlashMenu.tsx`, `PageSearch.tsx`, menus da barra.

## Como verificar
Teste primeiro; e2e da área; medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

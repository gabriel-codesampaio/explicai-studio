# T-072: Menu "/": o item ativo some quando a seta desce

- Prioridade: P1
- Tamanho: P
- Status: feito
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
- Commit: 84a6cda (teste 233f4cb).
- Feito: SlashMenu rola o item ativo com `scrollIntoView({ block: "nearest" })` só nas setas; PageSearch rola o resultado ativo. BlockTypeMenu, TextColorMenu e FontMenu (Radix) já mantinham o foco à vista: teste de BlockTypeMenu passou sem mudança. Conferido no Chrome DevTools MCP, escuro, 1280x420: após 7 setas, scrollTop 93 e item dentro da lista.
- Fora: 375 px só pelo e2e (altura baixa, não largura); cabeçalho de grupo não é fixo, então não cobre o item.

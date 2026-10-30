# T-008: Menu "/" com prévia do bloco e grupos, sem ícones em quadrado

- Prioridade: P1
- Tamanho: G
- Status: aberto
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O menu "/" é um clone do Notion: quadrado de 32 px com ícone, título em negrito e dica cinza, numa lista de mais de 10 itens sem grupos.

## Critérios de aceite
- [ ] Itens agrupados com rótulos mono: ESTRUTURA, PASSO A PASSO, MÍDIA.
- [ ] Blocos didáticos mostram uma prévia do resultado: o círculo do passo, a faixa do Resultado, o título em Archivo.
- [ ] Busca, setas e Enter continuam funcionando; a busca por palavra-chave em inglês e português continua.

## Onde
`web/src/features/editor/slash/SlashMenu.tsx`, `features/editor/blocks.ts`.

## Como verificar
`web/test/blocks.test.ts` para os grupos; teste de ponta a ponta do menu "/".

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

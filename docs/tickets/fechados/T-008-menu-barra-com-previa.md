# T-008: Menu "/" com prévia do bloco e grupos, sem ícones em quadrado

- Prioridade: P1
- Tamanho: G
- Status: feito
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O menu "/" é um clone do Notion: quadrado de 32 px com ícone, título em negrito e dica cinza, numa lista de mais de 10 itens sem grupos.

## Critérios de aceite
- [x] Itens agrupados com rótulos mono: ESTRUTURA, PASSO A PASSO, MÍDIA.
- [x] Blocos didáticos mostram uma prévia do resultado: o círculo do passo, a faixa do Resultado, o título em Archivo.
- [x] Busca, setas e Enter continuam funcionando; a busca por palavra-chave em inglês e português continua.

## Onde
`web/src/features/editor/slash/SlashMenu.tsx`, `features/editor/blocks.ts`.

## Como verificar
`web/test/blocks.test.ts` para os grupos; teste de ponta a ponta do menu "/".

## Registro
Commits: a7e02a1 (grupos e busca), 1ba09e3 (prévia no lugar do ícone).

O que foi feito: grupos Estrutura, Passo a passo, Alertas (blocos do T-034) e Mídia com rótulo mono (`rotulo`); `groupBlocks` e `searchBlocks` em `blocks.ts` mantêm a ordem dos grupos, então setas e Enter seguem a ordem visual. `SlashPreview.tsx` desenha a miniatura de cada bloco (Aa em Archivo no tamanho do título, círculo do passo, faixa do Resultado, barra de cor do alerta) sem ícone em quadrado. Palavras-chave extras em pt e en. Menu de 288 para 320 px.

Verificação: vitest web (138 ok), typecheck, biome, e2e -g "/|menu|bloco" (6 ok, 1 novo). Chrome DevTools: claro e escuro, 1280 e 500 px, sem estouro.

Ficou de fora: o seletor "Tipo de bloco" da barra segue com ícone (ali ele identifica o item sem prévia). A prévia do Resultado é a faixa com "OK", não o texto real.

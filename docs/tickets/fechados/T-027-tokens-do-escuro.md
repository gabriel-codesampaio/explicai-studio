# T-027: Alinhar as cores do tema escuro ao brand book

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: design
- Origem: Prints de referência do P1 e revisão do T-019 (2026-10-29)

## Problema
No escuro, `tokens.css` usa cobalto #8098ff (brand book: #7088FF), grafite #a3aac4 (#9CA3BD) e coral #ff8a70 (#FF7F63). Os números dos passos e os marcadores continuam #2B4FE0 com número branco, e o brand book pede #7088FF com número em #0E1120.

## Critérios de aceite
- [x] Os tokens do tema escuro batem com o brand book, mantendo contraste AA de texto e botão.
- [x] Os marcadores e números dos passos no escuro seguem o brand book, ou o Registro explica por que ficam iguais aos do manual exportado.

## Onde
`web/src/styles/tokens.css`, `web/src/styles/editor-content.css`.

## Como verificar
Prints no escuro; medida de contraste dos pares texto/fundo e botão.

## Registro
Commits: ver `git log` da branch fix/t-027-tokens-do-escuro.

Escuro agora igual ao brand book: cobalto #7088FF (era #8098FF), grafite #9CA3BD (era #A3AAC4), coral #FF7F63 (era #FF8A70), seleção com o mesmo cobalto em 35%. `web/src/styles/tokens.css`.

Marcadores e números dos passos: `--anotacao` #7088FF e `--sobre-anotacao` #0E1120 já estavam no escuro (o ticket estava defasado); `editor-content.css` só consome os tokens, sem mudança. O manual exportado é só claro (#2B4FE0 com número branco, em `src/core/export/html.ts`), sem tema escuro; não foi mexido.

Contraste medido (escuro, WCAG), todos passam AA:

| Par | Razão |
|-----|-------|
| tinta/papel | 16,20 |
| tinta/superfície | 14,85 |
| grafite/papel | 7,49 |
| grafite/superfície | 6,87 |
| cobalto (texto, link)/papel | 5,94 |
| cobalto/superfície | 5,45 |
| botão #0E1120 sobre cobalto | 5,94 |
| número #0E1120 sobre marcador | 5,94 |
| coral/papel | 7,56 |
| coral/superfície | 6,93 |
| borda de campo/papel (mín. 3) | 4,12 |

Teste: `web/test/tokensContrast.test.ts` calcula esses pares nos dois temas a partir do tokens.css. Fora: print no escuro não feito (troca só de valor de token).

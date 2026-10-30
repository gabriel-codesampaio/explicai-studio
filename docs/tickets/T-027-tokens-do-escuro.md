# T-027: Alinhar as cores do tema escuro ao brand book

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: design
- Origem: Prints de referência do P1 e revisão do T-019 (2026-10-29)

## Problema
No escuro, `tokens.css` usa cobalto #8098ff (brand book: #7088FF), grafite #a3aac4 (#9CA3BD) e coral #ff8a70 (#FF7F63). Os números dos passos e os marcadores continuam #2B4FE0 com número branco, e o brand book pede #7088FF com número em #0E1120.

## Critérios de aceite
- [ ] Os tokens do tema escuro batem com o brand book, mantendo contraste AA de texto e botão.
- [ ] Os marcadores e números dos passos no escuro seguem o brand book, ou o Registro explica por que ficam iguais aos do manual exportado.

## Onde
`web/src/styles/tokens.css`, `web/src/styles/editor-content.css`.

## Como verificar
Prints no escuro; medida de contraste dos pares texto/fundo e botão.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

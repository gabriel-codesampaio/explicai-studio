# T-025: Mostrar que a barra de ferramentas rola em 375 px

- Prioridade: P2
- Status: aberto
- Agente: frontend
- Origem: Prints de referência do P1 (design, 2026-10-29)

## Problema
Em 375 px a barra de ferramentas tem `scrollWidth` 413 para 351 visíveis: o último botão fica cortado e o botão Tabela fica fora da tela, sem sinal de que há mais.

## Critérios de aceite
- [ ] Em 375 px todos os botões da barra são alcançáveis e há sinal visual de que a barra continua (ou ela quebra em duas linhas).

## Onde
`web/src/features/editor/Toolbar.tsx`.

## Como verificar
Print em 375 px nos dois temas.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

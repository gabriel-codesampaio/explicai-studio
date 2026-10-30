# T-037: Gerar o DESIGN.md e rodar o audit do impeccable

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: [Discovery do impeccable](../discovery/2026-10-30-impeccable.md) (2026-10-30)

## Problema
Só a `critique` rodou até agora. Falta um `DESIGN.md` que descreva o sistema visual e um audit técnico (acessibilidade, desempenho, tema, responsivo).

## Critérios de aceite
- [ ] `DESIGN.md` gerado com `/impeccable document` e conferido contra o brand book e os tokens de `web/src/styles/`.
- [ ] `/impeccable audit` roda só relatando; relatório guardado em `.impeccable/`.
- [ ] Cada achado ganha ticket novo ou aponta um ticket aberto; nenhum duplicado.
- [ ] Nenhum arquivo de `src/` ou `web/src/` alterado.

## Onde
`DESIGN.md`, `.impeccable/`, `docs/tickets/`.

## Como verificar
Relatório do audit e tabela achado → ticket no Registro.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-009: Raio de 3 px na interface de trabalho

- Prioridade: P1
- Status: aberto
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Todo componente usa `--radius: 6px` (raio igual em tudo é sinal de interface gerada). O brand book usa canto quase reto e reserva o arredondado para o símbolo.

## Critérios de aceite
- [ ] Raio base da interface em ~3 px (campos, menus, diálogos, cards da exportação).
- [ ] Prints, ícone da marca e marcadores redondos continuam como estão.
- [ ] Nenhum componente com raio solto fora dos tokens.

## Onde
`web/src/styles/tokens.css` (`--radius`), componentes com `rounded-*` fixo.

## Como verificar
Prints antes e depois; busca por `rounded-` fora dos tokens.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

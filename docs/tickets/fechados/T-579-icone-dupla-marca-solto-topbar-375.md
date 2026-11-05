# T-579: Ícone de dupla marca solto ao lado de "Marcar como conferida" no topbar a 375 px

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: revisão de design do PR #149

## Problema
A 375 px, no topbar, o ícone de dupla marca (check duplo) aparece solto ao lado de "Marcar como conferida", sem relação clara com o botão (`ReviewedControl`/topbar).

## Critérios de aceite
- [x] A 375 px o ícone fica dentro do botão ou some; sem ícone órfão.
- [x] Alvo de toque de 44 px, nome acessível mantido.

## Onde
`ReviewedControl` e topbar em `web/src/`.

## Nota
A prévia da capa/rodapé no escuro está coberta pelo T-577.

## Feito
O ícone já ficava dentro do botão, mas sem borda parecia solto ao lado do texto "Nunca conferida". Abaixo de `sm` ele some (`max-sm:hidden`); o texto do botão basta. Nome acessível e alvo de 44 px em toque ficam como estavam.

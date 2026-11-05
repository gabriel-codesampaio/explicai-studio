# T-579: Ícone de dupla marca solto ao lado de "Marcar como conferida" no topbar a 375 px

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: revisão de design do PR #149

## Problema
A 375 px, no topbar, o ícone de dupla marca (check duplo) aparece solto ao lado de "Marcar como conferida", sem relação clara com o botão (`ReviewedControl`/topbar).

## Critérios de aceite
- [ ] A 375 px o ícone fica dentro do botão ou some; sem ícone órfão.
- [ ] Alvo de toque de 44 px, nome acessível mantido.

## Onde
`ReviewedControl` e topbar em `web/src/`.

## Nota
A prévia da capa/rodapé no escuro está coberta pelo T-577.

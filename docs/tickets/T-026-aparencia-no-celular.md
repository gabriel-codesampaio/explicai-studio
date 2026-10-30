# T-026: Abrir o painel Aparência dentro da tela no celular e marcar a opção escolhida no escuro

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: design
- Origem: Revisão de design do T-019 (2026-10-29)

## Problema
Em 375 px o painel Aparência abre para a direita (`side="right"`) e corta "Sistema" e "English" para fora da tela (print `explicai-prints/p1/T-019/aparencia-375-claro.png`). No tema escuro a opção marcada de Tema e Idioma tem fundo #161a2e sobre trilho #1b2034 (1,07:1); só o negrito diz qual está escolhida.

## Critérios de aceite
- [ ] Em 375 px todas as opções do painel ficam visíveis e tocáveis.
- [ ] No escuro a opção marcada se distingue por mais que o peso da fonte (contraste de pelo menos 3:1 com o trilho).

## Onde
`web/src/features/settings/AppearancePanel.tsx`.

## Como verificar
Prints em 375 e 1440 px nos dois temas.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

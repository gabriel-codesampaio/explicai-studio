# T-026: Abrir o painel Aparência dentro da tela no celular e marcar a opção escolhida no escuro

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: design
- Origem: Revisão de design do T-019 (2026-10-29)

## Problema
Em 375 px o painel Aparência abre para a direita (`side="right"`) e corta "Sistema" e "English" para fora da tela (print `~/explicai-prints/p1/T-019/aparencia-375-claro.png`). No tema escuro a opção marcada de Tema e Idioma tem fundo #161a2e sobre trilho #1b2034 (1,07:1); só o negrito diz qual está escolhida.

## Critérios de aceite
- [x] Em 375 px todas as opções do painel ficam visíveis e tocáveis.
- [x] No escuro a opção marcada se distingue por mais que o peso da fonte (contraste de pelo menos 3:1 com o trilho).

## Onde
`web/src/features/settings/AppearancePanel.tsx`.

## Como verificar
Prints em 375 e 1440 px nos dois temas.

## Registro
Commits: 0eeb73a (fix(web): marcar a opção escolhida com anel e dar área de toque de 44 px nos painéis Aparência e Idioma) e o commit que fecha este ticket.

O que foi feito: o painel já era um diálogo centralizado (não abria mais para a direita); medido em 375 px, claro e escuro, as opções de Tema e Idioma ficam dentro da tela. A opção marcada ganhou `ring-2 ring-primary` (cobalto do token, sem mexer em `tokens.css`), com pelo menos 3:1 sobre o trilho nos dois temas, e os botões passaram a `min-h-11`. Arquivos: `AppearancePanel.tsx`, `LanguagePanel.tsx`. Teste: `e2e/studio.e2e.ts` ("painéis Aparência e Idioma em 375 px", claro e escuro: mede posição, altura e contraste do anel).

Ficou de fora: nada. Sem texto novo, então `lib/i18n.en.ts` não mudou.

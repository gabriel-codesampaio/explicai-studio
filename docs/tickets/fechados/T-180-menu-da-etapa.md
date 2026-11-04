# T-180: Redesenhar o menu da etapa da página

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: design
- Origem: pedido da pessoa, 2026-11-04 (lote 1.0)

## Problema
O menu "Etapa da página" está esquisito: o item atual mostra dois indicadores (ponto de seleção e o círculo da etapa), o título "Etapa da página" é solto e as cores das etapas brigam entre si.

## Critérios de aceite
- [ ] Um indicador só por item: a bolinha colorida da etapa; o atual marcado por check ou fundo, não por um segundo ponto.
- [ ] Nome e dica alinhados na mesma coluna; espaçamento igual aos outros menus do Studio.
- [ ] Cores das etapas dentro da paleta da marca e com contraste 4,5:1.
- [ ] Teclado e leitor de tela continuam funcionando (menuitemradio).

## Onde
- web/src/features/pages/StatusMenu.tsx, web/src/lib/status.ts
- Relacionado: T-166 (vocabulário dos status)

## Como verificar
Abrir o menu em cada etapa, 1280 claro e escuro; teste existente do StatusMenu.

## Registro
Commit `dee581e`. StatusMenu: um indicador por item (bolinha da etapa), atual com fundo e check; ponto padrão do radio oculto. Contraste mínimo 4,73 claro e 5,11 escuro. Cores em status.ts já estavam na paleta, sem mudança.

# T-044: "Colar print" fica fora da tela em 375 px

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: Conferência visual de T-010 e T-040 (2026-10-30)

## Problema
Em 375 px a barra de formatação tem `scrollWidth` 559 para 351 visíveis (com os alvos de toque de 44 px; antes eram 499). O botão "Colar print", a ação principal da barra, começa em x=361 e só aparece depois de rolar a barra de lado, sem sinal de que ela rola. O T-025 já trata do corte e do sinal; este ticket pede que "Colar print" fique à vista.

## Critérios de aceite
- [x] Em 375 px "Colar print" aparece sem rolar a barra (por exemplo, a barra quebra em duas linhas, ou o botão vem antes dos de formatação).
- [x] Todos os botões da barra seguem com 44 px de altura em tela de toque.

## Onde
`web/src/features/editor/Toolbar.tsx` (junto com o T-025).

## Como verificar
Medir com `evaluate_script` em 375 px nos dois temas; e2e "alvos de toque".

## Registro
Colar print passou a vir logo após o seletor de bloco (x 119-275 em 375 px), à vista sem rolar. Alvos seguem com 44 px; o botão de cor do texto mede 32 px em toque (fora deste ticket).

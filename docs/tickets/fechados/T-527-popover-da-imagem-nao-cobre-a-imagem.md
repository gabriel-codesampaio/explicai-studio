# T-527: Popover da imagem não cobrir a própria imagem

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado M2 (Médio)

## Problema
`web/src/features/editor/ImagePopover.tsx`: o painel de 320 px nasce sobre o canto superior esquerdo do print e termina colado na barra de status, cortando "Remover imagem" em tela baixa (print `21-img-click.png`). Quem escreve a descrição não vê a imagem. Relacionado: T-063 (popover não pode encostar no rodapé), já fechado; este caso é outro.

## Critérios de aceite
- [x] O popover abre ao lado ou abaixo da imagem, sem cobri-la, em 1280x800 e 1280x720.
- [x] Em tela baixa todos os botões, inclusive "Remover imagem", ficam visíveis e alcançáveis, sem ficar atrás da barra de status (`collisionPadding` do rodapé de 3rem).
- [x] Em 375 px continua cabendo, sem overflow horizontal.

## Onde
`web/src/features/editor/ImagePopover.tsx`. Esforço do relatório: P.

## Como verificar
`evaluate_script` com o retângulo do popover e da imagem em 1280x720 e 375 px; e2e do popover em tela baixa.

## Registro
- Fechado na branch feat/ui-imagem-popover. O balão escolhe o primeiro lado livre da imagem (embaixo, direita, esquerda, em cima; `freeSide`) e se apoia na figura inteira. Em 1280x800 e 1280x720 abre à direita sem tocar a imagem. Em 375 px a imagem ocupa a tela e não há lado livre: o balão fica sobre a parte de baixo dela, com todos os botões acima do rodapé e sem overflow horizontal. Teste de unidade de `freeSide`.

# T-526: Mostrar o tamanho atual no popover da imagem

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado M1 (Médio)

## Problema
`web/src/features/annotations/ImageSizePicker.tsx`: Pequena, Média e Larga saem todas com `aria-pressed="false"` e sem destaque visual, então não se vê qual tamanho está em uso (print `21-img-click.png`).

## Critérios de aceite
- [x] O tamanho atual sai com `aria-pressed="true"` e destaque visual (contorno cobalto); os outros, `false`.
- [x] Trocar o tamanho move o destaque.
- [x] O destaque tem contraste de 3:1 ou mais no claro e no escuro.

## Onde
`web/src/features/annotations/ImageSizePicker.tsx`. Esforço do relatório: P.

## Como verificar
Teste de unidade do picker com cada valor; e2e: abrir a imagem, ler `aria-pressed`, trocar o tamanho, conferir. Contraste medido com `evaluate_script`.

## Registro
- Fechado na branch feat/ui-imagem-popover. ImageSizePicker marca o tamanho em uso com aria-pressed e contorno cobalto (anel de 1 px); sem tamanho gravado, Larga conta como atual. Teste de unidade com cada valor e com a troca.

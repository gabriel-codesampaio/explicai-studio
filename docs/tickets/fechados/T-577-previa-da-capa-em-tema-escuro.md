# T-577: Prévia da capa em tema escuro

- Prioridade: P3
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: achado de revisão dos PRs de 2026-11-05

## Problema
`CoverFooterFields` usa `bg-superficie` com `text-tinta` na prévia; a prévia mostra a cor do Studio e não a do manual, e no tema escuro engana.

## Critérios de aceite
- [ ] A prévia usa as cores reais do manual (ou um fundo fixo claro) nos dois temas.

## Onde
`web/src/features/settings/CoverFooterFields.tsx`.

## Como verificar
Conferir no navegador em claro e escuro (design).

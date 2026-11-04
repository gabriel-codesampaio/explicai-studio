# T-136: Matriz de tela do Popover de público

- Prioridade: P3
- Tamanho: P
- Status: descartado
- Agente: qa
- Origem: sobra do T-124 (2026-11-04)

## Problema
O Popover de público foi conferido só na fatia. Falta a matriz completa, com teclado e leitor de tela.

## Critérios de aceite
- [ ] Conferido em 375 e 1280, claro e escuro, pt e en.
- [ ] Funciona só com o teclado e é anunciado direito por leitor de tela.

## Onde
`web/src/features/pages/AudienceMenu.tsx`.

## Como verificar
Relatório com a evidência de cada combinação. Defeito vira ticket.

## Registro
2026-11-04: absorvido pelo critério do T-187 (matriz de tela do diálogo e do popover).

# T-169: Pôr a marca na tela de primeiro uso, como nas telas de erro

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: design
- Origem: relatório UX 2026-11-04, achado A20 (avaliado no commit 60a0e3d)

## Problema
Achado A20. A tela de primeiro uso (criar manual) não tem a marca do Explicaí. As telas de erro têm logo, então a identidade fica inconsistente.

## Critérios de aceite
- [x] A tela de criar manual mostra o logo com o mesmo padrão das telas de erro.
- [x] O logo não empurra o formulário para fora da tela em 375 px.

## Onde
- web/src/features/manuals/CreateManual.tsx
- web/src/components/ErrorPage.tsx (padrão do logo)

## Como verificar
Abrir a tela de criar manual em 1280 e 375 px e comparar com uma tela de erro. Conferir com print uma vez.

## Registro
- Commit: este commit
- Feito: primeiro uso (sem manual) mostra o `Brand` acima do formulário, o mesmo componente das telas de erro, alinhado à coluna do form (max-w-lg). Fora do primeiro uso a marca segue só na barra lateral. Medido em 375x667: form termina em 483 px, sem overflow horizontal; em 1280 o logo fica alinhado ao título. 1 teste novo em web/test/createManual.test.tsx.
- Fora: alinhamento na coluna de 1024 px das telas de erro (usei a do form, de propósito); print conferido só em 375.

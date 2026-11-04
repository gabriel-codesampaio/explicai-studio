# T-169: Pôr a marca na tela de primeiro uso, como nas telas de erro

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: relatório UX 2026-11-04, achado A20 (avaliado no commit 60a0e3d)

## Problema
Achado A20. A tela de primeiro uso (criar manual) não tem a marca do Explicaí. As telas de erro têm logo, então a identidade fica inconsistente.

## Critérios de aceite
- [ ] A tela de criar manual mostra o logo com o mesmo padrão das telas de erro.
- [ ] O logo não empurra o formulário para fora da tela em 375 px.

## Onde
- web/src/features/manuals/CreateManual.tsx
- web/src/components/ErrorPage.tsx (padrão do logo)

## Como verificar
Abrir a tela de criar manual em 1280 e 375 px e comparar com uma tela de erro. Conferir com print uma vez.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

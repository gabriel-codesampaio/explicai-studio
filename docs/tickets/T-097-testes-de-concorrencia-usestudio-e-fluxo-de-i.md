# T-097: Testes de concorrência, `useStudio` e fluxo de imagem

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: qa
- Origem: auditoria ponytail de 2026-11-02, achado 14 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
Testes de concorrência, `useStudio` e fluxo de imagem

## Critérios de aceite
- [ ] um teste por achado 2, 4, 5 e 10 ao corrigi-los; mais um `useStudio.test.tsx` com `fetch` simulado cobrindo troca de página rápida e servidor fora.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
Ver a seção do achado na auditoria.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 14 da auditoria.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

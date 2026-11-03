# T-112: e2e "barra da seleção" falha às vezes

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: qa
- Origem: preparação da versão de produção (2026-11-03)

## Problema
O teste em e2e/studio.e2e.ts:187 falha às vezes na suíte completa. Suíte instável não serve de porta para a versão.

## Critérios de aceite
- [ ] Causa medida (skill diagnosticar), corrigida no teste ou no código; 10 repetições seguidas verdes, também em paralelo.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
e2e/studio.e2e.ts:187

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-127: E2e "primeiro uso" falha em paralelo

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: qa
- Origem: lote 6 (2026-11-03)

## Problema
O e2e "primeiro uso" depende de workspace vazio. Falhou (143 de 144) quando outro teste criou manual em paralelo, com `--workers=2`, e passa sozinho.

## Critérios de aceite
- [ ] O teste usa workspace próprio e passa com `--workers=2` e `--repeat-each`.

## Onde
`e2e/`, `e2e/studio.lote6.e2e.ts`.

## Como verificar
`npx playwright test --workers=2`, duas rodadas seguidas.

## Registro
- Medido: com 6 processos de CPU e 2 workers, o teste falhou 9 de 10 (heading do estado vazio não aparece). Causa: o servidor e2e é compartilhado e outro teste em paralelo já criou manual.
- Correção: o teste sobe o próprio servidor (porta livre, pasta temporária). Depois: 0 falhas em 10 sob a mesma carga.
- Commit: 2e994fc.

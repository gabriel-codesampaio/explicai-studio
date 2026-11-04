# T-127: E2e "primeiro uso" falha em paralelo

- Prioridade: P3
- Tamanho: P
- Status: aberto
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
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

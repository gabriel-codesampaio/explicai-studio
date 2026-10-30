# T-060: Medir a cobertura de testes

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: qa

## Feito
`npm run test:cov` roda o Vitest com v8 sobre `src` e `web/src` (`vitest.config.ts`). Os pisos só entraram depois de medir, no número medido menos 2.

| Métrica | Medido | Piso |
|---|---|---|
| Statements | 44,96 | 42 |
| Branches | 37,2 | 35 |
| Functions | 36,63 | 34 |
| Lines | 44,86 | 42 |

Suíte completa: 25 arquivos, 150 testes passando. O núcleo (`src/core`) e o servidor passam de 90%; `web/src` quase não tem teste fora de `lib/` e do editor (T-061 e seguintes).

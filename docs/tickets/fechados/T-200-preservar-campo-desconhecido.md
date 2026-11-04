# T-200: Preservar campo desconhecido ao regravar manual.json e assets

- Prioridade: P1
- Tamanho: P
- Status: fechado
- Agente: frontend
- Marco: 0.4
- Origem: discovery [versao-1-0](../discovery/versao-1-0.md), lacuna 3 (2026-11-04)

## Problema
Verificar e testar que `manual.json` e `assets/*.json` preservam campo desconhecido ao regravar (Studio e MCP).

## Critérios de aceite
- [ ] O que a lacuna 3 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [ ] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
- Commit: feat/t-200-campo-desconhecido (fix(core) e docs(formato)).
- Feito: `manual.json` já preservava (raiz, theme, nós) em renomear, mover, atualizar página e tema. `assets/*.json` perdia campo novo ao regravar (`parseAnnotations` reconstruía o objeto); corrigido em `src/core/annotations.ts` (raiz e itens). Teste `test/unknown-fields.test.ts` (Studio via `writeAnnotations`, MCP via `appendAnnotations`). Seção "Campos desconhecidos" em `docs/manual-format.md`.
- Fora: campo desconhecido dentro de `style`; o editor web não foi conferido (se remontar o JSON no cliente, perde).

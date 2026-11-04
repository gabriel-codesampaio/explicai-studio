# T-198: Escrever a política de compatibilidade e semver

- Prioridade: P1
- Tamanho: P
- Status: fechado
- Agente: escritor
- Marco: 0.4
- Origem: discovery [versao-1-0](../discovery/versao-1-0.md), lacuna 1 (2026-11-04)

## Problema
Política de compatibilidade e semver escrita em `docs/manual-format.md` e no README (o que é contrato, o que é interno).

## Critérios de aceite
- [x] O que a lacuna 1 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [x] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
- Commit: 29dbde0
- Feito: seção "Compatibilidade" em `docs/manual-format.md` (contrato, interno, só-acréscimo, migração, formato mais novo como meta) e trecho pt/en no README. Decisão: só o Studio vai a 1.0, o MCP segue 0.x; anotado na discovery.
- Fora: abertura de formato maior em modo leitura (hoje `readManual` lança erro), teste de campo desconhecido em `manual.json` e `assets/*.json`, fixtures antigas.

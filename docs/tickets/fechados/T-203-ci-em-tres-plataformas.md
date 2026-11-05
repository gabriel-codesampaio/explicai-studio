# T-203: CI em Windows, macOS e Linux, no Node 22

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: qa
- Marco: 0.9
- Origem: discovery [versao-1-0](../../discovery/archives/versao-1-0.md), lacuna 7 (2026-11-04)

## Problema
Matriz de plataforma e Node no CI (Windows, macOS, Linux; Node LTS do `engines`). Hipótese: o desenvolvimento é só em Windows.

Decidido (pessoa, 2026-11-04): um Node só no CI, o 22, com `engines` em `>=22.12`.

## Critérios de aceite
- [ ] O que a lacuna 7 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [ ] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
- Commit: branch ci/t-203-tres-plataformas (ci: matriz de plataformas).
- Feito: job `plataformas` em `.github/workflows/ci.yml` roda `typecheck` e `npm test` em windows-latest e macos-latest, Node 22, `fail-fast: false`. O job `check` ("Lint, tipos e testes", ubuntu) ficou intacto, então o check exigido mantém o nome. YAML validado localmente; o CI real não rodou.
- Fora: lint e cobertura só no Linux; e2e só no Linux. Os checks novos ("Testes (windows-latest)", "Testes (macos-latest)") não são exigidos até a pessoa decidir. Falha real em Windows/macOS só aparece no primeiro run.

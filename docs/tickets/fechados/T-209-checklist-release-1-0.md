# T-209: Checklist de release da 1.0

- Prioridade: P1
- Tamanho: P
- Status: feito
- Agente: supervisor
- Marco: 1.0
- Origem: discovery [versao-1-0](../discovery/versao-1-0.md), lacuna 12 (2026-11-04)

## Problema
Checklist de release 1.0: `seguranca`, `npm audit`, tag, notas de versão pt/en, landing atualizada. Post do blog só quando a pessoa pedir. Studio só; o MCP segue 0.x (decisão da pessoa).

O checklist está em [docs/release.md](../release.md). Fica aberto até ser cumprido na próxima versão.

## Critérios de aceite
- [x] O que a lacuna 12 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [x] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
2026-11-05: cumprido na 1.0.0 (PR #119, tag v1.0.0 em 637dc72). Fila do Studio vazia salvo T-426; check 798 testes; e2e completo verde; CI em Linux, Windows e macOS; npm audit 0; seguranca e revisão sem P0/P1; FORMAT_VERSION 1; CHANGELOG e versão; landing com prints novos (#11 do explicai-website). Publicado com provenance pelo workflow Release.

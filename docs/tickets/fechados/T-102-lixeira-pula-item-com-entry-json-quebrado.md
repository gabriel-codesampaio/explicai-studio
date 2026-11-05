# T-102: Lixeira pula item com `entry.json` quebrado

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 19 (`docs/discovery/archives/2026-11-02-auditoria-ponytail.md`)

## Problema
Lixeira pula item com `entry.json` quebrado

## Critérios de aceite
- [ ] Lixeira pula item com `entry.json` quebrado
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
Ver a seção do achado na auditoria.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 19 da auditoria.

## Registro
Commit 1ecc274. `listTrash` envolve cada item em try/catch e pula o que falha (JSON quebrado ou forma errada). Restaurar item quebrado não mudou.

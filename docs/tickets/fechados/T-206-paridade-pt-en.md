# T-206: Teste de paridade de chaves pt/en

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: qa
- Marco: 0.9
- Origem: discovery [versao-1-0](../discovery/versao-1-0.md), lacuna 10 (2026-11-04)

## Problema
Teste de paridade de chaves pt/en (Studio, HTML exportado, core, MCP).

## Critérios de aceite
- [x] O que a lacuna 10 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [x] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
Feito (branch feat/t-206-paridade-pt-en):
- Studio: `web/test/i18n.test.ts` já falhava se faltasse tradução de `t()`/`tn()`; somado teste de EN vazio e de `{marcadores}` diferentes do pt.
- HTML exportado: `test/export-labels-parity.test.ts` (mesmas chaves e callouts em pt/en, sem texto vazio).
- Página de erro do servidor: pt/en já obrigados pelo tipo (`Record<Lang, ...>`), sem teste novo.
- Chaves faltando: nenhuma encontrada.
- Fora: mensagens de erro do core e do MCP são só em português por desenho (sem en); paridade não se aplica até haver tradução. Fica para decisão se a 1.0 exigir.

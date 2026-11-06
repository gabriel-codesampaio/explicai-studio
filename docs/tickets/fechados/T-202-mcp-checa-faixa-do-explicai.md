# T-202: MCP confere a faixa de versão do explicai

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: supervisor
- Marco: 0.5
- Origem: discovery [versao-1-0](../discovery/archives/versao-1-0.md), lacuna 5 (2026-11-04)

## Problema
Faixa de versão Studio/MCP: o MCP checa a versão de `explicai` e explica o desencontro. Studio só; o MCP segue 0.x (decisão da pessoa).

## Critérios de aceite
- [x] O que a lacuna 5 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [x] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
explicai-mcp, PR de `feat/mcp-fechar-lote`: `src/compat.ts` confere o `explicai` instalado ao iniciar (`>=1.0.0 <2.0.0`, igual ao `peerDependencies`; o 1.0.0 é onde o `style` por item entrou). Fora da faixa o servidor não sobe e a mensagem diz se atualiza o `explicai` ou o `explicai-mcp`. `test/compat.test.ts` cobre a faixa (versão injetada) e a igualdade com o `peerDependencies`; o teste de stdio sobe o `dist/cli.js` com o `explicai` 1.0.0 real. README (Compatibilidade com o explicai) e CHANGELOG. O MCP segue 0.x. Lockfile do MCP passou do `explicai` 0.3.0 para 1.0.0.

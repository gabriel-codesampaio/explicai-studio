# T-202: MCP confere a faixa de versão do explicai

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: supervisor
- Marco: 0.5
- Origem: discovery [versao-1-0](../discovery/versao-1-0.md), lacuna 5 (2026-11-04)

## Problema
Faixa de versão Studio/MCP: o MCP checa a versão de `explicai` e explica o desencontro. Studio só; o MCP segue 0.x (decisão da pessoa).

## Critérios de aceite
- [ ] O que a lacuna 5 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [ ] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
- Commit: explicai-mcp, branch feat/t-202-faixa-versao-explicai (9d48937, feat(compat)).
- Feito: `src/compat.ts` confere o `explicai` instalado ao iniciar (`>=0.3.0 <2.0.0`, igual ao `peerDependencies`); fora da faixa o servidor não sobe e a mensagem manda atualizar o `explicai` ou o `explicai-mcp`. Teste `test/compat.test.ts` (12 casos, versão injetada; inclui igualdade com o peerDependencies). Documentado no README (seção Compatibilidade com o explicai) e CHANGELOG do MCP. O MCP segue 0.x.
- Fora: a checagem roda no `cli.ts`, depois dos imports; se `explicai/core` nem resolver, o Node falha antes com o erro dele. Teste de contrato do servidor com versão real não rodou (node_modules/explicai quebrado na máquina). Faixa máxima <2.0.0 é escolha minha (Studio 1.x promete só acréscimo); ajustar se a pessoa preferir <1.0.

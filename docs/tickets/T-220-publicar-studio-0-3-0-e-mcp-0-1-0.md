# T-220: Publicar Studio 0.3.0 e explicai-mcp 0.1.0

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: supervisor
- Origem: pedido da pessoa (2026-11-04)

## Problema
O MCP depende de `explicai` >=0.3.0, que não está no npm (hoje 0.2.1). Os dois pacotes estão preparados (CHANGELOG, versão, metadados, CI), faltando só o ok da pessoa e os pré-requisitos.

## Critérios de aceite
- [ ] T-134 e T-137 fechados; entradas novas do `[Unreleased]` movidas para `[0.3.0]` e data ajustada.
- [ ] Segredo `NPM_TOKEN` criado no repo `explicai-mcp` (existe só no do Studio).
- [ ] `explicai@0.3.0` publicado pela tag `v0.3.0`; `npm view explicai version` = 0.3.0.
- [ ] Bloco "Core do Studio" removido do `ci.yml` do MCP (usa `npm install` normal) e CI verde.
- [ ] `explicai-mcp@0.1.0` publicado pela tag `v0.1.0`.
- [ ] Descrição do GitHub do `explicai-mcp` bilíngue e sem "em construção".

## Como verificar
Instalação limpa com `npm i explicai explicai-mcp` em pasta vazia: `explicai --version`, tools e prompts por stdio, criar manual e exportar.

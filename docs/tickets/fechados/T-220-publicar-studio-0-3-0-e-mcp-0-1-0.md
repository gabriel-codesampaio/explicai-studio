# T-220: Publicar Studio 0.3.0 e explicai-mcp 0.1.0

- Prioridade: P1
- Tamanho: M
- Status: fechado
- Agente: supervisor
- Origem: pedido da pessoa (2026-11-04)

Studio: 0.3.0 (2026-11-04) e 1.0.0 (2026-11-05) publicados. Resta só a parte do MCP, fora da fila do Studio por ora.

## Problema
O MCP depende de `explicai` >=0.3.0, que não está no npm (hoje 0.2.1). Os dois pacotes estão preparados (CHANGELOG, versão, metadados, CI), faltando só o ok da pessoa e os pré-requisitos.

## Critérios de aceite
- [x] T-134 e T-137 fechados; entradas novas do `[Unreleased]` movidas para `[0.3.0]` e data ajustada.
- [x] Segredo `NPM_TOKEN` criado no repo `explicai-mcp` (existe só no do Studio).
- [x] `explicai@0.3.0` publicado pela tag `v0.3.0`; `npm view explicai version` = 0.3.0.
- [x] Bloco "Core do Studio" removido do `ci.yml` do MCP (usa `npm install` normal) e CI verde.
- [x] `explicai-mcp@0.1.0` publicado pela tag `v0.1.0`.
- [ ] Descrição do GitHub do `explicai-mcp` bilíngue e sem "em construção".

## Como verificar
Instalação limpa com `npm i explicai explicai-mcp` em pasta vazia: `explicai --version`, tools e prompts por stdio, criar manual e exportar.

## Registro
2026-11-06: o `ci.yml` do MCP já usa `npm ci` normal (sem o bloco do Studio) e o lockfile passou a trazer `explicai` 1.0.0 do npm. Falta só o que exige a pessoa: criar o segredo `NPM_TOKEN` no repo `explicai-mcp`, a tag `v0.1.0` (ou a versão que sair do `[Unreleased]`), a publicação e a descrição bilíngue do GitHub. `explicai` 0.3.0 e 1.0.0 já estão no npm (T-134 e T-137 já fechados). Como o `[Unreleased]` do MCP ganhou `annotate_image` com `style`, `add_pages` com limites, `import_manual` e a checagem de faixa, a versão a publicar passa a ser 0.2.0: decidir com a pessoa.

2026-11-06 (atualização): `explicai-mcp@0.1.0` está no npm, tag `v0.1.0` criada e `NPM_TOKEN` existe no repo do MCP. Pendência só: (1) versão 0.2.0 do MCP (o `[Unreleased]` ganhou `annotate_image` com `style`, `add_pages` com limites, `import_manual`, checagem de faixa): a pessoa decide a publicação; (2) remover o topic `work-in-progress` do GitHub do `explicai-mcp` e conferir a descrição bilíngue: a pessoa decide.

2026-11-06: explicai-mcp 0.2.0 publicado no npm pela tag v0.2.0 (Release com provenance, GitHub Release criado), commit 61603a3. 0.1.0 saiu em 2026-11-04. Topic work-in-progress removido do repo. Tag v0.2.0 foi movida depois do PR de versao #16 (a primeira falhou na checagem tag = package.json).

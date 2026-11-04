# T-122: MCP fase 1, o agente cria e exporta um manual

- Prioridade: P1
- Tamanho: G
- Status: aberto
- Agente: frontend
- Origem: [Discovery do MCP, Revisão](../discovery/mcp.md) (2026-11-03)

## Problema
O agente de IA da pessoa não consegue gravar no formato do Explicaí: `explicai-mcp` está vazio.

## Decisões da pessoa (03/11/2026)
Autônomo e guiado só criam manual novo. O agente nunca marca `aprovado` nem `publicado`. Imagens vêm do workspace e da pasta onde o MCP abriu, mais `--allow-dir`. Diagrama entra como imagem ou lista de passos. Repo separado (`npx explicai-mcp <workspace>`). Nomes e descrições de tools em inglês; texto do manual no idioma dele; erros e prompts em português.

## Critérios de aceite
- [ ] Core: exporta `imageSize` e `ThemePatch`; novo `appendAnnotations(dir, asset, patch)` que atribui `id` e `n` e valida com `parseAnnotations`; `rev` (hash do arquivo) na leitura de página. Sem mudança de formato.
- [ ] MCP por stdio com as tools `list_manuals`, `get_manual`, `read_page`, `create_manual`, `add_page`, `update_page`, `add_image`, `annotate_image`, `export_manual`, como descritas no discovery.
- [ ] `--level read|draft|update` (padrão `draft`): tool fora do nível não é registrada. `draft` não edita página que passou de `rascunho`. Nenhum nível apaga nem aprova.
- [ ] `--manual <slug>` repetível: fora da lista, o manual não aparece e a escrita é recusada. `slug` com `..`, `/` ou `\` é recusado.
- [ ] Com o Studio fechado, o agente cria 3 páginas em árvore, uma imagem com 2 marcadores e 1 área clicável, exporta em HTML e Markdown, e o Studio abre sem erro nem perda.
- [ ] `update_page` com `rev` antigo não grava; com `rev` certo guarda a versão "Antes do agente" e grava. `status` aprovado ou publicado é recusado com mensagem que diz como resolver.
- [ ] `add_image` recusa caminho fora das pastas permitidas (inclusive por link simbólico), bytes que não batem com a extensão, SVG e arquivo acima de 10 MB. A mensagem não mostra caminho absoluto.
- [ ] `annotate_image` em `pixels` gera coordenadas 0 a 1 certas; hotspot para página inexistente é recusado.
- [ ] Resposta de `add_page` e `update_page` avisa quando o corpo parece conter chave ou token.
- [ ] Resources `explicai://format` e `explicai://writing-guide`; prompts `build_manual_autonomous` e `build_manual_guided`. O essencial também vai embutido nos prompts. O guiado manda parar e esperar aprovação antes de gravar.
- [ ] README em pt-BR com resumo em inglês: instalação, níveis e o limite de que `--level` e `--manual` não são barreira de segurança para agente com acesso próprio a arquivos.
- [ ] Publicação no npm fica de fora: precisa do ok da pessoa.

## Onde
`explicai-mcp/` (novo código), `explicai/src/core/`.

## Como verificar
`npm run check` nos dois repos. Teste de contrato que cria, anota e exporta um manual de exemplo. Fluxo guiado de ponta a ponta no MCP Inspector e no Claude Code. Cursor não entra: a pessoa não indicou cliente e a equipe não consegue rodá-lo.

Primeira tarefa: confirmar na versão escolhida do SDK as assinaturas de resources, prompts e `annotations`, e a versão mínima de Node.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

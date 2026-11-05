# T-122: MCP fase 1, o agente cria e exporta um manual

- Prioridade: P1
- Tamanho: G
- Status: feito
- Agente: frontend
- Origem: [Discovery do MCP, Revisão](../../discovery/archives/mcp.md) (2026-11-03)

## Problema
O agente de IA da pessoa não consegue gravar no formato do Explicaí: `explicai-mcp` está vazio.

## Decisões da pessoa (03/11/2026)
Autônomo e guiado só criam manual novo. O agente nunca marca `aprovado` nem `publicado`. Imagens vêm do workspace e da pasta onde o MCP abriu, mais `--allow-dir`. Diagrama entra como imagem ou lista de passos. Repo separado (`npx explicai-mcp <workspace>`). Nomes e descrições de tools em inglês; texto do manual no idioma dele; erros e prompts em português.

## Critérios de aceite
- [x] Core: exporta `imageSize` e `ThemePatch`; novo `appendAnnotations(dir, asset, patch)` que atribui `id` e `n` e valida com `parseAnnotations`; `rev` (hash do arquivo) na leitura de página. Sem mudança de formato.
- [x] MCP por stdio com as tools `list_manuals`, `get_manual`, `read_page`, `create_manual`, `add_page`, `update_page`, `add_image`, `annotate_image`, `export_manual`, como descritas no discovery.
- [x] `--level read|draft|update` (padrão `draft`): tool fora do nível não é registrada. `draft` não edita página que passou de `rascunho`. Nenhum nível apaga nem aprova.
- [x] `--manual <slug>` repetível: fora da lista, o manual não aparece e a escrita é recusada. `slug` com `..`, `/` ou `\` é recusado.
- [x] Com o Studio fechado, o agente cria 3 páginas em árvore, uma imagem com 2 marcadores e 1 área clicável, exporta em HTML e Markdown, e o Studio abre sem erro nem perda.
- [x] `update_page` com `rev` antigo não grava; com `rev` certo guarda a versão "Antes do agente" e grava. `status` aprovado ou publicado é recusado com mensagem que diz como resolver.
- [x] `add_image` recusa caminho fora das pastas permitidas (inclusive por link simbólico), bytes que não batem com a extensão, SVG e arquivo acima de 10 MB. A mensagem não mostra caminho absoluto.
- [x] `annotate_image` em `pixels` gera coordenadas 0 a 1 certas; hotspot para página inexistente é recusado.
- [x] Resposta de `add_page` e `update_page` avisa quando o corpo parece conter chave ou token.
- [x] Resources `explicai://format` e `explicai://writing-guide`; prompts `build_manual_autonomous` e `build_manual_guided`. O essencial também vai embutido nos prompts. O guiado manda parar e esperar aprovação antes de gravar.
- [x] README em pt-BR com resumo em inglês: instalação, níveis e o limite de que `--level` e `--manual` não são barreira de segurança para agente com acesso próprio a arquivos.
- [ ] Publicação no npm fica de fora: precisa do ok da pessoa.

## Onde
`explicai-mcp/` (novo código), `explicai/src/core/`.

## Como verificar
`npm run check` nos dois repos. Teste de contrato que cria, anota e exporta um manual de exemplo. Fluxo guiado de ponta a ponta no MCP Inspector e no Claude Code. Cursor não entra: a pessoa não indicou cliente e a equipe não consegue rodá-lo.

Primeira tarefa: confirmar na versão escolhida do SDK as assinaturas de resources, prompts e `annotations`, e a versão mínima de Node.

## Registro
Core (este PR): `imageSize` e `ThemePatch` exportados, `appendAnnotations(dir, asset, patch)`, `rev` (sha256 curto do arquivo) em `readPage`/`addPage`/`updatePage`, e `updatePage(..., { ifRev })`. Sem mudança de formato. Testes em `test/mcp-core.test.ts`.

Servidor (repo `explicai-mcp`, branch `feat/t-122-servidor`): SDK `@modelcontextprotocol/sdk@1.32.2` (v1 estável, MIT; v2 fica para depois) com `zod@^4`; Node >= 20.12; stdio. Nove tools por nível, 2 resources, 2 prompts, README. Testado por contrato (cliente em memória), por cliente stdio em script e no MCP Inspector (CLI).

Ficou de fora: `annotate_image` só acrescenta (sem `mode: replace`), `set_theme`, `set_logo`, `move_page`; npm; teste no Claude Code (a pessoa roda o fluxo guiado). Depois do merge e da versão nova do `explicai`: trocar o `peerDependencies.explicai` do MCP para a versão publicada e gerar o `package-lock.json` (hoje fora do git porque depende do core não publicado).

Correções da revisão: PRs explicai-studio #21 e explicai-mcp #2 e #3. `rev` conferido dentro da fila, `beforeWrite` para a versão "Antes do agente", caminho absoluto fora das mensagens, `annotate_image` respeita o nível `draft`, página aprovada editada volta a `revisao`. Fluxo guiado de ponta a ponta no Claude Code: feito no T-126. Cursor não testado. Publicação no npm fica para depois do T-124, com o ok da pessoa; o peer `explicai` precisa da versão com `beforeWrite`.

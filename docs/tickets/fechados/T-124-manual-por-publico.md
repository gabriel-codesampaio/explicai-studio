# T-124: Manual por público, um export para cada perfil

- Prioridade: P2
- Tamanho: G
- Status: feito
- Agente: frontend
- Origem: [Discovery do MCP, Revisão](../discovery/mcp.md) (2026-11-03)
- Depende de: T-122

## Problema
Um mesmo sistema tem admin, operador e cliente, e hoje cada perfil receberia o manual inteiro.

## Critérios de aceite
- [x] `writePageFile` preserva campos desconhecidos do frontmatter, com teste de ida e volta.
- [x] Formato: `audiences` opcional no `manual.json` e `audience` opcional na página. Sem o campo, a página vale para todos. Filho herda a restrição do pai. Manual antigo abre igual. `docs/manual-format.md` e `.claude/rules/manual-format.md` mudam juntos.
- [x] `exportManual(dir, formato, { audience })` gera só o que o perfil vê, em HTML, PDF e Markdown.
- [x] O export de um perfil não contém texto, imagem nem entrada de índice de página filtrada. O teste procura o texto e os arquivos da página filtrada no resultado.
- [x] Link ou hotspot para página filtrada vira texto simples e gera `warning`.
- [x] Studio: campo de público na página, filtro na prévia e escolha no diálogo de exportar. Interface em pt-BR e en.
- [x] MCP: `audience` em `add_page`, `update_page` e `export_manual`; os prompts perguntam os perfis.
- [x] A documentação diz que público não é controle de acesso: os arquivos-fonte guardam tudo.

## Onde
`src/core/pages.ts`, `src/core/export/`, `web/src/features/`, `explicai-mcp/`.

## Como verificar
`npm run check`, e2e do fluxo no Studio, e a busca do texto filtrado nos três formatos.

## Registro
Core, servidor HTTP e Studio no PR do core (branch `feat/t-124-publico`); servidor MCP em explicai-mcp (mesma branch).

Core: `Page.audience` e `Page.extra` (frontmatter preservado, teste de ida e volta), `ManualMeta.audiences` mantida por `registerAudiences`, `exportManual(dir, formato, { audience })` com filtro em `collectPages`, `stripHiddenLinks` (link em qualquer forma vira texto, com aviso) e hotspot removido. O export só copia as imagens usadas pelas páginas que entram (confirmado), então `assets/` não leva imagem de página filtrada. Teste procura texto, nome de arquivo e imagem filtrados em HTML, Markdown e no HTML impresso pelo PDF.
Studio: menu de público na página, "Ver como" na árvore, escolha de perfil no diálogo de exportar (pt-BR e en). MCP: `audience` em `add_page`, `add_pages`, `update_page`, `export_manual`; prompts perguntam os perfis; mudar o público de página aprovada a devolve para `revisao`.
Decisões: `audience: []` vale todos; valor inválido no arquivo vira erro de leitura (página some do export com aviso); perfil desconhecido exporta só as páginas sem restrição, com aviso. Público não é controle de acesso (dito no formato, no Studio e no README do MCP).
Ficou de fora: HTML e Markdown de perfis diferentes se sobrescrevem na mesma pasta (só o PDF leva o perfil no nome); menu de público sem trava contra dois cliques rápidos; e2e só em uma largura e tema.

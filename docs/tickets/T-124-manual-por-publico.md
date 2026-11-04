# T-124: Manual por público, um export para cada perfil

- Prioridade: P2
- Tamanho: G
- Status: aberto
- Agente: frontend
- Origem: [Discovery do MCP, Revisão](../discovery/mcp.md) (2026-11-03)
- Depende de: T-122

## Problema
Um mesmo sistema tem admin, operador e cliente, e hoje cada perfil receberia o manual inteiro.

## Critérios de aceite
- [ ] `writePageFile` preserva campos desconhecidos do frontmatter, com teste de ida e volta.
- [ ] Formato: `audiences` opcional no `manual.json` e `audience` opcional na página. Sem o campo, a página vale para todos. Filho herda a restrição do pai. Manual antigo abre igual. `docs/manual-format.md` e `.claude/rules/manual-format.md` mudam juntos.
- [ ] `exportManual(dir, formato, { audience })` gera só o que o perfil vê, em HTML, PDF e Markdown.
- [ ] O export de um perfil não contém texto, imagem nem entrada de índice de página filtrada. O teste procura o texto e os arquivos da página filtrada no resultado.
- [ ] Link ou hotspot para página filtrada vira texto simples e gera `warning`.
- [ ] Studio: campo de público na página, filtro na prévia e escolha no diálogo de exportar. Interface em pt-BR e en.
- [ ] MCP: `audience` em `add_page`, `update_page` e `export_manual`; os prompts perguntam os perfis.
- [ ] A documentação diz que público não é controle de acesso: os arquivos-fonte guardam tudo.

## Onde
`src/core/pages.ts`, `src/core/export/`, `web/src/features/`, `explicai-mcp/`.

## Como verificar
`npm run check`, e2e do fluxo no Studio, e a busca do texto filtrado nos três formatos.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

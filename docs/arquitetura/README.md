# Arquitetura do Explicaí Studio

O mapa está em [mapa.drawio](mapa.drawio), com quatro páginas. Abra em app.diagrams.net, na extensão do VS Code ou no draw.io Desktop.

1. Arquitetura: CLI, servidor, rotas, core e disco.
2. Web: layout, features, hooks e lib.
3. Export: do pedido ao HTML, PDF e Markdown.
4. Formato do manual e a relação com o MCP.

## Camadas

Um manual é uma pasta de arquivos. Só o core lê e grava essa pasta; servidor e web passam por ele.

| Camada | Onde | O que faz |
|---|---|---|
| CLI | [src/cli.ts](../../src/cli.ts) | Lê `--port`, `--no-open`, sobe o servidor e abre o navegador. |
| Servidor | [src/server](../../src/server) | HTTP local. [index.ts](../../src/server/index.ts) recusa pedido que não seja local ([security.ts](../../src/server/security.ts)), casa a rota ([router.ts](../../src/server/router.ts)) e traduz erro do core em status e página legível. |
| Rotas | [src/server/routes](../../src/server/routes) | Uma por assunto: manuals, pages, audiences, versions, export, fonts, assets e web (arquivos estáticos). A rota `/*` do editor fica por último. |
| Core | [src/core](../../src/core) | Regra de negócio. API pública em [index.ts](../../src/core/index.ts), publicada como `explicai/core`. |
| Web | [web/src](../../web/src) | React e Tiptap. Conversa com o servidor por [lib/api.ts](../../web/src/lib/api.ts). |

Regras de dependência: a web não importa o core, o core não importa o servidor, e a API HTTP é interna (pode mudar entre versões).

## Core

- Manual e páginas: [manuals.ts](../../src/core/manuals.ts), [pages.ts](../../src/core/pages.ts), [tree.ts](../../src/core/tree.ts), [frontmatter.ts](../../src/core/frontmatter.ts).
- Imagens e marcações: [assets.ts](../../src/core/assets.ts), [annotations.ts](../../src/core/annotations.ts), [redact.ts](../../src/core/redact.ts).
- Versões e lixeira: [versions.ts](../../src/core/versions.ts), [trash.ts](../../src/core/trash.ts).
- Públicos e checagem: [audience.ts](../../src/core/audience.ts), [check.ts](../../src/core/check.ts).
- Base: [fs.ts](../../src/core/fs.ts) (gravação atômica, caminho sempre dentro do manual), [errors.ts](../../src/core/errors.ts) (`ExplicaiError` com código estável), [types.ts](../../src/core/types.ts).

## Web

- [layout](../../web/src/layout): casca da tela (sidebar, navegação, página, barra de status).
- [features](../../web/src/features): editor, annotations, pages, manuals, versions, export, settings, help, errors.
- [hooks](../../web/src/hooks): estado do manual aberto, autosave, reconexão, foco por teclado.
- [lib](../../web/src/lib): funções puras e cliente da API, com textos em pt e en ([i18n.ts](../../web/src/lib/i18n.ts)).
- [styles/tokens.css](../../web/src/styles/tokens.css): cores e fontes da marca. Resumo em [marca-resumo.md](../marca-resumo.md).

## Export

[src/core/export](../../src/core/export). `exportManual` junta as páginas ([collect.ts](../../src/core/export/collect.ts)), confere imagens e links ([refs.ts](../../src/core/export/refs.ts)) e gera o formato pedido. Cada exportação substitui a anterior do mesmo formato e público, em `exportacao/` dentro do manual. O PDF imprime o HTML num Chrome, Edge ou Chromium local ([pdf.ts](../../src/core/export/pdf.ts)); HTML e Markdown não precisam de navegador. O resultado traz `warnings` com o que ficou de fora.

## Formato do manual

Pasta com `manual.json`, `pages/*.md`, `assets/`, `.versoes/`, `.lixeira/` e `exportacao/`. Campos, regras e política de compatibilidade: [manual-format.md](../manual-format.md). O teste [format-contract.test.ts](../../test/format-contract.test.ts) lê esse documento e confere que o código grava e aceita o que ele promete. Mudou o formato, mude o documento no mesmo commit.

## MCP

[explicai-mcp](https://github.com/gabriel-codesampaio/explicai-mcp) é outro repositório, com versão própria. Ele importa `explicai/core` para criar e manter manuais por um agente, sem passar pelo servidor. O que o semver do Studio cobre: formato em disco, exports do core, flags da CLI e nomes e schemas das tools e prompts do MCP.

## Outros documentos

- Uso: [primeiros-passos.md](../primeiros-passos.md) (en: [getting-started.md](../getting-started.md)) e [exemplo](../exemplo/README.md).
- Metas medidas: [desempenho.md](../desempenho.md).
- Publicar uma versão: [release.md](../release.md).
- Fila de trabalho: [tickets](../tickets/README.md). Estado atual: [passagem.md](../passagem.md).
- Decisões e pesquisas antigas: [discovery](../discovery).

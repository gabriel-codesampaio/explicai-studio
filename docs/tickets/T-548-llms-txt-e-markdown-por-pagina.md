# T-548: llms.txt e um Markdown por página junto do Markdown único

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: core (+ qa)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 9 (esforço P, risco B)

## Problema
O Markdown exportado é um arquivo só; para uma IA ler um manual de 80 páginas, cabe pouco por vez. Princípio 2 do produto ("um manual, dois leitores"). O GitBook publica `llms.txt`; o `llms-full.txt` e o `.md` por página vêm de review de terceiro e não estão confirmados.

## Escopo
- `exportacao/markdown/llms.txt` com título, resumo de uma linha por página e link para `paginas/<slug>.md`.
- Cada `.md` com a legenda das imagens em texto, como no arquivo único.
- Respeita o público. O arquivo único continua.
- Não mexe em PDF nem em HTML.

## Critérios de aceite
- [x] O export Markdown gera `llms.txt` e `paginas/<slug>.md`, além do arquivo único, que segue igual.
- [x] Links relativos batem com os arquivos; páginas da lixeira ficam de fora; respeita o público.
- [x] Legenda de imagem em texto em cada `.md`.
- [x] `docs/manual-format.md` (seção "Exportação") documenta a pasta.
- [x] Nome de arquivo de cada página sem sair da pasta de export (slug seguro), com teste.
- [x] Quem já lê a pasta não quebra (arquivo existente mantido).

## Onde
`src/core/export/markdown.ts`, `docs/manual-format.md`.

## Como verificar
Teste de exportação com o manual de exemplo; conferir os links com um leitor de Markdown.

## Registro
Feito em `feat/llms-txt-markdown-por-pagina`. `renderMarkdownPages` (novo, em `markdown.ts`) gera `llms.txt` e `paginas/<slug>.md`; `renderMarkdown` e `exportManual` mantêm a API, `manual.md` segue igual. Corpo da página compartilhado (`renderBody`) com links e imagens relativos a `paginas/`. Slug = `slugify(número + título)`, só `[a-z0-9-]`, com `-2`, `-3` na colisão. Teste: `test/export-markdown-pages.test.ts` (links, lixeira, público, legenda, traversal/colisão). Doc: seção Exportação. Fora: `llms-full.txt` (não confirmado).

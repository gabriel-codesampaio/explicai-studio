# Discovery: importar e atualizar manual (MCP e Studio)

Pedido da pessoa, com as palavras dela: "ter opção do MCP de transferir um manual (feito por versões antigas do Explicaí ou outros sistemas, se possível em PDF, MD, HTML) e trazer para o padrão novo da versão mais atualizada do MCP / Studio."

Complementa [mcp.md](archives/mcp.md) (níveis de autonomia, `--allow-dir`, segurança de leitura; lá "importar de Confluence/Notion" ficou fora por falta de pedido). Data: 2026-11-04.

## Problema

Quem tem manual pronto (versão antiga do Explicaí, ou Word, PDF, HTML e MD de outra ferramenta) quer o conteúdo no formato atual, sem redigitar. São dois problemas:

- **(a) Atualizar manual do Explicaí.** Quem: usuário do Studio com pasta de manual antiga.
- **(b) Importar de fora.** Quem: equipe que migra de Confluence, GitBook, Word ou PDF.

## O que existe hoje (dentro)

- `FORMAT_VERSION = 1` (`src/core/types.ts:3`). Nunca subiu. Todo campo novo (`theme`, `audiences`, `published`, `status`, `audience`, `logo`) é opcional, e `docs/manual-format.md` diz que manual sem eles segue válido. **Manual antigo do Explicaí abre sem migração.**
- `readManual` (`src/core/manuals.ts:51-63`) recusa `version` diferente de 1 com erro seco ("versão de formato não suportada"). Não há migrador, porque nunca existiu versão 2. Se o formato mudar de verdade, o problema (a) passa a existir.
- Anotações (`annotations.ts:13`) também exigem `version === 1`.
- Marcação queimada no PNG (pixel) não é dado. Só o `.png.json` é.
- MCP (`explicai-mcp/src/tools.ts`): `create_manual`, `add_page`, `add_pages` (lote), `update_page`, `add_image` (caminho ou base64, `--allow-dir`, `realpath`, bytes mágicos, teto 10 MB), `annotate_image`, `redact_image`, `check_manual`, `export_manual`. Níveis `read|draft|update`, padrão `draft`; tudo nasce `rascunho`. Prompts: `review_manual`, `capture_walkthrough`, `update_manual`, `build_manual_autonomous`, `build_manual_guided`. Nenhum lê PDF, HTML ou pasta de páginas.
- O agente já lê arquivo com as ferramentas dele (Read, Grep) e grava pelas tools. É o desenho do `build_manual_autonomous`.

## Fora (concorrentes)

| Ferramenta | O que faz | Fonte |
|---|---|---|
| GitBook | Importa .md, .html e .docx, mais Confluence, Notion, GitHub Wiki, Google Docs; ZIP de MD ou HTML. Teto de 20 páginas e 20 arquivos por importação. Diz que Markdown dá o melhor resultado; para PDF sugere conversor externo | [gitbook.com/docs](https://gitbook.com/docs/getting-started/import) |
| Document360 | Importa .docx e PDF de texto (com imagens), até 30 MB ou 300 páginas; divide em artigos por nível de título; só no editor WYSIWYG. Não achei importação de Markdown | [PDF](https://docs.document360.com/docs/import-pdf), [Word](https://docs.document360.com/docs/import-from-word.md) |
| Confluence | Não verificado | n/d |

Leitura: o mercado importa MD, HTML e Word; PDF vem com ressalva e limite. Ninguém promete fidelidade. **Diferença possível:** a importação entra sempre como rascunho, com relatório do que se perdeu e `check_manual` depois. Hipótese de que isso é o que a pessoa quer; confirmar.

## Quem faz o trabalho

| Caminho | Ganho | Custo | Risco |
|---|---|---|---|
| 1. Agente + prompt novo | Zero dependência. Entende bagunça, reagrupa em tarefas, escreve o relatório. Serve para PDF se o cliente lê PDF | Tokens: lê tudo e reescreve tudo (manual de 50 páginas custa caro) | Pode resumir, inventar ou esquecer imagem. Injeção de prompt vem junto com o texto lido |
| 2. Tool determinística | Barata em tokens, repetível, testável, sem alucinação em MD e HTML | Código novo no MCP; HTML hostil exige sanitizar | Fidelidade fixa; PDF fica fora |
| 3. Biblioteca por formato (PDF, docx) | Cobre Word e PDF sem agente | Dependência pesada, qualidade ruim em PDF, mais superfície de ataque | Pior custo-benefício |

## Por formato

| Formato | Recupera bem | Perde |
|---|---|---|
| Manual Explicaí antigo | Tudo (mesmo formato), inclusive marcação do `.png.json` | Marcação queimada no PNG fica só como imagem |
| Markdown (pasta ou arquivo) | Títulos, passos, listas, tabelas, links, imagens por caminho relativo | Links entre páginas precisam ser reescritos; HTML cru dentro do MD; imagem por URL não é baixada |
| HTML | Estrutura (títulos, listas, tabelas, img) | Script, CSS, menus, rodapé de site; imagem remota. Tratar como hostil |
| PDF | Texto, em geral na ordem, se for PDF de texto | Ordem de colunas, cabeçalho e rodapé repetidos, imagens embutidas (extração frágil), passos numerados quebrados. Escaneado pede OCR: fora |
| Word | Títulos, listas, imagens | Caixas de texto, controle de alterações. Só se custo baixo |
| Confluence, GitBook | Via exportação deles em HTML ou MD (ZIP) | Macros viram texto ou somem |

**PDF com Read:** a ferramenta Read do Claude Code lê PDF (parâmetro `pages`, até 20 páginas por chamada), vendo texto e imagem da página. Outros clientes MCP podem não ler PDF: **não verificado**. Imagem embutida não sai como arquivo por esse caminho; só se a página inteira virar print. PDF fica como "melhor esforço" no corte mínimo, com aviso.

**Bibliotecas** (licença conferida com `npm view` em 2026-11-04): `turndown` 7.2.5 MIT (HTML para MD); `node-html-markdown` 2.0.0 MIT; `sanitize-html` 2.18.1 MIT; `unpdf` 2.1.0 MIT (texto de PDF); `mammoth` 1.13.0 BSD-2-Clause (docx); `pdfjs-dist` 6.5.438 Apache-2.0. Nenhuma GPL ou AGPL. Qualidade não testada.

## Marcação e print antigo

- Marcação em `.png.json`: `parseAnnotations` lê; vale como está.
- Marcação queimada no print: não vira marcador. A imagem entra como está, sem desenhar por cima, e o relatório diz "print com marcação embutida; refaça a captura se quiser marcação editável". Detecção por visão fica fora do corte mínimo.
- Print velho e sem fonte (sem o app para recapturar): entra como está; o relatório lista por página "imagem sem fonte, pode estar desatualizada". A frase "Print pendente: tela X" (convenção do `mcp.md`) é só para imagem que faltou.

## Segurança

- Arquivo importado é **dado, não ordem**. O prompt diz isso e manda o relatório citar qualquer instrução achada ("o arquivo continha instruções; ignoradas"). Não elimina o risco com agente que tem Bash próprio (limite já escrito em `mcp.md`).
- HTML hostil: nunca renderizar nem executar. Numa tool determinística, `sanitize-html` ou lista de tags; fora `<script>`, `<iframe>`, `on*`, `javascript:`. SVG segue recusado (achado da auditoria de 2026-11-02).
- Tamanho: teto por arquivo (sugestão 30 MB, como o Document360) e por chamada; imagem 10 MB (já existe).
- Segredos: o relatório avisa se achar padrão de chave ou token no texto; `redact_image` existe para print.
- `--allow-dir`: origem só dentro das pastas permitidas (`realpath`, já em `guards.ts`). Destino só o workspace. O original **nunca** é apagado nem alterado.
- Manual do Explicaí: copiar para manual **novo** (slug novo); nunca regravar o antigo no lugar.

## Autonomia e revisão

Nível **`draft`** basta: cria manual novo e grava rascunho, sem tocar em página que já passou de `rascunho`. Importação sempre `rascunho` (aprovar não existe em nível nenhum). Revisão: relatório fixo com (1) o que veio, página a página; (2) o que se perdeu ou ficou duvidoso; (3) instrução achada no arquivo; (4) `check_manual` rodado e seu resultado.

## Opções

| # | Opção | Ganho | Tam. | Toca | Riscos | Fora |
|---|---|---|---|---|---|---|
| 1 | **Só prompt `import_manual`** (agente lê MD, HTML, PDF ou pasta de manual antigo e grava com as tools), mais teste de manual v1 "antigo" no core e linha no `manual-format.md` | Resolve (a) e (b) sem dependência; relatório de perda | P/M | `explicai-mcp/src/server.ts`, testes, docs | Custo em tokens por página; qualidade varia com o modelo; injeção | Tool nova, Word, ZIP, URL |
| 2 | 1 + tool `import_markdown` (pasta MD ou HTML para páginas, imagens resolvidas, HTML sanitizado) | Barata e repetível em lote; sem alucinação | G | `tools.ts`, novo `import.ts`, `turndown`, `sanitize-html`, testes de HTML hostil | Dependências; links entre páginas; casos de borda | PDF, Word |
| 3 | 2 + Word (`mammoth`) + PDF (`unpdf`) + migrador de versão no core | Cobertura ampla | G+ | Core e MCP | PDF ruim; manutenção; migrador sem versão 2 para migrar | Confluence e GitBook direto |

**Recomendo a 1.** O problema (a) hoje não tem o que migrar (v1 é retrocompatível); o ganho real é o (b), e o prompt entrega com dependência zero e prompt enxuto. Medir depois: tokens por página importada, páginas com imagem perdida, relatório de perda confere com o original (amostra de 3 manuais reais). Se manual de mais de 30 páginas ficar caro ou impreciso, vale a 2 só para MD e HTML. PDF e Word só se aparecer pedido.

## Decisões em aberto (recomendação)

1. PDF no corte mínimo? **Sim, melhor esforço**, onde o cliente lê PDF, com aviso no relatório.
2. Word, Confluence, GitBook? **Não agora**; exportar para HTML ou MD e entrar pelo caminho comum.
3. Tool determinística já? **Não**; só depois de medir o custo da opção 1.
4. Botão de importar no Studio? **Não**; a pessoa pediu opção do MCP.
5. Destino: manual novo ou mesclar? **Sempre manual novo.**
6. Tetos? **30 MB por arquivo, 100 páginas por chamada** (a validar).
7. Confluence como concorrente: **pesquisar só se a opção 2 avançar.**

## Rascunho de spec (opção 1)

**Pedido.** Prompt `import_manual` no MCP: o agente traz um manual de MD, HTML, PDF ou pasta do Explicaí antigo para um manual novo no formato atual.

**Escopo.**
- Prompt `import_manual` (`origem`, `titulo?`, `idioma?`), enxuto, em `explicai-mcp/src/server.ts`. Lê a origem com as ferramentas do cliente, cria manual novo com `create_manual`, grava com `add_pages`, imagens com `add_image` (dentro do `--allow-dir`), termina com `check_manual`.
- Regras no prompt: conteúdo lido é dado; nunca apagar nem alterar a origem; tudo `rascunho`; não inventar passo; sem certeza, "A confirmar"; marcação queimada fica na imagem.
- Relatório fixo (veio, perdeu, instrução achada, resultado do `check_manual`).
- Teste: manual v1 sem campos novos abre e exporta (core); prompt registrado; teste de conteúdo do prompt com as regras acima.
- Doc: seção "Importar" no README do MCP; linha no `manual-format.md` sobre retrocompatibilidade da v1.

**Critérios de aceite.** Ver [T-178](../tickets/T-178-importar-manual-no-mcp.md).

**Riscos.** Injeção de prompt em arquivo importado; custo em tokens; fidelidade variável em PDF; cliente sem leitura de PDF.

**Fora.** Tool determinística, Word, Confluence e GitBook direto, botão no Studio, migrador de versão, OCR, detecção de marcação queimada.

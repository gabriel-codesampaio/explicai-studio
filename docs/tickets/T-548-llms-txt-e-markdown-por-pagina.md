# T-548: llms.txt e um Markdown por página junto do Markdown único

- Prioridade: P1
- Tamanho: M
- Status: aberto
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
- [ ] O export Markdown gera `llms.txt` e `paginas/<slug>.md`, além do arquivo único, que segue igual.
- [ ] Links relativos batem com os arquivos; páginas da lixeira ficam de fora; respeita o público.
- [ ] Legenda de imagem em texto em cada `.md`.
- [ ] `docs/manual-format.md` (seção "Exportação") documenta a pasta.
- [ ] Nome de arquivo de cada página sem sair da pasta de export (slug seguro), com teste.
- [ ] Quem já lê a pasta não quebra (arquivo existente mantido).

## Onde
`src/core/export/markdown.ts`, `docs/manual-format.md`.

## Como verificar
Teste de exportação com o manual de exemplo; conferir os links com um leitor de Markdown.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

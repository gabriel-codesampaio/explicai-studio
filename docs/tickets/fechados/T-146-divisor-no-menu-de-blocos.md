# T-146: Componente divisor (linha divisória)

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
Falta um divisor no menu de blocos e no menu `/`.

## Critérios de aceite
- [x] Item "Divisor" nos dois menus, grupo e palavras-chave pt/en; arquivo salva `---`.
- [x] Sai como `<hr>` no HTML e no PDF e como `---` no Markdown; ida e volta sem perda; estilo do export e do Studio com os tokens da marca.
- [x] e2e curto.

## Registro
Item Divisor no menu de blocos e no menu / (grupo estrutura; fora do seletor de tipo, que só lista tipos de texto). Arquivo guarda `---`; HTML e PDF mostram `<hr>` com o estilo da marca (`.page-body hr`), Markdown exportado mantém `---`. Testes: ida e volta, export, ordem do menu e e2e. Visual no navegador não conferido.

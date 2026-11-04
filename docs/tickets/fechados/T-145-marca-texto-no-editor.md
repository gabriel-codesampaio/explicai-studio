# T-145: Marca-texto (caneta marcadora) no editor

- Prioridade: P2
- Tamanho: G
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
A pessoa quer destacar trecho de texto como com caneta marca-texto amarela (visual de 9.png).

## Decisão
Botão na barra do editor e atalho; formato no arquivo `==texto==` (Markdown legível fora do Studio). No HTML e no PDF vira `<mark>` com o amarelo da marca-texto (mesmo token do destaque do export, contraste do texto >= 4,5:1); no Markdown exportado fica `==texto==`.

## Critérios de aceite
- [x] Ida e volta do Markdown sem perda (`web/test/markdown.test.ts`); manual antigo igual.
- [x] HTML e PDF mostram o realce; impressão preserva a cor (`print-color-adjust`).
- [x] Botão com nome acessível e estado ativo; pt/en; e2e.

## Registro
Marca `==texto==` com Mark próprio (sem dependência nova): botão nas barras fixa e da seleção, atalho Ctrl+Shift+H, ida e volta do Markdown coberta (negrito, itálico, link, cor; `a == b`, `x===y` e código não viram marca). Export: `<mark>` com o amarelo do tema, `print-color-adjust`, Markdown exportado mantém `==`. Contraste do texto sobre o amarelo 13,9:1; laranja e verde ficaram abaixo de 4,5 sobre o amarelo e o export usa tons mais escuros dentro do `<mark>`. Fora/riscos: regex do `==` duplicada entre web e core; marca só em uma linha; PDF real, visual no navegador e atalho no e2e não conferidos; tema escuro do export só pelo contraste do tema.

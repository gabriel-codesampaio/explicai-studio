# T-034: Bloco de aviso (Dica, Atenção, Erro, Nota)

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: [Discovery de cor na seleção](../../discovery/archives/2026-10-30-cor-na-selecao.md) (2026-10-30)

## Problema
A spec v1 promete o bloco de aviso e ele não existe. Quem escreve não tem como chamar a atenção do leitor para uma dica ou um risco.

## Critérios de aceite
- [x] Nó `callout` com os tipos tip, warning, caution e note, salvo como alerta GFM (`> [!TIP]` etc.).
- [x] Entra pelo `/` e pelo seletor de bloco; também dentro de um passo, sem confundir com o "Resultado:".
- [x] Salvar e reabrir deixa o aviso igual (teste em `web/test/markdown.test.ts`); o "Resultado:" existente não muda.
- [x] Cor fixa por tipo, testada no claro e no escuro; a Nota usa a cor de destaque do manual. Rótulo em texto além da cor.
- [x] HTML e PDF mostram rótulo e texto com contraste AA. HTML colado continua escapado. Manual antigo exporta igual.
- [x] `docs/manual-format.md` atualizado.

## Onde
`web/src/features/editor/extensions.ts`, menu `/`, `BlockTypeMenu`, `src/core/export/html.ts` (renderer de `blockquote`), `docs/manual-format.md`.

## Como verificar
Testes de ida e volta do Markdown e do HTML exportado; conferir no navegador nos dois temas.

## Registro
Commit principal: 6144b88. Nó `callout` em `web/src/features/editor/callout.ts` (tokenizer próprio, `> [!TIP]` etc.), painel com ícone e seletor de tipo no próprio bloco (`CalloutView.tsx`), 4 itens no `/` e no seletor de bloco (`Alerta: Dica`, `Atenção`, `Erro`, `Nota`), tokens `--aviso-*` em `tokens.css`, renderer de `blockquote` no `html.ts` (`export/callout.ts`) e `docs/manual-format.md`. Testes: `web/test/markdown.test.ts` (ida e volta, dentro de passo, tipo desconhecido), `web/test/blocks.test.ts`, `test/export.test.ts` (HTML, idiomas, escape, contraste) e e2e "alerta". Contraste medido no navegador: rótulo 4,9 a 5,7 no claro, 5,7 a 7,9 no escuro, texto acima de 12. Conferido em 1280 e 375 px.
Fora do escopo: ícone no HTML exportado (só rótulo e cor); marcador `[!IMPORTANT]`; o `explicai-mcp` não foi verificado.

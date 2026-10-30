# T-034: Bloco de aviso (Dica, Atenção, Erro, Nota)

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [Discovery de cor na seleção](../discovery/archives/2026-10-30-cor-na-selecao.md) (2026-10-30)

## Problema
A spec v1 promete o bloco de aviso e ele não existe. Quem escreve não tem como chamar a atenção do leitor para uma dica ou um risco.

## Critérios de aceite
- [ ] Nó `callout` com os tipos tip, warning, caution e note, salvo como alerta GFM (`> [!TIP]` etc.).
- [ ] Entra pelo `/` e pelo seletor de bloco; também dentro de um passo, sem confundir com o "Resultado:".
- [ ] Salvar e reabrir deixa o aviso igual (teste em `web/test/markdown.test.ts`); o "Resultado:" existente não muda.
- [ ] Cor fixa por tipo, testada no claro e no escuro; a Nota usa a cor de destaque do manual. Rótulo em texto além da cor.
- [ ] HTML e PDF mostram rótulo e texto com contraste AA. HTML colado continua escapado. Manual antigo exporta igual.
- [ ] `docs/manual-format.md` atualizado.

## Onde
`web/src/features/editor/extensions.ts`, menu `/`, `BlockTypeMenu`, `src/core/export/html.ts` (renderer de `blockquote`), `docs/manual-format.md`.

## Como verificar
Testes de ida e volta do Markdown e do HTML exportado; conferir no navegador nos dois temas.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

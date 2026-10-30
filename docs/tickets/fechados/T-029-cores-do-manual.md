# T-029: Deixar a pessoa escolher as cores do manual exportado

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: [Discovery de customização](../discovery/2026-10-30-customizacao-marca.md) (2026-10-30)

## Problema
O manual exportado sai com as cores do Explicaí: texto azul-marinho (`--tinta`), amarelo na capa, no "Resultado:" e nos destaques (`--marca`), cobalto nas anotações (`--anotacao`). Só a cor de destaque muda, e só entre 4 opções. Quem entrega o manual a um cliente quer as cores do cliente.

## Critérios de aceite
- [x] `theme` aceita `text`, `headings` (uma cor por nível de título: capa, título da página e cada nível do editor), `highlight` e `accent` em hex livre.
- [x] Sem cor escolhida, os títulos saem pretos; o resto sai como hoje. Manual antigo sem `theme` exporta igual.
- [x] `highlight` substitui o amarelo na capa, no "Resultado:" e no destaque das imagens; `--anotacao` segue o `accent`; `--grafite` deriva do texto.
- [x] Texto, títulos e destaque com contraste menor que 4,5:1 com o branco são recusados no core (o MCP também grava), com o contraste atual e o mínimo na mensagem.
- [x] Mudar um campo não apaga os outros (hoje `setManualTheme` sem `accent` apaga o `theme` inteiro).
- [x] ExportDialog com os campos de cor, os 4 atalhos atuais e textos em pt e en.
- [x] O Markdown exportado não muda. `docs/manual-format.md` atualizado, sem `FORMAT_VERSION` novo.

## Onde
`src/core/types.ts`, `src/core/export/index.ts` (`setManualTheme`), `src/core/export/html.ts` (CSS em `:root`), `src/server/routes/export.ts`, `web/src/features/export/ExportDialog.tsx`, `web/src/lib/i18n.en.ts`, `docs/manual-format.md`.

## Como verificar
Testes em `test/` para validação e mescla do `theme`; exportar um manual com cores próprias e conferir HTML e PDF.

## Registro
Commit 230d294. Tema com text, headings (capa, página, h1 a h3), highlight e accent; mergeTheme recusa contraste < 4,5:1 com o branco (e realce que tira a leitura do texto) e mantém os outros campos; setManualTheme virou mudança parcial (null apaga o campo). ExportDialog com campos de cor e os 4 atalhos, em pt e en. Verificado: npm run check verde, testes em test/theme.test.ts e export.test.ts, diálogo no Chrome (recusa de #999999, salvar texto, título 1 e destaque). Fora: conferir o PDF impresso e o tema escuro do diálogo; o erro do core vem em português mesmo com a interface em inglês; o MCP (explicai-mcp) não foi alterado.

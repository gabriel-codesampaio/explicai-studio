# T-566: Cor única dos títulos, "Ajustar por nível" e padrão nanquim

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: [discovery aparência do manual 2026-11-05 (F2, F3; decisões 2 e 3)](../discovery/2026-11-05-aparencia-do-manual.md)

## Problema
A modal Aparência tem cinco campos de cor de título com o mesmo peso visual das duas cores principais. Quem quer só "a cor do cliente" vê nove linhas iguais (F2). O padrão dos títulos é `#000000` (`web/src/features/settings/ThemeFields.tsx:14`), fora da paleta nanquim `#151a33`, e já era B4 do relatório de 1.0.0 (F3). Mudar o padrão muda o export de manuais que nunca escolheram cor de título.

## Critérios de aceite
- [x] Campo "Cor dos títulos" grava as cinco posições de título de uma vez no `theme` do `manual.json`.
- [x] "Ajustar por nível" fica fechado por padrão e mostra os cinco campos; abre já aberto quando os níveis têm cores diferentes.
- [x] Padrão dos títulos é `#151a33` na interface e no export (sai `#000000`); o "Padrão" de cada campo volta para `#151a33`.
- [x] Manual sem cor de título exporta com `#151a33` no HTML e no PDF.
- [x] `CHANGELOG.md` na seção Unreleased (pt, com resumo em en) diz que o padrão dos títulos passou de preto para nanquim.
- [x] Os cinco níveis mantêm rótulo acessível ao abrir "Ajustar por nível" (`Título 1` a `Título 3` etc.).
- [x] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Onde
`web/src/features/settings/ThemeFields.tsx` (DEFAULTS, linha 14; cabeçalho dos títulos); `web/src/features/settings/ManualAppearanceDialog.tsx`; conferir se o export tem o mesmo padrão em `src/core` (grep `#000000`); `CHANGELOG.md`.

## Como verificar
Teste de unidade da regra: cor única grava os cinco níveis; "Ajustar por nível" abre aberto quando os níveis diferem; padrão é `#151a33`. E2e que acham os títulos por rótulo (`e2e/studio.e2e.ts:516` e `:1096`, `studio.lote6.e2e.ts`, `studio.menus-axe.e2e.ts`) passam com os rótulos novos (qa). Conferir o export HTML de um manual sem `theme`.

## Registro
Feito em `feat/ui-aparencia` (fb04ec3). Campo "Cor dos títulos" grava os cinco níveis; "Ajustar por nível" fechado, abre aberto se os níveis diferem (`commonHeading`/`headingsDiffer`, teste em `themeFields.test.ts`). Padrão `#151a33` na interface, na amostra e em `htmlCss.ts` (HTML e PDF); `theme.test.ts` atualizado; linha no CHANGELOG (pt + en).

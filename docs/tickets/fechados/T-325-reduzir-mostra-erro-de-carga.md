# T-325: Mostrar o erro quando o Reduzir imagem não carrega

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: diagnóstico do T-129, 2026-11-04

## Problema
`ReducePanel` engole o erro de `loadImage` com `.catch(() => {})`. Se a imagem não carrega, o painel some sem aviso, e a falha do e2e `studio.reduzir.e2e.ts:78` sob carga fica sem causa visível.

## Critérios de aceite
- [x] Erro de carga mostra mensagem com o motivo e a ação ("Tentar de novo").
- [x] Teste de unidade do caminho de erro.

## Registro
Commit: fix(studio): mostrar erro de carga no Reduzir imagem (T-325).
Feito: `readImage` em ReducePanel separa as duas falhas. `fetch` sem `ok` diz "O servidor não entregou o arquivo."; `loadImage` rejeitado diz "O navegador não conseguiu abrir o arquivo.". Painel de erro com `role="alert"` e botão "Tentar de novo" (recarrega pelo `rev`, alvo de 44 px no toque, mesmo padrão do ExportDialog). Textos em pt e en (i18n.en.ts).
Testes: `web/test/reducePanel.test.tsx` (4 casos: motivo do servidor, motivo do navegador, Tentar de novo carrega, Tentar de novo que falha de novo). Vitest 11/11 nos arquivos da área (reducePanel, i18n, reduceImage).
Fora: `.catch(() => {})` em AnnotationEditor.tsx:77 não mexido (fora do ticket). E2E `studio.reduzir.e2e.ts:78` não rodado aqui (é do qa). Conferência visual no navegador não feita.

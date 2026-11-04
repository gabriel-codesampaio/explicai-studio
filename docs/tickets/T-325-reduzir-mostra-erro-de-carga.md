# T-325: Mostrar o erro quando o Reduzir imagem não carrega

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: diagnóstico do T-129, 2026-11-04

## Problema
`ReducePanel` engole o erro de `loadImage` com `.catch(() => {})`. Se a imagem não carrega, o painel some sem aviso, e a falha do e2e `studio.reduzir.e2e.ts:78` sob carga fica sem causa visível.

## Critérios de aceite
- [ ] Erro de carga mostra mensagem com o motivo e a ação ("Tentar de novo").
- [ ] Teste de unidade do caminho de erro.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

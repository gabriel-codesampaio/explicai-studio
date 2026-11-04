# T-262: Mostrar erro do sync ao voltar o foco, além do offline

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: relatório do supervisor do marco 0.4, 2026-11-04 (achado do T-153)

## Problema
O catch da sincronização ao voltar o foco (useOnFocus/syncRef em useStudio) engole qualquer erro que não seja offline. Ex.: página apagada por fora some sem aviso.

## Critérios de aceite
- [x] Página aberta apagada por fora: aviso claro e volta para a árvore, sem perder texto não gravado (oferece copiar ou recriar).
- [x] Outros erros viram toast com o motivo; offline segue silencioso.
- [x] Teste de unidade para os três casos.

## Registro
- Commit: 32086e9
- Feito: sync ao foco compara a árvore rebuscada; página aberta sumida (ou 404) limpa a fila, volta à árvore e mostra aviso fixo com ação "Copiar meu texto". Outros erros viram toast (id fixo, sem empilhar); offline segue silencioso. 3 testes em web/test/useStudio.test.tsx.
- Fora: recriar a página com o texto (só copiar); conferência manual no navegador.

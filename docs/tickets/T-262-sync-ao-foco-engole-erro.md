# T-262: Mostrar erro do sync ao voltar o foco, além do offline

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório do supervisor do marco 0.4, 2026-11-04 (achado do T-153)

## Problema
O catch da sincronização ao voltar o foco (useOnFocus/syncRef em useStudio) engole qualquer erro que não seja offline. Ex.: página apagada por fora some sem aviso.

## Critérios de aceite
- [ ] Página aberta apagada por fora: aviso claro e volta para a árvore, sem perder texto não gravado (oferece copiar ou recriar).
- [ ] Outros erros viram toast com o motivo; offline segue silencioso.
- [ ] Teste de unidade para os três casos.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

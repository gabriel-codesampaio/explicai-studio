# T-264: Verificar se o editor preserva campo desconhecido das anotações

- Prioridade: P1
- Tamanho: P
- Status: aberto
- Agente: frontend
- Marco: 0.5
- Origem: relatório do supervisor do marco 0.4, 2026-11-04 (achado do T-200)

## Problema
O T-200 corrigiu o core, mas o editor em `web/src` pode remontar o JSON de anotações e perder campo desconhecido ao salvar. Não verificado. Isso quebraria a promessa de compatibilidade da 1.0.

## Critérios de aceite
- [ ] Teste: abrir, editar uma marcação e salvar pelo Studio mantém campo desconhecido na raiz e em cada tipo de item.
- [ ] Se perder, corrigir no caminho único de gravação.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

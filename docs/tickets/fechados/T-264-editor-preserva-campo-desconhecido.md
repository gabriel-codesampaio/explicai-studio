# T-264: Verificar se o editor preserva campo desconhecido das anotações

- Prioridade: P1
- Tamanho: P
- Status: fechado
- Agente: frontend
- Marco: 0.5
- Origem: relatório do supervisor do marco 0.4, 2026-11-04 (achado do T-200)

## Problema
O T-200 corrigiu o core, mas o editor em `web/src` pode remontar o JSON de anotações e perder campo desconhecido ao salvar. Não verificado. Isso quebraria a promessa de compatibilidade da 1.0.

## Critérios de aceite
- [x] Teste: abrir, editar uma marcação e salvar pelo Studio mantém campo desconhecido na raiz e em cada tipo de item.
- [x] Se perder, corrigir no caminho único de gravação.

## Registro
- Commit: feat/t-264-preservar-campo-anotacoes (test(editor)).
- Feito: verificado, o editor não perde campo desconhecido. Todas as operações do cliente (mover, redimensionar, renomear, destino, adicionar, remover, recortar, tamanho, aparência) usam spread; o cache guarda a resposta do servidor, que já preserva (T-200). Teste `web/test/annotationUnknownFields.test.ts` cobre raiz e os quatro tipos de item. Nenhuma correção de código necessária.
- Fora: campo desconhecido dentro de `style` (já listado no T-200).

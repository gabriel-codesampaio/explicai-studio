# T-144: Remover uma versão da página

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
O diálogo "Versões desta página" não deixa remover versão.

## Decisão
Remover pede confirmação (apagar não volta). A versão marcada como "Usar no manual" não pode ser removida: o botão fica desligado com a dica "Escolha outra versão antes". A versão atual da página também não.

## Critérios de aceite
- [x] Rota/função no núcleo com teste; recusa para a versão marcada e para a única.
- [x] Confirmação na tela, pt/en, foco e teclado; lista atualiza.
- [x] e2e: remover e cancelar.

## Registro
Remover versão guardada: `deleteVersion` no núcleo, rota DELETE (409 para a marcada em "Usar no manual", 404 inexistente), confirmação na própria linha ("Apagar não tem volta.", foco em Cancelar), botão da marcada desligado com a dica "Escolha outra versão antes". Decisão ajustada ao modelo: a página atual não é uma versão guardada (`.versoes/<id>/<data>.md` são cópias), então não há regra de 'versão atual' nem de 'única'; a única recusa é a marcada. Fora: alvo de toque de 44 px só pelo padrão do projeto, não medido; mensagem do 409 não traduzida para en (o botão já vem desligado).

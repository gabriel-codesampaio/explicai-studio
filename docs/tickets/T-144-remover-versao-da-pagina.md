# T-144: Remover uma versão da página

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
O diálogo "Versões desta página" não deixa remover versão.

## Decisão
Remover pede confirmação (apagar não volta). A versão marcada como "Usar no manual" não pode ser removida: o botão fica desligado com a dica "Escolha outra versão antes". A versão atual da página também não.

## Critérios de aceite
- [ ] Rota/função no núcleo com teste; recusa para a versão marcada e para a única.
- [ ] Confirmação na tela, pt/en, foco e teclado; lista atualiza.
- [ ] e2e: remover e cancelar.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

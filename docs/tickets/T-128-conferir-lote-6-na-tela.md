# T-128: Conferir na tela o que o lote 6 não viu

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: lote 6 (2026-11-03)

## Problema
A dica da página vazia (T-018) só foi vista a 1280 no tema claro, sem audit. O corretor (T-036) só foi conferido pelo atributo no Chrome headless.

## Critérios de aceite
- [ ] Dica da página vazia em 375 e 1280, claro e escuro, pt e en, com `/impeccable audit`.
- [ ] Corretor no Edge: sublinhado e "Adicionar ao dicionário" aparecem. Se o headless não mostrar, testar com navegador visível.

## Como verificar
Script Playwright com prints só das telas em questão.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

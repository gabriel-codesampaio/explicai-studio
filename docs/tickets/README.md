# Tickets

Fila de trabalho do Studio. Formato e ciclo de vida: skill `tickets` do plugin [explicai-workflow](https://github.com/gabriel-codesampaio/explicai-workflow).

Prioridade: **P0** atinge quem lê o resultado final; **P1** é o pedido principal (tirar a cara de IA); **P2** incomoda, há como contornar; **P3** acabamento.

Ticket fechado (feito ou descartado) vai para `fechados/` com `git mv`.

## Fila

A lista não fica neste arquivo (PRs paralelos conflitavam nela). Os arquivos são a fonte:

```
npm run tickets             # abertos, por prioridade e ID
npm run tickets -- fechados # fechados, do mais recente ao mais antigo
```

Abrir, mudar status ou fechar um ticket mexe só no arquivo dele; não edite este README.

Bug (comportamento errado, perda de dado, falha de segurança, erro visível) é corrigido agora, por prioridade. Sugestão (melhoria, acabamento, refatoração) espera até a pessoa pedir.

# T-150: Prova do MCP em app de terceiro, com banco local

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: supervisor
- Origem: sobra do T-125 (2026-11-04)

## Problema
O T-125 acabou no CodeLab porque o banco do app de terceiro recusou a credencial local. Falta provar o MCP num sistema de negócio de outra pessoa e comparar o resultado com um manual escrito à mão.

## Critérios de aceite
- [ ] App sobe com Postgres local descartável, sem tocar no banco nem no repositório de terceiros.
- [ ] Manual com dois perfis, gravado só pelas tools do MCP e fora do repositório do app.
- [ ] Comparação com o manual escrito à mão e custo em tokens no relatório. Defeito do MCP vira ticket.

## Como verificar
Abrir o manual no Studio com a pessoa.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

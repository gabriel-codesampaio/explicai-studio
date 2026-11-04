# T-402: MCP add_pages avisa segredo, devolve parcial e limita tamanho

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: supervisor
- Escopo: MCP (fora da fila do Studio por ora)
- Origem: sobra do T-130, relatório do lote de código 2, 2026-11-04

## Critérios de aceite
- [ ] `add_pages` avisa segredo no título, como `add_page` avisa no corpo.
- [ ] `add_pages` que falha no meio devolve os títulos com os ids já criados.
- [ ] `add_pages` tem limite total de profundidade e de tamanho.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

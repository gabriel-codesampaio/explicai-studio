# T-402: MCP add_pages avisa segredo, devolve parcial e limita tamanho

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: supervisor
- Escopo: MCP (fora da fila do Studio por ora)
- Origem: sobra do T-130, relatório do lote de código 2, 2026-11-04

## Critérios de aceite
- [x] `add_pages` avisa segredo no título, como `add_page` avisa no corpo.
- [x] `add_pages` que falha no meio devolve os títulos com os ids já criados.
- [x] `add_pages` tem limite total de profundidade e de tamanho.

## Registro
explicai-mcp, PR de `feat/mcp-fechar-lote` (debc467): `add_pages` avisa segredo também no título; recusa antes de gravar árvore com mais de 100 páginas, 5 níveis ou 400 mil caracteres no total; se falhar no meio, o erro lista as páginas já criadas com os ids. Teste de contrato para aviso e limites. Fora: teste do erro parcial (sem como forçar falha no meio com o core real).

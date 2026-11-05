# T-197: MCP `annotate_image` e `get_manual` com `style` por item

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: supervisor
- Origem: discovery [personalizar-marcacoes](../discovery/archives/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 8

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Depende do T-193.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [ ] Cada item aceita `style` com enum fechado; `get_manual` devolve; regravar sem `style` não apaga o existente.
- [ ] Teste de contrato no `explicai-mcp`; versão do core atualizada; sem instrução nova no prompt.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

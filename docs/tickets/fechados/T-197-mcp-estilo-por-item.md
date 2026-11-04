# T-197: MCP `annotate_image` e `get_manual` com `style` por item

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: supervisor
- Origem: discovery [personalizar-marcacoes](../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 8

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Depende do T-193.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [x] Cada item aceita `style` com enum fechado; `get_manual` devolve; regravar sem `style` não apaga o existente.
- [x] Teste de contrato no `explicai-mcp`; versão do core atualizada; sem instrução nova no prompt.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
Branch `feat/t-197-mcp-estilo-por-item` nos dois repos. Core `5a356a8`: `AnnotationsPatch` aceita `style` por item (validado por `parseAnnotations`), tipos do estilo exportados de `explicai/core`, versão 0.4.0. MCP `3a05a12`: `annotate_image` aceita `style` com enum fechado por tipo (destaque com paleta de marca-texto e `fill`); `read_page` devolve o `style` (o `get_manual` não lista anotações); regravar sem `style` preserva; teste de contrato; `peerDependencies` explicai >=0.4.0; sem instrução nova no prompt. Fora: medida Playwright (sem mudança visual neste item), publicação npm.

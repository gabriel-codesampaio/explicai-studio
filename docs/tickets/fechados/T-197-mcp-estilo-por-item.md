# T-197: MCP `annotate_image` e `get_manual` com `style` por item

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: supervisor
- Origem: discovery [personalizar-marcacoes](../discovery/archives/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 8

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Depende do T-193.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [x] Cada item aceita `style` com enum fechado; `get_manual` devolve; regravar sem `style` não apaga o existente.
- [x] Teste de contrato no `explicai-mcp`; versão do core atualizada; sem instrução nova no prompt.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
explicai-mcp, PR de `feat/mcp-fechar-lote` (a8c546a): `annotate_image` aceita `style` com enum fechado por tipo (destaque com paleta de marca-texto e `fill`); `read_page` devolve o `style` (o `get_manual` não lista anotações); regravar sem `style` preserva; teste de contrato; sem instrução nova no prompt. Core: `AnnotationsPatch` aceita `style` e exporta os tipos (só tipos e teste; o runtime do 1.0.0 já gravava). Sem subir versão do core: o formato v1 só cresce por adição e o MCP funciona com `explicai` 1.0.0 (`peerDependencies` `>=1.0.0 <2.0.0`). Fora: medida Playwright (sem mudança visual); publicação npm.

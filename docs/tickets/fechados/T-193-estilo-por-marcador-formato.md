# T-193: Estilo por marcador, formato e export

- Prioridade: P1
- Tamanho: M
- Status: fechado
- Agente: frontend
- Origem: discovery [personalizar-marcacoes](../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 4

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Modelo de dados.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [x] `style` opcional em marcador, seta, destaque e área; `parseItemStyle` por tipo; inválido é ignorado; vazio some.
- [x] Export e editor resolvem a cascata item > imagem > manual sem JS novo (variáveis no próprio elemento).
- [x] Sobrevive a regravar pelo Studio, pelo recorte (`CropPanel`) e pelo MCP; teste por caminho.
- [x] Manual sem `style` exporta idêntico; `version` continua 1.
- [x] `fill` e `border` ambos `none` no mesmo item não é aceito (volta a `border: s`).
- [x] `manual-format.md` e `CHANGELOG`.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
Branch feat/t-193-estilo-por-marcador (commits abaixo da main 69b292b).

Feito: `style` em marcador, seta, destaque e área (`parseItemStyle` por tipo em core e cópia web, ligado ao `parseAnnotations`); cascata item > imagem por variáveis CSS no próprio elemento (export e overlay do editor, `<g>` da seta, chip da legenda); disco por marcador em `placeMarkers` (tamanho por lista); `fill`+`border` ambos `none` volta a `border: s`. Testes por caminho: leitura/gravação, `appendAnnotations` (annotate_image), mover/excluir/legenda do editor, recorte, export. Medido em Chrome headless no HTML exportado (item sobrescreve, vizinhos herdam, sem erro no console). `manual-format.md` e CHANGELOG atualizados.

Ficou de fora: destaque só aceita `border` (cor e preenchimento: T-195); `AnnotationsPatch` do core e `annotate_image` do explicai-mcp não ganharam `style` por item (T-197); painel (T-194); os quatro defeitos da seta são o ticket 2 da discovery, não deste.

# T-193: Estilo por marcador, formato e export

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: discovery [personalizar-marcacoes](../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 4

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Modelo de dados.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [ ] `style` opcional em marcador, seta, destaque e área; `parseItemStyle` por tipo; inválido é ignorado; vazio some.
- [ ] Export e editor resolvem a cascata item > imagem > manual sem JS novo (variáveis no próprio elemento).
- [ ] Sobrevive a regravar pelo Studio, pelo recorte (`CropPanel`) e pelo MCP; teste por caminho.
- [ ] Manual sem `style` exporta idêntico; `version` continua 1.
- [ ] `fill` e `border` ambos `none` no mesmo item não é aceito (volta a `border: s`).
- [ ] `manual-format.md` e `CHANGELOG`.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

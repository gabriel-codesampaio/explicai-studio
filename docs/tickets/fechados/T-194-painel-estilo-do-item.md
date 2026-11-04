# T-194: Painel Estilo do item selecionado

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: design
- Origem: discovery [personalizar-marcacoes](../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 5

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Depende do T-193 e do layout do T-157.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [ ] Seção "Estilo" no topo da coluna, só com item selecionado, com os campos do tipo; sem seleção, mostra o "Padrão da imagem" recolhido.
- [ ] Amostras de cor de 28 px (44 em toque), controles segmentados em uma linha, "Voltar ao padrão" por item, "Herdando da imagem" quando sem override.
- [ ] Alvo 24 px (mínimo), foco visível, nomes acessíveis; axe sem violações; sem cor decorativa.
- [ ] Teste de interface: selecionar marcador 2, trocar cor e tamanho, salvar, exportar HTML e conferir o computed style só no marcador 2.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

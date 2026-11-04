# T-191: Setas sem defeito

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: discovery [personalizar-marcacoes](../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 2

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Corrige S1 a S4.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [ ] Editor e export desenham a mesma espessura relativa à imagem (um só cálculo, teste das duas cópias de `annotationShapes`).
- [ ] Selecionar não muda a forma (usa anel, não espessura).
- [ ] Mínimo de arraste maior que o atual (proposta: 0,03) e ponta limitada a 40% do comprimento; seta curta mantém haste visível.
- [ ] Ponta proporcionalmente maior (largura de 5x a espessura, revisada no navegador em 375 e 1280, claro e escuro).
- [ ] Setas se movem com as teclas de seta quando selecionadas (S5), com passo de 1% e Shift para 5%.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-195: Destaque com cor, preenchimento e borda

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: discovery [personalizar-marcacoes](../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 6

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Depende do T-193.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [ ] Paleta de marca-texto (5 chaves) com borda derivada mais escura e texto 4,5:1 sobre o `soft`, medidos por script.
- [ ] `fill`: cheio, suave, sem (só contorno); o texto do print continua legível sobre azul (corrige B4).
- [ ] PDF em escala de cinza: os três preenchimentos e as bordas se distinguem.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

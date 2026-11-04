# T-190: Borda do destaque visível e opção "nenhuma borda"

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: discovery [personalizar-marcacoes](../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 1

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Corrige B1 a B3.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [ ] Destaque tem borda de cor própria derivada da cor do destaque (editor e export iguais).
- [ ] Espessura em px inteiros (1, 2, 3); medido por script nos três valores.
- [ ] `style.border` aceita `none|s|m|l` na raiz da imagem (padrão de todos os itens; por item no T-193); `none` tira anel do marcador, halo da seta e contorno de destaque e área; padrão sem o campo exporta byte a byte como hoje.
- [ ] Painel "Padrão da imagem" ganha "Borda" com "Nenhuma"; `parseStyle` ignora valor inválido; cópia web igual (teste).
- [ ] `manual-format.md` documenta o campo.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

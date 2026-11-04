# T-196: Barra de ferramentas e dicas

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: discovery [personalizar-marcacoes](../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 7

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Corrige U2 e U5.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [x] Ferramentas de marcar separadas de Ocultar e Recortar por divisor com rótulo.
- [x] Dica da ferramenta aparece junto da barra, não só no `DialogDescription`.
- [x] Item selecionado mostra ação de excluir e Delete funciona com o foco no canvas.
- [x] Atalhos em tecla continuam no T-184.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
Feito em feat/t-196-barra-marcacao (196047a): divisor com rotulo, dica visivel, Kbd na barra, Excluir no painel Estilo, Enter no item foca o painel, Esc volta ao canvas, Delete com foco no canvas. Fora: teste automatico de Esc/foco (precisa Playwright), excluir de areas ocultar/recortar no painel.

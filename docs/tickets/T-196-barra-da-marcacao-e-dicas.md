# T-196: Barra de ferramentas e dicas

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: discovery [personalizar-marcacoes](../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 7

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Corrige U2 e U5.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [ ] Ferramentas de marcar separadas de Ocultar e Recortar por divisor com rótulo.
- [ ] Dica da ferramenta aparece junto da barra, não só no `DialogDescription`.
- [ ] Item selecionado mostra ação de excluir e Delete funciona com o foco no canvas.
- [ ] Atalhos em tecla continuam no T-184.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

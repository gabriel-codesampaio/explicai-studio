# T-191: Setas sem defeito

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: discovery [personalizar-marcacoes](../../discovery/archives/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 2

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Corrige S1 a S4.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [x] Editor e export desenham a mesma espessura relativa à imagem (um só cálculo, teste das duas cópias de `annotationShapes`).
- [x] Selecionar não muda a forma (usa anel, não espessura).
- [x] Mínimo de arraste maior que o atual (proposta: 0,03) e ponta limitada a 40% do comprimento; seta curta mantém haste visível.
- [x] Ponta proporcionalmente maior (largura de 5x a espessura, revisada no navegador em 375 e 1280, claro e escuro).
- [x] Setas se movem com as teclas de seta quando selecionadas (S5), com passo de 1% e Shift para 5%.

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
Commit `feat(annotations): setas sem defeito e movidas pelo teclado`.
- S1: `arrowThickness(unit, scale)` (0,5% do lado maior) é o único cálculo, usado no editor e no export; teste das duas cópias de `annotationShapes`.
- S2: selecionar desenha anel (`--primary`) em volta da seta, sem mudar a espessura.
- S3: arraste mínimo de 3% (`ARROW_MIN_DRAG`) só para seta; ponta no máximo 40% do comprimento.
- S4: ponta com largura de 5x a espessura (comprimento 5,5x).
- S5: `nudge` + `onKeyDown` do editor: setas do teclado movem a seta selecionada, 1%, Shift 5%. Só seta (marcador e áreas ficam como estavam).
- Medido (Chrome headless, 1280, claro): espessura relativa editor 0,0050 e export 0,0051; teclas movem 1% e 5%; seta curta mantém haste. Revisão em 375 e escuro fica para o fecho do lote.

# T-556: Marcador não nasce em cima do alvo; refazer anotações do exemplo financeiro

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: [critique 2026-11-05 (27/40)](../../.impeccable/critique/2026-11-05T12-50-20Z__web-src-app-tsx.md)

## Problema
No editor de imagem o marcador nasce sobre o alvo e o tapa. No exemplo `docs/exemplo/financeiro`: marcador 1 tapa "Novo cliente", a seta termina no texto, o destaque cobre a lateral. Junta T-535 (mojibake "CobranÃ§as").

## Critérios de aceite
- [x] Marcador novo nasce encostado fora do alvo (ou número+seta juntos), sem cobrir o alvo.
- [x] Print e anotações de `docs/exemplo/financeiro` refeitos: marcador não tapa texto, seta termina no alvo, destaque não cobre a lateral.
- [x] Cobre T-535 (sem mojibake nas imagens do exemplo); fechar T-535 como coberto.
- [x] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Como verificar
Teste de unidade do que for lógica; conferir a tela com script Playwright (uma largura, um tema) e medir com `evaluate_script`/script.

## Registro
Exemplo `docs/exemplo/financeiro` refeito: SVG sem mojibake; marcadores com a ponta na borda do alvo (o marcador já é pino: disco ao lado, cauda até a ponta, via `placeMarkers`, então o disco cai fora do alvo); destaque só na 1ª linha da lista (não cobre a lateral); seta do botão ao topo da lista; área clicável ajustada ao botão. Conferido em prévia SVG a 70% e 100% da escala (script, fora do repo). Não mudei a lógica de criação: o pino já nasce encostado, o que tapava era a posição gravada no exemplo. Fora: validar no Studio real (design).

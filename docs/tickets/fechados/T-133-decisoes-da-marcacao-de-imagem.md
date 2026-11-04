# T-133: Decisões da marcação de imagem

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: design
- Origem: [Discovery de marcação de imagem](../discovery/marcacao-de-imagem.md), perguntas para a pessoa

## Decisão da pessoa (2026-11-04)
"Sem preferências": valem as recomendações do discovery.

1. Marcador ao lado do alvo, com cauda, porque o disco cobre o botão que o passo explica.
2. A linha "Sem descrição" sai do export, e a checagem do Studio passa a avisar.
3. Ocultar dado sensível: já feito (T-116).
4. Retângulo só de contorno: espera o uso real. Fora deste ticket.
5. Fixar o disco em 24 px só depois de medir num print real.

## Critérios de aceite
- [x] Marcador com cauda no Studio e no export, em HTML e PDF. A posição gravada continua sendo o alvo. Manual antigo exibe igual ou melhor, sem perder marcador.
- [x] Marcador sem descrição não gera linha na legenda em HTML, PDF e Markdown (`noDescription`, `legendRows`). `checkManual` e o Studio avisam.
- [x] Medida do disco em print real registrada aqui, em 1280 e 375, com a decisão de tamanho.
- [x] Sem cauda fora da imagem nem sobre outro marcador nos exemplos do repositório.

## Medida
Playwright headless (Chrome), tema claro, manual-do-comercial (print de 861 x 779 px com 8 marcadores sem descrição). Script de medição fora do repositório; mede o disco, a cauda e as sobreposições no DOM.

| Onde | Largura da tela | Imagem exibida | Disco | Número | Disco / largura da imagem | Problemas |
|---|---|---|---|---|---|---|
| Studio (página) | 1280 | 712 x 644 | 24 px | 13 px mono 600 | 3,4% | 0 |
| Studio (página) | 375 | 335 x 303 | 24 px | 13 px | 7,2% | 0 |
| Export HTML | 1280 | 752 x 681 | 24 px | 13 px | 3,2% | 0 |
| Export HTML | 375 | 335 x 303 | 24 px | 13 px | 7,2% | 0 |

- "Problemas" = disco ou cauda fora da imagem, disco sobre outro disco, disco sobre o alvo de outro marcador, cauda tocando outro disco. Zero nos 8 marcadores, nas quatro medidas.
- Cauda visível: cerca de 16 px entre a borda do disco e o alvo.
- Contraste do número: branco sobre `#2B4FE0` = 6,37:1 (mínimo 4,5:1).
- Alvo de toque: 24 px = mínimo do WCAG 2.5.8. O alvo de 44 px do projeto vale para botões; o marcador no print é só leitura na página e, no editor, a lista lateral dá a outra via de seleção.

**Decisão:** fixar o disco em 24 px, em px (não escala com a imagem). No print de 335 px (celular) o disco cobre 0,6% da área e o número de 13 px se lê; no de 752 px ele não domina o print. Escalar com a imagem deixaria o número menor que 13 px nos prints pequenos.

Como a cauda escolhe o lado: o disco sobe e vai para o lado com mais espaço; se sairia da imagem ou cobriria outro disco ou alvo, tenta os outros ângulos. A posição gravada continua sendo o alvo (a ponta da cauda). No export, o ângulo é decidido num quadro de 320 px de largura, para valer também no celular (`MARKER_REF_WIDTH`).

## Como verificar
Print em 375 e 1280, claro e escuro. `/impeccable audit`. E2e de marcação.

## Registro
Feito no PR #30. Marcador com cauda (`placeMarkers`, disco 24 px fixo, ângulo decidido num quadro de 320 px), "Sem descrição" fora da legenda em HTML, PDF e Markdown, aviso `marker-without-label` em `checkManual` e no Studio. Legenda com mais respiro (16 px do print, 10 px entre disco e texto, 6 px entre linhas; antes 12, 6 e 2), pedido da pessoa em print de 380 px; medido no export do manual do CodeLab em 375 e 1280, igual nos dois (o PDF sai do mesmo CSS; não medido à parte). Fora: tema escuro e `/impeccable audit` não rodados; alvo de toque de 24 px abaixo de 44 px (marcador é alvo de leitura e arraste; design decide); export abaixo de 320 px ou imagem `shot-s` no celular pode encostar o disco na borda.

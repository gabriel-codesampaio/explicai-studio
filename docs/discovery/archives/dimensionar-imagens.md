# Discovery: dimensionar as imagens

Data: 2026-11-03. Continua `marcacao-de-imagem.md` e `ocultar-dados-sensiveis.md` (T-116). Sem código, sem ticket.

Ideia original (caderno): "ferramenta pra dimensionar as imagens".

## Problema

Quem monta o manual cola um print que entra em tamanho natural e só encolhe para caber na coluna. Print de tela inteira fica enorme e o detalhe (um botão) fica pequeno ou sem foco; print estreito (modal) fica solto. Hoje não há controle de tamanho, nem recorte, nem peso. Só as marcações têm alça (`web/src/lib/annotations.ts:136`).

"Dimensionar" tem 3 leituras diferentes, com custo e risco diferentes:

1. **Tamanho de exibição** (como a imagem aparece na página). Não toca no arquivo.
2. **Recorte** (tirar bordas do print). Destrutivo.
3. **Reduzir resolução e peso** (print 4K de 3 MB). Destrutivo.

## Estado atual (lido)

- Editor: `.tiptap img { max-width: 100% }` (`web/src/styles/editor-content.css:195`). No editor de marcação, `max-h-[70vh] max-w-full` (`AnnotationCanvas.tsx:107`).
- Export: `renderShot` (`src/core/export/html.ts:182`) põe `<span class="frame" style="aspect-ratio:w / h">`; CSS `.frame{max-width:100%;width:fit-content}` e `img{max-width:100%;height:auto}` (`annotationCss.ts:7-8`). PDF sai do mesmo HTML.
- Markdown da imagem: `![alt](../assets/x.png)`, sem título nem tamanho. O Tiptap Image tem atributo `title`, hoje não usado. O export descarta HTML cru, então `<img width>` não serve.
- Marcações: JSON em `assets/x.png.json`, coordenadas 0..1. `parseAnnotations` copia só os campos que conhece (campo novo precisa entrar nele e no tipo, senão some na primeira gravação).
- Imagens usadas: `saveAsset` grava com nome único; `cleanUnusedAssets` move imagem sem uso e o JSON dela para `.lixeira/`.

## Como os outros fazem (fontes)

- Obsidian: tamanho vai no próprio Markdown, `![[img.png|300]]` ou `![alt|100](url)`; só largura mantém a proporção. Plugin Resizer permite arrastar canto e grava `|largura` ([fórum](https://forum.obsidian.md/t/resize-embedded-content/877), [Resizer](https://community.obsidian.md/plugins/resizer)). Em outro leitor de Markdown o `|300` aparece dentro do texto alternativo.
- Snagit: recorte é ferramenta própria (aplica com um clique); redimensionar fica em Imagem > Redimensionar, por pixel, polegada, cm ou porcentagem, mantendo proporção ([TechSmith crop](https://www.techsmith.com/learn/tutorials/snagit/crop/), [resize](https://techsmith.com/blog/tutorials/snagit/resize-rotate-flip-image)).
- Scribe, Tango, GitBook, Confluence: esta rodada não achou fonte sobre recorte ou tamanho. Lacuna, não afirmo nada. (Tango recorta o print em torno do passo segundo `marcacao-de-imagem.md`, fonte de blog de comparação.)

Leitura: o padrão do mercado é recorte e redimensionar como duas ferramentas separadas, e redimensionar na exibição como largura simples. Ninguém coberto aqui oferece compressão de peso como destaque (hipótese; não pesquisei).

## Leitura 1: tamanho de exibição

### Onde guardar

| Lugar | Compatível? | Efeito | Veredito |
|---|---|---|---|
| Sidecar `assets/x.png.json`, campo opcional `display` | Sim. Markdown não muda; leitor antigo ignora; arquivo antigo segue válido | Vale por arquivo de imagem, não por uso. Mesma imagem em 2 páginas = mesmo tamanho (aceitável) | **Recomendado** |
| Título do Markdown `![a](x.png "=50%")` | Parcial: aparece como dica (tooltip) em outros leitores | Por uso. Mistura tooltip com dado | Descartado |
| Texto alternativo `alt\|300` (estilo Obsidian) | Não: o alt vira lixo em MCP, leitor de tela e Markdown exportado | Por uso | Descartado |
| Atributo Pandoc `{width=50%}` | Não: `marked` não entende, sai como texto | Por uso | Descartado |

Sidecar mantém o Markdown limpo (regra do projeto: página escrita à mão continua válida) e as coordenadas continuam 0..1, então **marcações não mudam de lugar**: tudo escala junto dentro do `.frame`.

Forma do campo: `"display": "s" | "m" | "full"` (omitido = comportamento de hoje). Presets em vez de pixel: funcionam em tela estreita e no PDF. Largura livre (arrastar borda) pode vir depois como `"width": 0.4` (fração da coluna), campo aditivo; não escolher agora.

### Efeito no export

- **HTML/PDF**: `.frame` ganha largura máxima por preset (ex.: s 40%, m 70%, full 100% da coluna). Usar `max-width`, não `width`, para não ampliar print pequeno e borrar. Como o `.frame` é `fit-content`, o percentual precisa ser definido no span externo (`.shot`), não no frame (risco de dependência circular de largura). A resolver na spec com teste visual.
- **Markdown exportado**: sem mudança.
- **Legenda**: sem mudança.
- **Marcadores têm tamanho fixo em px** (disco de 24 px). Imagem em preset S (~300 px) com muitos marcadores se sobrepõe (a discovery anterior já mediu ~29 px de distância em 300 px). Risco real: avisar no editor quando o preset S + 4 ou mais marcadores, ou limitar S a imagens sem marcador. Pergunta abaixo.
- **PDF**: A4 já limita; preset full no PDF = largura da coluna.

### Formato de dados

Aditivo, opcional, sem subir `version`. Custo escondido: `parseAnnotations` e o tipo `Annotations` precisam do campo, `writeAnnotations` precisa aceitar arquivo só com `display` (hoje o JSON só nasce ao marcar), e o MCP `annotate_image` não pode apagar o campo ao regravar (**verificar** no código do MCP; não li). Risco médio por isso, não alto: nenhum campo existente muda.

### Interface

Barra pequena ao selecionar a imagem no editor: três botões "Pequena / Média / Larga" (texto visível; sem ícone-só). Sem alça de arrastar no corte mínimo: alça de borda mexe com o NodeView do Tiptap, foco de teclado e alvo de 24 px (WCAG 2.2), e só vale depois que alguém pedir tamanho fino.

## Leitura 2: recorte (destrutivo)

Mesmo caminho do T-116: canvas no navegador, `toBlob`, gravar **arquivo novo completo** por temp + rename sobre o mesmo caminho, sem bytes pós-`IEND`, sem EXIF, só raster (SVG e GIF animado recusados), original apagado. T-116 ainda está aberto: **recorte e redução devem reusar o mesmo endpoint "substituir imagem"**, não criar outro. Fazer depois de T-116 ou junto no mesmo primitivo.

**Diferença que muda tudo: o tamanho muda.** No T-116 "mesmo caminho, mesmo tamanho" mantinha as marcações válidas. No recorte, x e y (0..1) deixam de apontar para o mesmo pixel.

Regra de remapeamento para o retângulo de recorte `(cx, cy, cw, ch)` em 0..1:

- ponto (marcador, extremo de seta): `x' = (x - cx) / cw`, `y' = (y - cy) / ch`.
- retângulo (destaque, área clicável): interseção com o recorte, depois mesma conta em x, y, w, h; w e h dividem por cw e ch.
- Marcação 100% fora do recorte: some. Marcador fora: some e a **numeração e a legenda mudam** (renumerar). Seta com uma ponta fora: cortar na borda ou apagar (decidir).
- Hotspot fora do recorte: some e o destino deixa de ser alcançável pela imagem.

Isso é perda de dado. Mitigação mínima: a confirmação lista "N marcações serão removidas" antes de aplicar. Mais seguro e mais barato: **recusar recorte que deixaria marcação fora** ("tire ou mova as marcações antes"), o que corta toda a regra de remapeamento de ponta parcial. Pontos e retângulos totalmente dentro seguem com a conta simples.

Outros efeitos: `aspect-ratio` no export vem de `imageSize` (lê cabeçalho), então segue certo. Desfazer só antes de aplicar. Recorte puxa um editor novo (arrastar retângulo com alças, proporção livre) que reaproveita o código de destaque do editor de marcação. O recorte pelo canvas tem um caso de segurança a favor: recortar tira pixels de verdade, ao contrário do aCropalypse, desde que escreva arquivo novo.

## Leitura 3: reduzir resolução e peso

- Reduzir largura por canvas (`drawImage` + `toBlob`): proporção mantida, marcações 0..1 **continuam válidas**, caminho igual. Mesmo primitivo do T-116, sem remapeamento.
- PNG: só reduzir pixels ganha peso (lossless). JPEG/WebP aceitam qualidade. Converter PNG para JPEG/WebP muda a extensão e o caminho citado no Markdown e o nome do JSON, quebrando referências: **fora do corte**; manter a extensão.
- Perde ICC e sofre reamostragem do navegador (qualidade mediana de `drawImage` em redução forte; sem fonte, hipótese; testar).
- Print de texto reduzido demais perde nitidez. Dar sugestão (ex.: máximo 1600 px de largura) em vez de aplicar sozinho.
- Valor real: manual com muitos prints de 3 a 5 MB deixa `exportacao/html/` pesado. Não medi nenhum manual real; hipótese. Medir peso de `assets/` em 2 manuais antes de investir.

## Opções

| Opção | O que a pessoa ganha | Tam. | Toca | Riscos | Fora |
|---|---|---|---|---|---|
| **A. Tamanho de exibição por preset** (leitura 1) | Print grande para de dominar a página; print de modal não fica estourado. Reversível a qualquer hora. | **P a M** | `src/core/annotations.ts` (campo `display`), `assets.ts`, `export/html.ts`, `annotationCss.ts`, `ImageView.tsx` (barra), textos pt/en, `docs/manual-format.md`, testes | Campo novo precisa passar em `parseAnnotations`/MCP; marcadores fixos em px sobrepõem em tamanho S; percentual do `.frame` circular | Arrastar borda, largura livre, recorte, peso |
| B. A + redução de resolução (leitura 3) | A, mais "Reduzir para N px" destrutivo, mesma rota de T-116 | M | A, mais rota/primitivo de substituir imagem (compartilhado com T-116) | Depende de T-116; irreversível; perda de nitidez; mede ganho real antes | Recorte, conversão de formato |
| C. B + recorte | Recorte do print com remapeamento das marcações | G | B, mais editor de recorte, remapeamento, renumeração, confirmação | Perda de marcações; legenda/numeração mudam; editor novo; acessibilidade das alças | Recorte com marcação parcial (recusar), conversão de formato, lote |

## Recomendação: A

- Menor corte que resolve a queixa "imagem grande demais" sem tocar no arquivo nem em dado destrutivo; reversível; não depende de T-116.
- Recorte (C) é a leitura de maior risco por causa das marcações. Só entra se alguém pedir; Snagit e Tango separam recorte como ferramenta própria, então vira outra discovery/ticket depois de T-116 e B.
- Peso (B) só justifica depois de medir `assets/` em manuais reais.

O que observar depois de A: se as pessoas escolhem S e perdem legibilidade de marcador; se pedem tamanho fino (aí vem a largura livre); se pedem "tirar a barra de tarefas/bordas do print" (aí vem recorte, e o print de `marcacao-de-imagem.md` já mostra um caso: barra do Windows dentro da imagem); peso de `exportacao/html/assets/`.

## Perguntas abertas (com recomendação)

1. Presets ou arrastar borda? Recomendo presets agora (P/M/Larga), arrastar depois se pedirem.
2. Tamanho por arquivo de imagem (sidecar) ou por uso na página? Recomendo por arquivo; mesma imagem em outra página com tamanho diferente é raro e custa título/alt sujo.
3. Preset Pequena com 4 ou mais marcadores: bloquear, avisar ou deixar? Recomendo avisar no editor.
4. Recorte entra? Recomendo não agora; dê uma amostra de prints reais com barra de tarefas/bordas para decidir.
5. Peso: medir `assets/` de 2 manuais reais antes de aprovar B? Recomendo sim.
6. Preset "Média" vale que percentual (70%?) e o padrão sem preset continua como hoje (natural, limitado à coluna)? Recomendo manter o padrão atual.

## Rascunho de spec: opção A

**Escopo.** Imagem do manual ganha tamanho de exibição por preset (Pequena, Média, Larga), guardado em `assets/<imagem>.json` como `display` opcional. Vale no editor, no HTML e no PDF. Markdown, arquivo da imagem e coordenadas das marcações não mudam.

**Critérios de aceite.**
- [ ] Ao selecionar a imagem no editor aparecem 3 botões com texto (pt-BR e en); o ativo é indicado; sem escolha = comportamento atual.
- [ ] A escolha grava `display` em `assets/<imagem>.json` (cria o arquivo se não existir) de forma atômica; `version` fica em 1.
- [ ] `parseAnnotations` preserva `display` e recusa/ignora valor fora de `s|m|full`; arquivo antigo abre e exporta igual; abrir não regrava.
- [ ] O MCP `annotate_image` não apaga `display` ao regravar (teste).
- [ ] Editor e HTML exportado mostram o mesmo tamanho relativo; marcadores, setas, destaques e áreas continuam sobre o mesmo pixel em todos os presets (teste visual em um print com marcações).
- [ ] Preset nunca amplia a imagem acima do tamanho natural (print pequeno não borra).
- [ ] PDF: Média e Pequena respeitam a coluna; Larga cabe na página sem estourar.
- [ ] Markdown exportado e a página `.md` não mudam.
- [ ] Imagem sem uso movida para `.lixeira/` leva o JSON junto, com `display`.
- [ ] Aviso no editor com preset Pequena e 4 ou mais marcadores.
- [ ] Item novo em `docs/manual-format.md`; `npm run check` passa; Playwright com `--workers=2`, uma largura e um tema na fatia.

**Fora de escopo.** Arrastar borda, largura livre, recorte, redução de peso/resolução, conversão de formato, tamanho por uso na página, desfoque.

**Riscos.**
- Campo novo no JSON: `parseAnnotations`, `Annotations`, `writeAnnotations` e MCP precisam andar juntos (duas cópias de `annotationShapes` não são tocadas, só os tipos).
- CSS: percentual em `.frame` (`fit-content`) pode ficar circular; definir largura no `.shot`.
- Marcadores de 24 px fixos em imagem pequena.
- Parte do formato mudando em disco: baixo risco, aditivo, mas confirmar no MCP (não li o código dele).

## Não verificado

Código do MCP (`annotate_image`) e se `writeAnnotations` aceita JSON só com `display`; recorte e tamanho em Scribe, Tango, GitBook, Confluence (sem fonte); qualidade de redução por canvas; peso real de `assets/` em manuais existentes.

**Decidido em 2026-11-03:** opção fixa, tamanho por arquivo, aviso com 4 ou mais marcadores, e a pessoa pediu o recorte também. Viraram os tickets T-117 (tamanho), T-118 (recorte, remapeando as marcações) e T-119 (reduzir peso).

# Personalizar marcações da imagem: estilo por marcador e revisão de usabilidade

Data: 2026-11-04 (revisão do mesmo dia). Discovery. Sem código, sem ticket, sem commit. Complementa [marcacao-de-imagem](marcacao-de-imagem.md) e [T-133](../../tickets/fechados/T-133-decisoes-da-marcacao-de-imagem.md). A direção visual de lá (disco cobalto, caneta azul + marca-texto, marcador ao lado com cauda) continua o padrão.

Pedido original: "adicionar personalização dessas ferramentas, tá tudo azul e borda; personalização dos marcadores".

Pedido da revisão (literal): "As bordas não estão funcionando, e quero opção de 'nenhuma borda', faça um design melhor." "Cada marcador precisa ter sua estilização única." "Destaque precisa também ter customizações." "Revise as setas, parece que estão com problemas." "O marcador está com o número desalinhado." Atalhos da barra como tecla discreta. "Quero algo mais usabilidade."

## O que mudou desde a primeira versão

- A primeira versão recomendou a opção A e depois B (estilo por imagem). O T-138 entregou B: `style` na raiz do JSON da imagem (`color`, `size`, `stroke`), painel "Aparência", variáveis CSS no `.shot` (mergeado, #45). Esta revisão parte do que existe no HEAD (`d2ad4e9`).
- **Decidido pela pessoa:** o estilo é **por marcador** (cada marcador, seta, destaque e área tem o seu). O estilo da imagem (T-138) vira o padrão da imagem, e o tema do manual (`accent`, `highlight`) o padrão do manual. Cascata: item, imagem, manual, marca.
- A resposta 2 da primeira versão ("por manual agora, por imagem depois, por marcação não") fica superada.

## O problema (reescrito)

Quem monta o manual quer que cada marca se distinga no print: um destaque que não esconda o botão azul, uma seta vermelha para o erro e verde para o certo, um marcador menor num canto apertado, e poder tirar a borda quando atrapalha. Hoje escolhe só um estilo para a imagem inteira, a "espessura" não muda nada que se veja no destaque, e a barra e o painel pedem cliques demais e escondem a Aparência fora da tela.

## Problemas achados (reproduzidos em Chrome headless, Studio e HTML exportado, 1280x800)

Medido = script Playwright; código = lido, não medido.

| # | Problema | Onde | Evidência |
|---|---|---|---|
| B1 | **A borda do destaque é invisível.** Borda e preenchimento são a mesma cor (`--marca`), então mudar a espessura só engorda a caixa amarela em 1 a 2 px. Foi isso que a pessoa viu: "as bordas não funcionam". A área clicável tem borda tracejada visível, então ali funciona. | `src/core/export/annotationCss.ts:10-11`; `web/src/features/annotations/AnnotationOverlay.tsx:128`; rótulo "Espessura da seta e do contorno" em `AppearancePanel.tsx:79`; `ANNOTATION_STYLE_CSS` linha 30 | Medido: `.hl` com `border-top-width` 1 / 2 / 3 px em fino / normal / grossa; no print a caixa amarela é um bloco chapado nos três. |
| B2 | "Fina" vira 1 px, não 1,5: o navegador arredonda a borda para baixo. Só 3 degraus que se distinguem no limite. | `ANNOTATION_STYLE_CSS` (`calc(2px*var(--marca-espessura))`) | Medido: 1px. |
| B3 | Não existe "nenhuma borda". O anel branco do marcador (`box-shadow:0 0 0 2px #fff`), o halo da seta e o contorno de destaque/área são fixos. | `annotationCss.ts:16-17,21`; `AnnotationOverlay.tsx:160-163,207` | Código. |
| B4 | O destaque é só `multiply` com amarelo: sobre o botão azul do print virou verde-escuro e o texto "Novo cliente" ficou ilegível. Sem opção de cor, de opacidade nem de "só contorno". | `annotationCss.ts:11`; `AnnotationOverlay.tsx:128` | Visto na captura do editor. |
| S1 | **Espessura da seta diferente no editor e no export.** Editor: 3,5 px fixo na tela (5 px quando selecionada). Export: `unit*0.005` do lado maior da imagem, escalado com ela. O que a pessoa edita não é o que sai. | `AnnotationOverlay.tsx:152`; `src/core/export/html.ts:211` | Código; no print de 900 px o export dá 4,5 px de imagem. |
| S2 | A seta muda de forma ao selecionar: a espessura sobe de 3,5 para 5 e a ponta (4,5x a espessura) cresce junto, parece que a seta "pula". | `AnnotationOverlay.tsx:152` | Código. |
| S3 | Seta curta vira ponta sem haste: o mínimo de arraste é 0,01 da imagem (~9 px) e a ponta pode ocupar até 70% do comprimento. | `web/src/lib/annotations.ts:78-80,120`; `annotationShapes.ts:27` | Visto na seta curta do teste: é um triângulo com um toco. |
| S4 | A ponta é pequena para a haste: 4,05x a espessura de largura. Em print de 1920 px mostrado a 700 px, a seta some. Só dá para engrossar a imagem inteira. | `annotationShapes.ts:27-28` | Código. Hipótese: o "problema" que a pessoa vê é a combinação S1+S3+S4; ela não disse qual. Confirmar (pergunta 3). |
| S5 | Seta e marcador só se criam e movem com mouse. Não há seta do teclado para mover item selecionado nem alternativa por teclado para desenhar (a lista só edita legenda). | `AnnotationCanvas.tsx` (sem `onKeyDown`) | Código. |
| N1 | **Número do marcador.** Em Chrome/Windows com JetBrains Mono o desvio medido é pequeno: disco na imagem até 0,4 px; chip da legenda no Studio sobe 0,9 px; chip da legenda no export desce 0,4 px. Causa: o número é centrado pela caixa de linha (`line-height:1`), não pela altura das maiúsculas. A caixa de linha divide o espaço do ascendente e do descendente da fonte, e cada fonte reparte diferente. Com JetBrains Mono quase empata por sorte; com o fallback (`ui-monospace`, `Consolas`; no export, se `fonts/` não carregar) o número desliza de 0,5 a 1,5 px. | `annotationCss.ts:21-22,25`; `AnnotationOverlay.tsx:207-217`; `AnnotationList.tsx:63` (chip `size-6 text-xs`, line-height 1,33); `AnnotationLegend.tsx:159`; `editor-content.css:79` (passos) | Medido pelo ink do glifo em captura 4x (px de tela, em ordem): disco -0,1 a 0,4; chip do Studio -0,9; legenda do export +0,4. Não consegui ver o desvio que a pessoa vê: perguntar em qual lugar e em qual navegador (pergunta 5). |
| N2 | Número de 3 dígitos ("100") não cabe no disco de 20/24 px; o disco é círculo fixo. Fora do escopo, só registrar. | `annotationCss.ts:21` | Código. |
| U1 | **A Aparência fica abaixo da dobra.** A coluna lateral empilha Ocultar, Recortar, Reduzir, Legenda, Destaques e setas e só então Aparência: a 1280x800 o título aparece cortado na borda e os controles exigem rolar. Já é o T-157. | `AnnotationEditor.tsx:177-245`; captura do editor | Medido/visto. |
| U2 | A barra mistura marcar (Marcador, Destaque, Seta, Área) com editar pixel (Ocultar, Recortar) e com Selecionar; a dica da ferramenta (`DialogDescription`) fica longe do cursor. | `AnnotationEditor.tsx:30-43,132,135-157` | Código. |
| U3 | "Sem descrição: o print mostra só o número." repete em cada marcador vazio (T-157). Destaque e seta na lista se chamam "Destaque 1", "Seta 2", sem pré-visualização do estilo; o ícone é sempre cobalto. | `AnnotationList.tsx:76-78,126-136` | Visto. |
| U4 | Fechar descarta marcador novo sem perguntar (T-151); reabrir a imagem pede dois cliques (T-154); a legenda não recebe o foco depois de criar (T-156). | `AnnotationEditor.tsx:58-59,260`; `ImagePopover.tsx` | Tickets abertos. |
| U5 | Excluir só por Delete (foco fora de campo) ou pelo X da lista; selecionar um item não mostra nenhuma ação no próprio item. | `AnnotationEditor.tsx:115-123` | Código. |
| U6 | A cauda do marcador parece uma ponta de seta e cai sobre texto do print (marcador 2 em cima de "ana@ex.com"). Pertence ao desenho do T-133; registro só. | `annotationShapes.ts:61-96` | Visto. |

## Modelo de dados por marcador

Regra mantida do T-138: campo opcional, ausente = padrão, valor inválido é ignorado campo a campo, nunca derruba o arquivo. `version` continua 1 (aditivo).

```json
{ "version": 1,
  "style": { "color": "ink", "size": "m", "stroke": "m" },
  "markers":    [{ "id": "m1", "n": 1, "x": 0.3, "y": 0.4, "label": "Botão",
                   "style": { "color": "red", "size": "l", "border": "none" } }],
  "arrows":     [{ "id": "a1", "from": {...}, "to": {...},
                   "style": { "color": "green", "stroke": "l", "border": "m" } }],
  "highlights": [{ "id": "h1", "x": 0.1, "y": 0.2, "w": 0.3, "h": 0.08,
                   "style": { "color": "green", "fill": "soft", "border": "m" } }],
  "hotspots":   [{ "id": "t1", "x": 0, "y": 0, "w": 0.2, "h": 0.1, "target": {...},
                   "style": { "color": "purple", "border": "l", "fill": "none" } }]
}
```

Campos por tipo (todos opcionais; o que não vale para o tipo é ignorado):

| Campo | Valores | Marcador | Seta | Destaque | Área clicável |
|---|---|---|---|---|---|
| `color` | marcador, seta, área: as 6 chaves do T-138 (`cobalt`, `ink`, `red`, `green`, `purple`, `orange`). Destaque: paleta de marca-texto própria (`yellow`, `green`, `pink`, `blue`, `orange`), cada uma com a cor de borda derivada mais escura. | sim | sim | sim (paleta marca-texto) | sim |
| `size` | `s`, `m`, `l` (disco 20/24/32 px) | sim | não | não | não |
| `stroke` | `s`, `m`, `l` (espessura da haste e da ponta) | não | sim | não | não |
| `border` | `none`, `s`, `m`, `l`. Marcador: anel branco; seta: halo branco; destaque e área: contorno | sim | sim | sim | sim |
| `fill` | `solid`, `soft`, `none` | não | não | sim (`none` = só contorno, resolve B4) | sim |

Decisões de desenho:

- **`border` resolve B1 e B3.** No destaque a borda passa a ter cor própria (a cor do destaque mais escura, derivada na paleta), então espessura aparece. `none` tira. Padrão sem campo: o de hoje (anel 2 px, halo, contorno 2 px), então manual antigo sai igual.
- **Arredondamento (B2):** a escala de `border` vira px inteiros (1, 2, 3) em tabela, não `calc` com fator.
- **Cascata:** `item.style` > `annotations.style` (imagem, T-138) > `theme` do manual > marca. Implementação: o estilo do item vira as mesmas variáveis CSS (`--anotacao`, `--disco`, `--marca-espessura`, novas `--borda`, `--preenchimento`) em `style=""` do próprio elemento (`.mk`, `.hl`, `.hot`, `<g>` da seta). Variável CSS herda do `.shot`, então o item só sobrescreve o que escolheu. Sem JS novo no export.
- **`parseAnnotations` (`src/core/annotations.ts:30-60`):** hoje cada item é reconstruído só com campos conhecidos, então um `style` de item some na primeira gravação. Cada `map` ganha `...(itemStyle ? { style: itemStyle } : {})`, com `parseItemStyle(kind, v)` ao lado de `parseStyle` em `src/core/annotationStyle.ts`. Paleta e passos não mudam de lugar: o web tem cópia idêntica (`web/src/lib/annotationStyle.ts`, teste de igualdade), a nova função entra nas duas.
- **Pontos que podem perder o campo (testar):** `CropPanel` recalcula marcações ao aplicar recorte (ver `onApplied`), `removeAnnotation`/`moved` em `web/src/lib/annotations.ts`; qualquer `map` que reconstrua o item em vez de `{...item}`.
- **MCP `annotate_image`** (`explicai-mcp/src/tools.ts`, ~linha 342): cada item de `markers`, `highlights`, `arrows`, `hotspots` aceita `style` opcional com enum fechado (mesmos valores, tokens baixos). `get_manual` devolve o `style` existente. Regravar preserva (só se o MCP grava via `parseAnnotations` do core; **hipótese a confirmar** lendo o MCP, já que a leitura dele não foi feita aqui). Prompt do agente não ganha instrução: só usa `style` se a pessoa pedir.
- **Formato em risco:** aditivo e opcional; leitor antigo descarta o `style` do item (a marca aparece no padrão). Mesmo risco já aceito para `display` e `style` da imagem. `manual-format.md` documenta ao lado do `style` da imagem (linha ~155).
- **Cor nunca é o único sinal** (mantido): número, ponta cheia, moldura e tracejado independem da cor. `border: none` num destaque `fill: none` deixaria o item invisível: o parser e o painel impedem a combinação (se `fill` e `border` forem ambos `none`, `border` volta a `s`).
- **Contraste:** as 6 cores do T-138 continuam 4,5:1 contra branco. A paleta de marca-texto é nova: borda derivada precisa passar 3:1 contra o fundo do print claro (WCAG 1.4.11, elemento gráfico) e o texto escuro sobre o preenchimento `soft` 4,5:1. Medir por script no `check`, não declarar de memória.

## Desenho do painel de estilo

Princípio: o estilo é do item selecionado, então o painel fica **junto da seleção**, não no fim da coluna.

```
Coluna lateral (20 rem)
+--------------------------------------+
| ESTILO · Marcador 2        [↺ padrão]|   aparece só com item selecionado,
| Cor     (o)(o)(o)(o)(o)(o)           |   no topo da coluna
| Tamanho [ P ][ M ][ G ]              |
| Borda   [Nenhuma][Fina][Normal][Grossa]
| (destaque: Cor marca-texto, Preenchimento [Cheio][Suave][Sem], Borda)
| Herdando da imagem: cobalto          |   texto pequeno quando sem override
+--------------------------------------+
| LEGENDA ...                          |
| ...                                  |
| ▸ Padrão da imagem  (details)        |   o painel Aparência do T-138, recolhido
+--------------------------------------+
```

- **Sem seleção:** o bloco de topo mostra "Padrão da imagem" (o painel atual), com a dica "Clique numa marcação para dar um estilo só a ela".
- **Cor:** 6 amostras redondas de 28 px (alvo 44 em `pointer:coarse`), selecionada com check e anel; nome em `title` e `aria-label`. Amostra mostra a cor do dado; nenhuma cor decorativa no Studio.
- **Passos:** controle segmentado de uma linha (radiogroup), não botões soltos que quebram linha. "Nenhuma" é a primeira opção de Borda.
- **Prévia:** a própria imagem, ao vivo. Não há miniatura separada (menos código, e o print real é o que importa).
- **Voltar ao padrão** por item (apaga `style` do item); o do T-138 continua para a imagem.
- **Teclado:** foco vai ao primeiro controle com `Enter` no item selecionado; `Esc` devolve ao canvas.
- **Atalho opcional, fora do corte:** aplicar o estilo do item selecionado a todos do mesmo tipo.
- Estilo do Studio: controles comuns, sem cor de enfeite (regra da marca: cor e personalidade ficam no manual exportado).

## Revisão da feature inteira (usabilidade)

Tickets abertos e o que absorver:

| Ticket aberto | Decisão |
|---|---|
| T-151 fechar sem perguntar | **Absorver como está**, sem repetir: fazer antes do estilo, pois o estilo aumenta o que se perde ao descartar. |
| T-154 reabrir no primeiro clique | Independente. Manter. |
| T-156 foco na legenda | Manter; precisa saber que o painel de estilo existe (o foco vai à legenda ao criar marcador, ao estilo só por seleção). |
| T-157 painel apertado | **Absorver neste desenho:** recolher Ocultar/Recortar, Aparência em `details`, "Sem descrição" uma vez. A seção Estilo do topo é a razão para fazer junto. T-157 vira o ticket de layout da coluna, com este desenho como entrada. |
| T-184 atalhos em tecla (já aberto) | Já cobre o pedido de `Kbd` ("⌘ K"). **Não abrir outro.** Só registrar aqui como item, com o `kbd` de `ShortcutsDialog.tsx:64` como referência de estilo. |

Itens de usabilidade novos (viram tickets abaixo): a barra separa "Marcar" de "Imagem" (U2); dica da ferramenta junto à barra ou como tooltip; seleção ganha ações no próprio item (U5); teclado move o item selecionado e `Delete` com foco no canvas (S5); setas coerentes (S1 a S4); nomes de lista com o ícone na cor do item (U3).

## Concorrentes (curto, só o que muda a decisão)

Fontes da primeira versão, não reverificadas hoje:

- Snagit, Passo/Step: forma, opacidade, sombra editáveis por item, painel de propriedades ([TechSmith](https://www.techsmith.com/learn/tutorials/snagit/step/)). Confirma estilo por item com painel junto à seleção.
- CleanShot X: seta com 4 estilos, contador, marca-texto ([recursos](https://cleanshot.com/features)).
- Shottr: opacidade em 1-9 ([Podfeet](https://www.podfeet.com/blog/2023/05/shottr/)). Degraus discretos.
- Scribe, Tango: sem fonte sobre cor ou tamanho (hipótese: pouca personalização). Não afirmar.
- Nenhuma dessas fontes trata de PDF em p&b. Inferência a testar.

Técnica para N1, com fonte: o CSS `text-box: trim-both cap alphabetic` (`text-box-trim` + `text-box-edge`) apara o espaço da caixa de linha até a altura das maiúsculas e a linha de base, de modo que `display:grid; place-items:center` centra o glifo, não a caixa de linha. MDN marca como Baseline 2026 "newly available"; a página que consultei não trazia a tabela de versões, e **de memória** Chrome/Edge 133 e Safari 18.2 têm, Firefox não tinha: conferir na tabela antes de depender ([MDN text-box-trim](https://developer.mozilla.org/en-US/docs/Web/CSS/text-box-trim)). Plano: `text-box: trim-both cap alphabetic` no número do disco, do chip da legenda e dos passos, dentro de `@supports (text-box: trim-both cap alphabetic)`; fora disso manter `line-height:1` (o que já existe no disco) e, no chip do Studio, trocar o `leading` padrão por `leading-none`. Piso: sem trim, medir e ajustar com `padding-top` em `em`, calibrado por script. O mesmo trim vale para o número do `.legend .n`.

## Opções

| | Ganho | Tamanho | Formato | Tocados | Riscos | Fora |
|---|---|---|---|---|---|---|
| 1. Corrigir sem estilo novo | B1 (borda do destaque visível), `border: none` por imagem, setas coerentes (S1-S3), número centrado (N1), painel Aparência acima da dobra. | M | Só `border` na raiz de `style` (aditivo) | `annotationCss.ts`, `AnnotationOverlay.tsx`, `annotationShapes.ts` x2, `html.ts`, `AppearancePanel.tsx`, `AnnotationEditor.tsx` | Não atende "cada marcador a sua"; refazer o painel depois. | Estilo por item, preenchimento, paleta de destaque. |
| 2. **Estilo por marcador, com cascata (recomendada)** | Tudo da 1 mais o decidido: estilo em cada item, destaque com cor, preenchimento e borda, painel junto da seleção, MCP aceita `style` por item. Feita em fatias, cada uma entrega valor sozinha. | G (em 4 fatias P/M) | Sim, aditivo, campo `style` opcional em 4 tipos | os da 1, mais `types.ts` x2, `annotations.ts` x2, `AnnotationList.tsx`, nova `StylePanel`, `manual-format.md`, MCP `annotate_image` | Perder o campo em recorte e em `map` que reconstrói; duas cópias de forma e de estilo; combinações para testar em p&b. | Estilo copiado entre itens, cor livre, tracejado de seta, numeração em letras. |
| 3. Opção 2 + "aplicar a todos do tipo", estilos salvos e padrão que o último escolhido vira | Rapidez para quem marca 10 itens iguais. | G | Pode pedir campo no manual | tudo da 2 mais armazenamento | Cresce sem uso real. | Cor livre. |

## Recomendação e corte mínimo

**Opção 2, na ordem das fatias abaixo; o corte mínimo é as fatias 1 e 2.**

Por quê: a pessoa já decidiu por-marcador; as fatias 1 e 2 consertam o que está quebrado e visível (borda do destaque, número, setas) sem formato novo além de `border`, e já destravam a 3. A 3 e a 4 só valem depois que o painel tem lugar (fatia 2).

Observar depois: quantos itens ganham estilo próprio em relação ao padrão da imagem (se quase ninguém usa, a 4 e a opção 3 não valem); quantas vezes alguém escolhe `border: none`; se o pedido volta como "mesmo estilo em vários itens" (opção 3); queixas de contraste no print azul; export em p&b.

## Tickets propostos (numeração a critério do supervisor; T-151, T-154, T-156, T-157, T-184 ficam como estão)

1. **Borda do destaque visível e opção "nenhuma borda" (por imagem)** (P1, M). Corrige B1 a B3.
   - [ ] Destaque tem borda de cor própria derivada da cor do destaque (editor e export iguais).
   - [ ] Espessura em px inteiros (1, 2, 3); medido por script nos três valores.
   - [ ] `style.border` aceita `none|s|m|l` na raiz da imagem; `none` tira anel do marcador, halo da seta e contorno de destaque e área; padrão sem o campo exporta byte a byte como hoje.
   - [ ] Painel "Padrão da imagem" ganha "Borda" com "Nenhuma"; `parseStyle` ignora valor inválido; cópia web igual (teste).
   - [ ] `manual-format.md` documenta o campo.
2. **Setas sem defeito** (P1, M). Corrige S1 a S4.
   - [ ] Editor e export desenham a mesma espessura relativa à imagem (um só cálculo, teste das duas cópias de `annotationShapes`).
   - [ ] Selecionar não muda a forma (usa anel, não espessura).
   - [ ] Mínimo de arraste maior que o atual (proposta: 0,03) e ponta limitada a 40% do comprimento; seta curta mantém haste visível.
   - [ ] Ponta proporcionalmente maior (largura de 5x a espessura, revisada no navegador em 375 e 1280, claro e escuro).
   - [ ] Setas se movem com as teclas de seta quando selecionadas (S5), com passo de 1% e Shift para 5%.
3. **Número centrado no marcador e na legenda** (P2, P). Corrige N1.
   - [ ] Um só estilo do número para disco, chip da legenda (Studio e export) e passos, com `text-box: trim-both cap alphabetic` sob `@supports` e `line-height:1` como piso.
   - [ ] Medida: desvio do glifo ao centro do disco ≤ 0,5 px a 20, 24 e 32 px, com JetBrains Mono e com o fallback (fonte forçada), em Chrome; registrar Safari/Firefox se disponível.
   - [ ] Número de dois dígitos continua centrado; três dígitos documentado (N2).
4. **Estilo por marcador, formato e export** (P1, M). Modelo de dados.
   - [ ] `style` opcional em marcador, seta, destaque e área; `parseItemStyle` por tipo; inválido é ignorado; vazio some.
   - [ ] Export e editor resolvem a cascata item > imagem > manual sem JS novo (variáveis no próprio elemento).
   - [ ] Sobrevive a regravar pelo Studio, pelo recorte (`CropPanel`) e pelo MCP; teste por caminho.
   - [ ] Manual sem `style` exporta idêntico; `version` continua 1.
   - [ ] `fill` e `border` ambos `none` no mesmo item não é aceito (volta a `border: s`).
   - [ ] `manual-format.md` e `CHANGELOG`.
5. **Painel Estilo do item selecionado** (P1, M). Depende de 4 e do layout do T-157.
   - [ ] Seção "Estilo" no topo da coluna, só com item selecionado, com os campos do tipo; sem seleção, mostra o "Padrão da imagem" recolhido.
   - [ ] Amostras de cor de 28 px (44 em toque), controles segmentados em uma linha, "Voltar ao padrão" por item, "Herdando da imagem" quando sem override.
   - [ ] Alvo 24 px (mínimo), foco visível, nomes acessíveis; axe sem violações; sem cor decorativa.
   - [ ] Teste de interface: selecionar marcador 2, trocar cor e tamanho, salvar, exportar HTML e conferir o computed style só no marcador 2.
6. **Destaque com cor, preenchimento e borda** (P2, M). Depende de 4.
   - [ ] Paleta de marca-texto (5 chaves) com borda derivada mais escura e texto 4,5:1 sobre o `soft`, medidos por script.
   - [ ] `fill`: cheio, suave, sem (só contorno); o texto do print continua legível sobre azul (corrige B4).
   - [ ] PDF em escala de cinza: os três preenchimentos e as bordas se distinguem.
7. **Barra de ferramentas e dicas** (P2, P). Corrige U2 e U5.
   - [ ] Ferramentas de marcar separadas de Ocultar e Recortar por divisor com rótulo.
   - [ ] Dica da ferramenta aparece junto da barra, não só no `DialogDescription`.
   - [ ] Item selecionado mostra ação de excluir e Delete funciona com o foco no canvas.
   - [ ] Atalhos em tecla continuam no T-184.
8. **MCP `annotate_image` e `get_manual` com `style` por item** (P2, P). Depende de 4.
   - [ ] Cada item aceita `style` com enum fechado; `get_manual` devolve; regravar sem `style` não apaga o existente.
   - [ ] Teste de contrato no `explicai-mcp`; versão do core atualizada; sem instrução nova no prompt.
9. **(Depois de uso real) Aplicar estilo a todos do mesmo tipo e último estilo como padrão** (P3, M). Opção 3; só se a observação indicar.

Ordem: T-151, depois 1, 2, 3 (corte mínimo) em paralelo com T-157, depois 4, 5, 6, 7, 8. T-154 e T-156 em qualquer ponto.

## Perguntas só a pessoa responde

1. A borda "que não funciona": é a do destaque (amarela, sem diferença visível), o anel branco do marcador ou outra? Recomendo tratar todas com `border`, como acima.
2. "Nenhuma borda" vale para os quatro tipos? Recomendo sim, com a trava: destaque sem preenchimento e sem borda não existe.
3. Qual defeito da seta você vê: espessura diferente do export, ponta pequena, seta curta virando triângulo, ou outra coisa? Recomendo tratar os quatro (ticket 2); se for outra, descreva.
4. Estilo por item e estilo da imagem convivem (o da imagem vira padrão)? Recomendo sim, para não perder o T-138 e para trocar o print inteiro de uma vez.
5. O número desalinhado: no disco sobre o print, na legenda ao lado ou nos passos numerados? Em qual navegador? Medi no máximo 1 px em Chrome/Windows; se for outro lugar ou navegador, o ticket 3 já cobre a técnica.
6. Destaque com paleta própria de marca-texto (amarelo, verde, rosa, azul, laranja) ou as mesmas 6 cores das setas? Recomendo paleta própria: marca-texto precisa ser clara para o texto de baixo continuar legível.
7. Novo item nasce com o estilo do último usado ou com o padrão da imagem? Recomendo o padrão da imagem; o "último usado" fica para o ticket 9.

## Rascunho de spec (opção recomendada, fatias 1 e 2 mais o formato)

**Escopo:** `border` na raiz de `style` e borda visível do destaque (T-1); setas com espessura única entre editor e export, mínimo de arraste e ponta (T-2); número centrado (T-3); depois `style` por item (T-4) e painel (T-5).

**Critérios de aceite (do conjunto)**
- [ ] Manual sem `style` exporta idêntico ao de hoje; `version` continua 1.
- [ ] Todo `style` inválido, de imagem ou de item, é ignorado campo a campo.
- [ ] Editor e export desenham igual (teste `annotation-shapes` e `annotation-style` nas duas cópias).
- [ ] Cores novas passam o contraste medido por script em claro e escuro.
- [ ] PDF em escala de cinza legível em todas as cores e bordas.
- [ ] Alvo de clique ≥ 24 px em qualquer tamanho; teclado e leitor de tela cobertos.
- [ ] `npm run check` e e2e da marcação (um e2e por vez, `--workers=2` no máximo).

**Riscos:** `style` de item perdido em recorte ou em `map` que reconstrói; duas cópias (core e web) divergirem; paleta de marca-texto sem aprovação do design; `text-box` sem suporte no Firefox (piso com `line-height:1`); MCP não ler o campo se não regravar pelo core (conferir).

**Fora:** cor livre, tracejado de seta, numeração em letras, estilos salvos, padrão global do Studio.

## Notas do trabalho

- Medido com script Playwright headless (Chrome instalado, 1 worker, um contexto por tela), em servidor local temporário numa pasta temporária; o navegador foi fechado e a pasta, apagada. Imagem do teste: maquete de tela gerada na hora.
- Não instalei nada. Skills que ajudariam: `customer-research` (reviews de concorrentes) e `pm-product-discovery`; não estavam instaladas, e nenhuma pesquisa de mercado nova foi feita nesta revisão.
- `docs/manual-format.md` (linhas ~155 a 163) é o lugar da documentação do campo.

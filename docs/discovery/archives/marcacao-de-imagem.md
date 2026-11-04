# Marcação de imagem: crítica, direção visual e corte mínimo

Data: 2026-11-03. Discovery (referências + crítica de design). Sem código, sem ticket, sem troca de branch: a pessoa aprova primeiro.

Nota sobre o print: a faixa de ícones de pastas embaixo ("miniaturas cortadas") é a barra de tarefas do Windows dentro da própria imagem, não parte da feature. A legenda começa logo depois dela e por isso parece espremida.

## Problemas por gravidade

Medido no Studio (manual-do-comercial, claro e escuro, 1200 px). O diálogo "Marcar imagem" não abriu de forma reprodutível, então o editor foi lido pelo código; larguras de 375 px são estimativa.

**Crítico**
- Marcador ambíguo: anel tracejado de 32 px (centro = ponto marcado) mais selo de 20 px deslocado -12/-12. O número fica fora do ponto e o anel parece um alvo vazio; o leitor não sabe qual dos dois é o alvo. Em tela estreita (~300 px de imagem) os pares ficam a ~29 px e se sobrepõem.
- Destaque opaco: `#FFD43B` a 100% com `multiply`. Texto grafite sobre ele dá 4,49:1 e cobalto sobre amarelo 4,47:1 (abaixo de 4,5). No PDF em preto e branco o amarelo vira cinza quase branco e o destaque some.

**Alto**
- Seta de 3,5 px (5 px selecionada) com halo branco: fina para um print de 766 px e sem relação visual com o marcador.
- Área clicável: caixa tracejada com fundo cobalto a 8% (quase invisível) e ícone de link de 20 px fora da caixa. Terceiro vocabulário visual, e o ícone é decorativo (a marca só aceita ícone que identifica ação).
- Acessibilidade do editor: camada `aria-hidden`, só `onPointerDown`, nada se move nem seleciona por teclado; alças de 12 px (mínimo WCAG 2.5.8 é 24 px); faixa de clique da seta de 14 px.
- Descoberta: a única entrada é o botão "Marcar imagem" dentro do popover do texto alternativo, sem pista de que a imagem é marcável.

**Médio**
- Legenda: "1 2 3 4 5 6 7 8 Sem descrição" lê como erro, não como legenda. Selos de 20 px com número de 11 px pequenos para papel.
- Seleção (borda cobalto, mesma cor da marcação) some sobre azul ou amarelo; na lista lateral só muda o fundo, fraco no escuro.
- Halo branco fixo brilha no tema escuro.

**Baixo**
- `--anotacao` muda com o tema no editor, mas no export é o cobalto (ou accent do tema do manual) sem teste de contraste contra amarelo.

## Direção visual (vale no Studio e no export)

Metáfora da marca: caneta azul e marca-texto sobre papel. Tudo vira traço de caneta; tracejado fica só para a área clicável.

| Elemento | Direção |
|---|---|
| Marcador | Uma forma só: disco cobalto cheio (`#2B4FE0` claro, `#7088FF` escuro), 24 px, número mono 600 de 13 px, anel de papel de 2 px. Ponto de ancoragem em `(x, y)`; ver pergunta 1 sobre ficar ao lado com cauda ou sobre o alvo. |
| Destaque | Contorno 2 px `#E0A800` mais fundo `#FFD43B` a 35% (28% no escuro), sem `multiply`. O contorno escuro carrega a forma em preto e branco. |
| Seta | 4 px cobalto sólido, ponta triangular cheia (~16 px), halo de papel de 1 px por lado; 6 px selecionada. Mesma espessura nos dois lados. |
| Área clicável | Tracejado fino (2 px, 4/3), raio 3 px, fundo cobalto a 6%, sem ícone externo. Rótulo mono de 16 px no canto interno (`p. 3`, `↗`) só no export e, no editor, ao selecionar ou passar o mouse. |
| Legenda | Selo 24 px igual ao do marcador, texto 15-16 px, linha de no mínimo 32 px, duas colunas com 8 ou mais itens. Nunca agrupa números; marcador sem descrição não gera linha no export. |
| Selecionado / foco | Anel duplo (2 px papel + 2 px nanquim `#151A33`, `#E8EBF7` no escuro), offset 2 px, alça quadrada de 16 px com alvo de 24 px. Foco por teclado igual ao hover. |

Tokens novos ou alterados (`tokens.css` e `:root` do export): `--marca-traco` `#E0A800`/`#FFD43B`; `--marca-fundo` `rgba(255,212,59,.35)`/`.28`; `--anotacao-fundo` `rgba(43,79,224,.06)`; `--halo` `#FFF`/`#0E1120`; `--anotacao-selecionada` `#151A33`/`#E8EBF7`. Contrastes do desenho proposto: branco sobre cobalto 6,37; escuro 5,94; cobalto sobre amarelo a 35% ~5,3; grafite sobre amarelo a 35% ~5,5.

Export (PDF, papel, p&b):
- Não depender de cor: disco escuro com número claro, destaque em moldura, seta com ponta cheia, área clicável tracejada.
- `print-color-adjust: exact` nos selos e destaques, senão o Chromium zera o fundo e o número branco some.
- Halo de 3 px no print; número do marcador no mínimo 13 px (11 px hoje fica ilegível em A4).
- Legenda com `break-inside: avoid` junto da imagem.
- Área clicável não clica fora do leitor: mostrar o destino ("→ p. Cuidados") no rótulo ou na legenda.

## Mudanças de interação do editor

1. Barra de ferramentas com rótulo visível ao lado do ícone ("Marcador  M"); o ícone `#` não diz nada. Um primário só: "Salvar marcações".
2. Lista lateral com o mesmo selo da imagem, e seleção nos dois sentidos (hoje clicar na lista só destaca a linha).
3. Campo de descrição com foco automático ao criar o marcador; marcador sem texto aparece como "falta descrição" na lista.
4. Teclado: setas movem 1 px (Shift 10), Tab percorre as marcações, Esc desseleciona. Tecla de uma letra por ferramenta já existe (`TOOL_KEYS`).
5. Alças de 24 px e faixa de clique da seta de 20 px; o selo inteiro do marcador é clicável.
6. Botão "Marcar imagem" visível ao passar o mouse ou focar a imagem, não só dentro do popover do texto alternativo.
7. Sai o ícone de link do desenho da área clicável.

Os itens 1, 2, 5 e 6 são interface pura; 3 e 4 são lógica. Nenhum muda o formato em disco.

---

## Referências e opções (discovery)

Data: 2026-11-03. Rascunho de discovery. Não mexe em código nem em ticket.

## O problema

Quem escreve um manual no Studio põe marcadores, destaques, setas e áreas clicáveis sobre um print que veio de fora. Hoje o resultado parece pouco cuidado, e a pessoa percebe isso no Studio e no HTML/PDF exportado. Sem a marcação bonita, o print vira "mais uma imagem" e a pessoa do outro lado não sabe onde olhar.

Quem tem o problema: a pessoa que monta e revisa o manual, e quem lê o PDF (muitas vezes impresso, às vezes em preto e branco).

## Estado atual (lido no código)

- Marcador: círculo tracejado de 32 px mais um badge numerado de 20 px deslocado em -12 px, com anel branco (`annotationCss.ts`, `.mk`). São duas formas para dizer uma coisa só.
- Destaque: `multiply` de `#FFD43B` a 100% mais borda de 2 px (`.hl`).
- Seta: 3,5 px cobalto com halo branco, ponta triangular fechada (`arrowShape`).
- Área clicável: contorno tracejado com fundo leve.
- Legenda: números em círculo, com marcadores sem texto agrupados numa linha "Sem descrição" (`legendRows`).
- Ferramentas no Studio: Marcador, Destaque, Seta, Área clicável, por botão; Delete exclui e Ctrl+Z desfaz. Há atalho de uma letra por ferramenta (`TOOL_KEYS`) e alças de 12 px nos cantos do item selecionado; falta teclado nas marcações e alvo de 24 px.
- Formato: `assets/<imagem>.json`, versão 1, coordenadas de 0 a 1. `parseAnnotations` monta um objeto novo só com os campos que conhece. Campo desconhecido não passa por ele: some na primeira gravação.
- Não existe retângulo só de contorno, nem ocultar dado sensível.

## Referências

Só entra o que tem fonte. Onde a fonte não detalha, está marcado como hipótese. As ferramentas servem de estudo de princípio, não de texto de produto.

| Ferramenta | O que faz bem | O que levar |
|---|---|---|
| Scribe | Captura cada clique com captura de tela e texto gerado; tem destaques, indicadores de clique e redação com Smart Blur nos planos pagos ([fast.io](https://www.fast.io/resources/scribe-ai-review-2026.md), [Scribe](https://scribe.com/library/scribe-vs-tango)). Detalhe visual do marcador: não confirmei (hipótese). | Ocultar dado sensível é parte do fluxo, não extra. |
| Tango | Recorta o print e realça o elemento do passo; o guia sai numerado ([teachfloor](https://www.teachfloor.com/blog/best-scribe-alternatives), [dubble](https://dubble.so/compare/scribe-vs-tango-vs-guidde)). Desfoque automático parece restrito ao plano Enterprise ([Trainn](https://trainn.co/blog/scribe-vs-tango/)). | Um realce por passo, no elemento certo, e o resto do print quieto. |
| Guidde | Sem fonte própria encontrada nesta busca. Marcado como lacuna. | Nada a levar sem fonte. |
| Snagit | Ferramenta Passo: números ou letras em sequência, com forma, opacidade, sombra e "reiniciar sequência"; clique direito edita o valor ([TechSmith](https://www.techsmith.com/learn/tutorials/snagit/step/)). Tem Seta, Chamada, Desfoque e, no Mac, Spotlight que escurece o entorno ([lista de ferramentas](https://www.techsmith.com/learn/tutorials/section/snagit/snagit-tools/)). | Numeração automática com reinício e edição do valor. Spotlight como alternativa ao destaque. |
| CleanShot X | Seta com 4 estilos, contador, marca-texto, pixelate (com aleatoriedade "para mais segurança") e blur ([página de recursos](https://cleanshot.com/features)). Atalhos de letra por ferramenta, mas as fontes divergem entre si ([Alchemists](https://alchemists.io/articles/clean_shot/), [Pie Menu](https://www.pie-menu.com/shortcuts/cleanshot)). | Troca de ferramenta por tecla de uma letra. Pixelate com ruído é mais seguro que desfoque simples. |
| Shottr | Contador numerado, marca-texto, spotlight, setas curvas desde a v1.9, desfoque que age só no texto, B para desfocar, teclas 1-9 para opacidade ([Podfeet](https://www.podfeet.com/blog/2023/05/shottr/), [Bitdoze](https://www.bitdoze.com/shottr-mac-screenshot-tool/), [screensnap.pro](https://www.screensnap.pro/documentation/annotation-tools)). | Opacidade em poucos degraus, sem controle contínuo. Seta curva existe, mas não é o essencial. |
| Markup do macOS (Pré-visualização) | Alças azuis redimensionam, alças verdes alteram a forma; o Esboço troca o traço livre por forma reconhecida; formas têm espessura, borda e preenchimento; linha vira seta no estilo ([Apple](https://support.apple.com/guide/preview/prvw1501/11.0/mac/26), [MacMost](https://macmost.com/20-creative-tips-for-using-mac-markup-tool-shapes.html)). | Seleção com alças claras. Poucas propriedades expostas. |
| Skitch | Seta que segue a direção do arrasto, formas (retângulo, círculo, linha), marca-texto amarelo, pixelate sem controle de espessura, cinco selos fixos ([Softpedia](https://www.softpedia.com/reviews/mac/Skitch-Review-300991.shtml), [iClarified](https://www.iclarified.com/35541/skitch-update-reintroduces-maps-to-the-picker-view-lets-you-clear-all-annotations-open-in-crop)). Sem manutenção, estado do pixelate contraditório entre fontes. | Poucas ferramentas e ordem previsível. Pouca variedade vira limite quando o manual cresce. |
| Guias de documentação | Cor não pode ser o único sinal; use rótulo, forma ou padrão ([CU Boulder](https://www.colorado.edu/digital-accessibility/resources/accessibility-fundamentals/visual-style), [Keene](https://libanswers.keene.edu/faq/439735)). Em documentação impressa, chamadas numeradas ligadas a uma tabela funcionam sem cor ([exemplo Wonderware](https://industrialmonitordirect.com/blogs/knowledgebase/wonderware-intouch-display-annotation-documentation-method)). Poucas marcações por print; se precisar de muitas, divida em prints. | O número carrega o sentido. A cor só reforça. |

Lacunas desta pesquisa, para não virar certeza depois:

- Nenhuma fonte descreve o ponto de ancoragem ou a cauda do marcador em Scribe, Tango ou Guidde. O que segue sobre pino com cauda vem de decisão de design, não de cópia.
- Não achei atalhos confirmados de Snagit, Shottr ou Skitch. Os de CleanShot divergem entre fontes.
- Nenhuma fonte trata de PDF ou preto e branco para esses produtos. O que diz respeito a impressão abaixo é inferência a ser testada no export do Explicaí.

## Princípios

1. O número é o sinal; a cor reforça. Marcador sólido, número grande, contraste alto, legível em cinza.
2. Um marcador é uma forma só. O disco numerado já basta, sem círculo tracejado por baixo.
3. A marcação aponta e não cobre. O ponto de ancoragem fica no alvo e o disco pode ficar ao lado, ligado por uma cauda curta.
4. Realce deixa o texto lido. Marca-texto translúcido que deixa o print aparecer por baixo; borda fina só para quando o fundo é escuro.
5. Seta curta, grossa o bastante, ponta fechada, halo fino contra qualquer fundo. Curva e estilos ficam para depois.
6. Poucas ferramentas, previsíveis. Tecla de uma letra para trocar, alças para ajustar, Delete e Ctrl+Z que já existem.
7. Dado sensível precisa de cobertura sólida, e a cobertura precisa estar nos pixels, não só sobre eles (ver riscos).

## Encaixe

Marca (`docs/marca-resumo.md`): cobalto `#2B4FE0` para números e setas, marca-texto `#FFD43B` só em conteúdo realçado, "arredondado só no ícone, nos prints e nos marcadores", área clicável tracejada. Tudo isso já vale; a mudança é de acabamento, não de paleta.

- Disco cobalto sólido com número branco em JetBrains Mono, anel branco de 2 px. Ponto de partida de tamanho: 24 px (hoje o badge tem 20 px dentro de um círculo de 32 px). Medir no print real antes de fixar.
- Contraste do branco sobre `#2B4FE0` passa de 4,5:1, mas conferir com o valor medido no CSS final. No tema escuro o cobalto muda para `#7088FF` e o texto do número precisa trocar para nanquim.
- Em escala de cinza o cobalto sólido vira um cinza escuro e o amarelo vira cinza claro. O número em branco sobre disco escuro lê bem; o destaque só funciona se mantiver o texto de baixo escuro (multiply ou opacidade, nunca amarelo opaco).
- Destaque: baixar a opacidade (ponto de partida 0,35 a 0,5) e testar `mix-blend-mode` no PDF do Chromium. Hipótese: o PDF pode achatar a mistura. Se achatar, cair para cor com opacidade simples, que o PDF guarda como transparência.
- Seta: 4 px em vez de 3,5, conforme a crítica de design.
- Área clicável: segue tracejada e cobalto, mas sem o ícone de link em cima do print no export. No PDF/impresso não clica; no HTML o cursor e o foco já dizem. Decisão visual fica com o agente de design.
- Legenda: marcador sem descrição não precisa de linha "Sem descrição" no manual exportado. A pessoa lê o número no print e o texto do passo explica. O Studio avisa na checagem do manual que falta descrição.

Formato em disco (`manual-format.md`, versão 1): o corte mínimo não muda nada nele. As coordenadas continuam em 0..1, o marcador continua guardando só `x`, `y`, `n`, `label`. A cauda é desenho; sua direção sai de uma regra (ex.: o disco sobe e vai para o lado com mais espaço), não de dado guardado.

Export (`annotationCss.ts`, `annotationShapes.ts`): o CSS e as funções existem nas duas cópias (core e web); `test/annotation-shapes.test.ts` garante que dão o mesmo resultado. Mudou desenho em um lado, muda no outro, e o teste cobre isso. O CSS do export é o mesmo do PDF, então o corte mínimo vale para HTML e PDF juntos.

## Opções

| | O que a pessoa ganha | Tamanho | Mexe no formato? | Riscos | Fica de fora |
|---|---|---|---|---|---|
| A. Acabamento visual | Marcador de uma forma só (disco sólido com cauda), destaque translúcido, seta e área clicável mais discretas, legenda sem a linha "Sem descrição". Igual no Studio e no HTML/PDF. | P a M | Não | `multiply` achatado no PDF (testar); manter as duas cópias de `annotationShapes` iguais; contraste no tema escuro. | Retângulo só contorno, desfoque, atalhos, alças. |
| B. A + ferramentas | A, mais atalho de uma letra por ferramenta, alças de redimensionar nos destaques e áreas, renumerar marcadores ao apagar, retângulo de contorno via campo opcional `style: "outline"` no destaque. | M | **Sim, aditivo e opcional** (campo novo em `highlights`). Arquivo antigo continua válido. Leitor antigo descarta o campo e vê um destaque cheio. | Campo novo precisa passar por `parseAnnotations` e pelo núcleo do MCP; gravar em versão antiga perde o campo (ver nota). | Desfoque, setas curvas, cor por marcação. |
| C. B + ocultar dado | Retângulo opaco "ocultar" que é gravado nos pixels de uma cópia da imagem. | G | **Sim**, `redactions[]` mais regra de qual arquivo vale. É decisão da pessoa. | Sobreposição só visual deixa o dado no PNG original e no `exportacao/html/assets/`. Gravar pixel muda "o print vem de fora" e o par imagem/JSON. Teste de lixeira e imagens sem uso mudam junto. | Desfoque estilizado, detecção automática de dado. |

Nota sobre formato: `parseAnnotations` monta um objeto novo só com os campos que conhece, então qualquer campo novo precisa entrar nele ao mesmo tempo que no tipo `Annotations`. Isso vale em B e C. Em A não há campo novo.

## Corte mínimo recomendado

Opção A. Resolve a queixa ("é feio") sem tocar no formato nem no MCP. Depois de usar uns manuais reais, a próxima fatia (B) se justifica se a pessoa trocar de ferramenta toda hora com o mouse ou pedir caixa só de contorno. C só entra se alguém precisar de dado oculto, e aí vira outra discovery.

O que observar depois: se as pessoas somam mais de 6 ou 7 marcadores por print (sinal de que a numeração e a legenda precisam de ajuste); se o PDF em cinza continua legível; se marcador sem descrição aparece muito.

### Escopo

1. Marcador: um disco cobalto sólido com número branco em mono, anel branco, cauda curta apontando para `(x, y)`. Sem círculo tracejado. Tamanho de partida 24 px (confirmar no print real).
2. Destaque: fundo `#FFD43B` a 35% sem `multiply` (tira de saída a incerteza do PDF) e contorno de 2 px `#E0A800`.
3. Seta: 4 px (a crítica de design mediu a atual como fina), ponta cheia, halo de 1 px; proporção ajustada em seta curta.
4. Área clicável: segue tracejada; remover o ícone de link do desenho no export (a decidir com o design).
5. Legenda: um marcador por linha, selo de 24 px; no export, marcador sem texto não gera linha "Sem descrição".
5b. Alvos de 24 px nas alças e na faixa de clique; `print-color-adjust: exact` nos selos e destaques.
6. Tema escuro: número em nanquim sobre `#7088FF`, anel conforme o fundo.
7. Mesmo desenho no Studio (`AnnotationOverlay`, `AnnotationLegend`) e no export (`annotationCss.ts`); `annotationShapes` nas duas cópias.

### Critérios de aceite

- Marcador tem uma forma só: não existe círculo tracejado nem badge deslocado.
- O ponto de ancoragem (`x`, `y`) cai no alvo; o disco não cobre o elemento apontado quando há espaço ao redor.
- Contraste do número contra o disco é pelo menos 4,5:1 nos temas claro e escuro, medido por script.
- O texto de baixo do destaque continua legível: contraste do texto escuro sobre a área realçada pelo menos 4,5:1 medido em uma imagem de teste.
- Exportar para PDF e conferir em escala de cinza: números legíveis e destaque não esconde o texto. Se `mix-blend-mode` não sobreviver ao PDF, o fallback com opacidade está implementado.
- O Studio e o HTML exportado desenham a mesma marcação (conferência visual em um print de exemplo, mais o teste `annotation-shapes` verde).
- Manual sem nenhum marcador sem descrição continua com legenda igual; o com marcadores sem descrição não mostra "Sem descrição".
- `assets/<imagem>.json` antigo abre e exporta sem mudança; nenhum arquivo é regravado só por abrir.
- `npm run check` passa. Teste de interface cobre o marcador e o destaque em um print.
- Foco visível e área de clique do marcador não encolhe abaixo de 24 px no Studio (WCAG 2.2, alvo mínimo).

### Fora de escopo

A fatia de interação (rótulos na barra, seleção nos dois sentidos, foco automático na descrição, teclado nas marcações, descoberta do botão) vem logo depois do corte mínimo, como fatia própria.

- Qualquer mudança no formato em disco (`version`, campos novos).
- Retângulo só de contorno, atalhos de letra, alças, renumeração automática.
- Desfoque, pixelate, ocultar dado.
- Seta curva, cor por marcação, selos, texto livre sobre o print.
- Mudar paleta ou fontes.

### Riscos

- Mistura de cor no PDF: testar cedo, antes de ajustar o resto.
- Duas cópias de `annotationShapes`: manter iguais.
- A cauda do marcador precisa de uma regra de direção simples; se o marcador ficar na borda da imagem, a regra tem que manter o disco dentro do print.
- Legenda sem "Sem descrição" esconde uma lacuna do manual no export; o aviso tem que existir na checagem do Studio.

## Perguntas para a pessoa

1. O marcador deve ficar sobre o alvo (como hoje) ou ao lado, com cauda? Recomendo ao lado com cauda, porque o disco cobre o botão que o passo explica. O design propôs disco centrado no alvo, mais simples; as duas leituras ficam abertas até a pessoa ver o desenho.
2. A linha "Sem descrição" some do export? Recomendo que sim, e a checagem do Studio passa a avisar.
3. Ocultar dado sensível entra agora ou numa discovery própria? Recomendo própria: exige gravar pixel, e isso mexe em "o print vem de fora".
4. Retângulo só de contorno vale a opção B ou espera o uso real? Recomendo esperar.
5. Aceita fixar o disco em 24 px depois de medir num print real, em vez de 32? Recomendo medir primeiro.

## Fontes

Todas acessadas em 2026-11-03. Os blogs de comparação têm interesse comercial; foram usados só para fatos de recurso e marcados onde divergem.

- Scribe: [fast.io](https://www.fast.io/resources/scribe-ai-review-2026.md), [scribe.com](https://scribe.com/library/scribe-vs-tango)
- Tango: [teachfloor](https://www.teachfloor.com/blog/best-scribe-alternatives), [dubble](https://dubble.so/compare/scribe-vs-tango-vs-guidde), [Trainn](https://trainn.co/blog/scribe-vs-tango/)
- Snagit: [Step](https://www.techsmith.com/learn/tutorials/snagit/step/), [ferramentas](https://www.techsmith.com/learn/tutorials/section/snagit/snagit-tools/)
- CleanShot X: [recursos](https://cleanshot.com/features), [Alchemists](https://alchemists.io/articles/clean_shot/), [Pie Menu](https://www.pie-menu.com/shortcuts/cleanshot)
- Shottr: [Podfeet](https://www.podfeet.com/blog/2023/05/shottr/), [Bitdoze](https://www.bitdoze.com/shottr-mac-screenshot-tool/)
- Markup do macOS: [Apple](https://support.apple.com/guide/preview/prvw1501/11.0/mac/26), [MacMost](https://macmost.com/20-creative-tips-for-using-mac-markup-tool-shapes.html)
- Skitch: [Softpedia](https://www.softpedia.com/reviews/mac/Skitch-Review-300991.shtml), [iClarified](https://www.iclarified.com/35541/skitch-update-reintroduces-maps-to-the-picker-view-lets-you-clear-all-annotations-open-in-crop)
- Acessibilidade e documentação: [CU Boulder](https://www.colorado.edu/digital-accessibility/resources/accessibility-fundamentals/visual-style), [Keene](https://libanswers.keene.edu/faq/439735)

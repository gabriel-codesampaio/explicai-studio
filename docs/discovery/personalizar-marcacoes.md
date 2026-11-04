# Personalizar marcações da imagem: o que, onde e quanto

Data: 2026-11-04. Discovery. Sem código, sem ticket, sem commit. Complementa [marcacao-de-imagem](./marcacao-de-imagem.md) e [T-133](../tickets/T-133-decisoes-da-marcacao-de-imagem.md); não repete nem muda a direção visual de lá (disco cobalto, caneta azul + marca-texto, marcador ao lado com cauda).

Pedido da pessoa: "adicionar personalização dessas ferramentas, tá tudo azul e borda; personalização dos marcadores".

## O problema

Quem monta o manual quer marcação que se distinga ou combine com o print (print azul + marcador azul some) e hoje não escolhe nada: marcador e seta são azuis com halo branco, destaque tem borda amarela. Quem lê (tela, papel, PDF em p&b) precisa continuar vendo a marcação.

Sinal importante: "tá tudo azul e borda" é em parte queixa do acabamento, que o T-133 e a discovery anterior já tratam. Personalizar não deve virar remendo para um desenho que ainda vai mudar. Ordem certa: acabamento primeiro, personalização depois.

## O que já existe (lido no código)

- **Cor por manual já existe.** `theme.accent` e `theme.highlight` (manual-format.md, tabela do tema; Studio: diálogo de exportação, "Cores do manual", `ThemeFields.tsx`) alimentam `--anotacao`, `--anotacao-fundo` e `--marca` no export (`theme.ts:142`). Marcador, seta e área clicável usam o `accent`; o destaque usa o `highlight`. O `accent` passa por `MIN_CONTRAST` 4,5:1 contra branco (`readable`); o `highlight` passa por 4,5:1 do texto sobre o realce (`mergeTheme`, `theme.ts:122`). O Studio em si fica sempre no cobalto.
- Ou seja: trocar "o azul" do manual inteiro já é possível, mas quem pede não sabe, porque está no diálogo de exportação e se chama "destaque"/"realce", não "marcações".
- Formato (`assets/<imagem>.json`, versão 1): marcador `{id,n,x,y,label?}`, destaque `{id,x,y,w,h}`, seta `{id,from,to}`, área `{id,x,y,w,h,target}`. Campo opcional já tem precedente: `display` na raiz, ignorado se inválido (`parseAnnotations`). `parseAnnotations` reconstrói objeto só com campos conhecidos: campo novo precisa entrar no tipo e no parser juntos, senão some na primeira gravação.
- CSS do export em `annotationCss.ts` (espessura, tamanho e halo fixos), duas cópias de `annotationShapes` (core e web) com teste de igualdade.
- MCP `annotate_image` (explicai-mcp, README): grava só o JSON (marcadores, destaques, setas, áreas), em 0..1 ou pixels. Não renderiza print; o desenho sai no export. Não há campo de estilo.
- `print-color-adjust` não aparece no CSS do export; o `@media print` só mexe em quebras e na área clicável.

## O que personalizar

| Propriedade | Vale? | Motivo |
|---|---|---|
| Cor | Sim, em poucos degraus | É o pedido central. Paleta curta da marca; ver contraste. |
| Borda / halo | Parcial: claro/escuro ou nenhum | Halo existe por contraste contra qualquer fundo. Deixar tirar degrada legibilidade. |
| Espessura da seta e do contorno | Sim, 3 degraus (fina, normal, grossa) | Print de 766 px e de 1920 px pedem traço diferente. |
| Tamanho do marcador | Sim, 3 degraus (P 20, M 24, G 32 px), mínimo 24 no alvo de clique | Medição do T-133 ainda manda no padrão. |
| Estilo | Pouco: destaque preenchido x só contorno; seta sólida x tracejada | Contorno já está na lista "espera uso real" do T-133. Não é o primeiro corte. |
| Numeração | Não agora | Número é o sinal (princípio 1). Renumeração automática e letras (A, B) são outro assunto. Snagit tem, mas é ferramenta de captura. |
| Opacidade do destaque | 2 degraus no máximo | Shottr usa 1-9 (ver abaixo); aqui o contraste do texto de baixo limita. |

## Escopo: onde a escolha vive

| Nível | Prós | Contras |
|---|---|---|
| Por marcação | Controle total. | Muda formato em todos os 4 tipos; a pessoa decide marcador por marcador; manual fica inconsistente. |
| Por imagem | Resolve "este print é azul". Um campo na raiz, como `display`. | Meio-termo; repete decisão em cada print. |
| Por manual | Já existe para cor (`theme`). Consistência. Zero formato novo. | Não resolve "este print específico". |
| Padrão global do Studio | Útil para quem faz vários manuais. | Não vai para o export; o manual precisa carregar a escolha. Fora. |

Leitura: o por manual já cobre cor. Falta (a) torná-lo visível como "cor das marcações" e (b) um ajuste por imagem para o caso do print azul. Por marcação só vale se aparecer uso real.

## Como salvar sem quebrar manual antigo

Regra: campo opcional, ausente = aparência atual do T-133; valor inválido é ignorado (igual `display`), nunca derruba o arquivo.

Proposta (só se a opção B ou C for aprovada):

```json
{ "version": 1, "display": "m",
  "style": { "color": "ink", "size": "m", "stroke": "m" },
  "markers": [...], ... }
```

- `style` na raiz do arquivo da imagem, todos os campos opcionais. `color`: chave de uma paleta fechada (`cobalt`, `ink`, `red`, `green`, `purple`, `orange`), não hex. Chave é validável, deriva o contraste certo para claro/escuro e o p&b, e o manual muda de paleta sem reescrever JSON.
- `version` continua 1: o campo é aditivo, e leitor antigo descarta (a marcação aparece no padrão, nada se perde). Gravar em leitor antigo perde o `style`; é o mesmo risco que o `display` já tinha e foi aceito.
- Por marcação (`marker.color` etc.) fica fora; se vier, é o mesmo padrão, um campo opcional por tipo.
- Teste: arquivo sem `style` exporta idêntico ao de hoje; `style` inválido é ignorado; `parseAnnotations` preserva `style` ao regravar (o ponto onde `display` já foi bug em potencial).
- Edição do JSON na mão ou pelo Agent: documentar em `manual-format.md` junto com `display`.

## HTML, PDF, Markdown e MCP

- **HTML e PDF**: o PDF é o HTML impresso. Se o estilo vira variáveis CSS (`--anotacao`, `--marca`, `--marca-espessura`, `--marcador`) escritas no `.frame` da imagem (ou classe), um desenho só vale para os dois. É o caminho de menor risco: o CSS já usa variáveis.
- **Studio**: `AnnotationOverlay` e `AnnotationLegend` leem as mesmas variáveis. Duas cópias de `annotationShapes` seguem iguais; espessura entra como parâmetro nas funções de forma (seta), e o teste cobre as duas.
- **Markdown exportado**: legenda em texto, sem cor. Nada muda.
- **MCP `annotate_image`**: hoje grava só geometria e não gera imagem. Para refletir, ganha o campo opcional `style` (mesma paleta de chaves, enum no schema, custo de tokens baixo) e `get_manual`/leitura devolve o `style` existente. O agente que não passa `style` mantém o que a pessoa escolheu: regrava sem apagar (mesma regra do `display`). Sugestão: o prompt de captura não ganha instrução nova; o agente só usa `style` se a pessoa pedir.
- Se um dia o MCP renderizar print anotado, o estilo precisa estar no desenho (SVG/canvas) com os mesmos tokens. Hoje não existe, então fora.

## Contraste e acessibilidade

- **O que o código já garante:** `accent` ≥ 4,5:1 contra branco, `highlight` com texto escuro ≥ 4,5:1. O número branco dentro do disco usa `--sobre-anotacao`.
- **Cor livre é o risco:** hex livre por imagem pode reprovar contra o print (nenhuma cor passa em todo fundo, por isso o halo), contra o número branco do disco, e some em p&b. A regra do manual (`readable`) cobre branco; não cobre o fundo do print, que é imprevisível.
- **Recomendo paleta fechada de 5 a 6 chaves**, cada uma com par claro/escuro e `sobre` pré-calculado, todas ≥ 4,5:1 contra branco e com luminância espaçada para virarem cinzas distintos (cobalto e preto-azulado sempre escuros; destaque amarelo sempre claro com contorno escuro). Os valores exatos são trabalho do design e devem ser medidos por script no `check`, nunca declarados de memória.
- **Cor nunca é o único sinal:** número (marcador), ponta cheia (seta), moldura (destaque), tracejado (área) seguem iguais para qualquer cor. Cor escolhida só reforça. Isso é o que salva o PDF em p&b, e vale como critério de aceite.
- **Cor livre só no tema do manual** (`accent`, que já tem a trava `readable`). Por imagem, só paleta.
- `print-color-adjust: exact` nos selos e destaques já é item do T-133; sem ele, qualquer cor escolhida some no PDF.
- Alvo de 24 px segue como piso no Studio, qualquer tamanho escolhido. G é só maior.

## Encaixe na marca

A marca já diz: cobalto nos números e setas, `#FFD43B` só em conteúdo realçado, tracejado na área clicável. Personalização é um desvio controlado da marca, por isso:

- O padrão continua sendo a marca. Quem não toca em nada exporta como hoje.
- Paleta curta e nomeada (não seletor de cor) mantém o resultado dentro do "caneta e marca-texto". Seletor de cor livre convida ao arco-íris.
- O Studio continua cobalto e sóbrio. O controle em si usa o visual de controle comum (amostras pequenas, rótulo em texto), sem cor decorativa. As amostras mostram as cores das marcações porque é o dado, não enfeite.
- O manual de marca (`Manual/brand/discovery/90_SYNTHESIS.md`) não foi relido para este discovery: a ideia não mexe em voz nem posicionamento.

## Concorrentes de marcação (curto)

Só o que muda a decisão. Fontes acessadas via os links da discovery anterior; nada novo foi verificado nesta data além do que já está citado lá.

- **Snagit, Passo/Step**: forma, opacidade, sombra e reinício da sequência são editáveis ([TechSmith](https://www.techsmith.com/learn/tutorials/snagit/step/)). Mostra que numeração e forma são propriedades, mas é ferramenta de captura com painel de propriedades; o Explicaí é editor de manual.
- **CleanShot X**: seta com 4 estilos, contador, marca-texto ([recursos](https://cleanshot.com/features)). Estilo de seta é a personalização mais comum. Em ferramenta de captura, cor costuma vir de uma amostra curta, não de seletor livre (hipótese, não confirmei o painel).
- **Shottr**: opacidade em teclas 1-9 ([Podfeet](https://www.podfeet.com/blog/2023/05/shottr/)). Lição: degraus discretos, não controle contínuo.
- Scribe e Tango: não achei fonte sobre cor ou tamanho do marcador (hipótese: oferecem pouca ou nenhuma). Se isso for verdade, personalização mínima já diferencia o Explicaí; não afirmar sem checar.
- Nenhuma dessas fontes trata de PDF em p&b. É inferência a testar no export.

## Opções

| | Ganho | Tamanho | Mexe no formato? | Tocados | Riscos | Fora |
|---|---|---|---|---|---|---|
| A. Tornar visível o que existe | A pessoa muda a cor de todas as marcações do manual, no lugar onde espera. Rótulo "Cor das marcações" no diálogo de exportação ou em Aparência do manual, com prévia em um print. Dica de que cor é o `accent` do manual. | P | Não | `ThemeFields.tsx`, i18n | Cor do `accent` também muda links e passos (acoplado hoje); a pessoa pode querer só as marcações. | Qualquer ajuste por imagem, tamanho, espessura. |
| B. A + estilo por imagem | A, mais um `style` opcional por imagem: cor da paleta (6 chaves), tamanho do marcador (3) e espessura (3). Studio: painel "Aparência" no diálogo de edição. MCP lê/preserva e aceita `style`. | M | Sim, aditivo e opcional na raiz do JSON | `types.ts`, `annotations.ts`, `annotationCss.ts`, `annotationShapes` x2, `AnnotationEditor`, `AnnotationOverlay`, `manual-format.md`, MCP `annotate_image`, testes | Duas cópias de forma; PDF em p&b; paleta ≥ 4,5:1 medida; interação com o redesenho do T-133 (fazer depois dele). | Por marcação, hex livre, estilo de seta, numeração, padrão global. |
| C. B + por marcação | Marcador A vermelho, B azul na mesma imagem; mais estilo de seta e contorno. | G | Sim, campos em 4 tipos | tudo de B, mais mover, legenda, seleção, lista | Manual incoerente, legenda precisa mostrar cor, mais combinações para testar em p&b. | Cor livre e padrão global. |

## Recomendação: corte mínimo

Opção A agora, B depois do T-133. Por quê:

- O pedido tem duas metades: "tá tudo azul e borda" (acabamento, que o T-133 já cobre e deve vir antes) e "personalizar" (A resolve cor de graça, sem formato).
- Desenhar `style` antes do T-133 fecha valores (tamanho do disco, espessura) que ainda estão em medição.
- A tem risco quase zero e mostra se alguém realmente quer mudar a cor. Se mudarem a cor do manual e ainda reclamarem do print azul, B se justifica.

Observar depois de A: se mexem em `accent` por causa das marcações (e não só do tema); se o pedido volta como "só neste print"; quantas queixas de contraste no print; se alguém exporta em p&b.

## Perguntas para a pessoa

1. Quer cor das marcações separada da cor de destaque do manual (links, passos)? Hoje é a mesma. Recomendo separar só se for em B; em A, avise na tela que é a mesma.
2. Personalização é por manual, por imagem ou por marcação? Recomendo por manual agora e por imagem depois; por marcação não.
3. Cor livre (hex) ou paleta fechada? Recomendo paleta fechada de 5 a 6 cores nas marcações; hex livre só no tema do manual, que já tem trava de contraste.
4. Tamanho e espessura entram junto? Recomendo esperar o T-133 medir o disco em print real; depois 3 degraus.
5. Quer que o MCP escolha estilo? Recomendo que só leia e preserve, e use `style` quando a pessoa pedir.
6. Fica fora: numeração em letras, estilo de seta, contorno só. Concorda? Recomendo sim; contorno já espera uso real no T-133.

## Rascunho de spec (opção A, para o supervisor)

**Escopo**
- Na tela de cores do manual (diálogo de exportação, `ThemeFields.tsx`), renomear/agrupar o controle do `accent` para deixar claro que ele cobre as marcações (marcador, seta, área clicável) além de links e passos, e o do `highlight` que cobre o destaque.
- Prévia: miniatura de um print com um marcador, uma seta e um destaque desenhados com as cores escolhidas (mesma função de forma do export).
- Nenhuma mudança em `annotations.json`, `FORMAT_VERSION`, MCP ou export.

**Critérios de aceite**
- [ ] A pessoa troca a cor das marcações no Studio sem abrir o JSON; o HTML e o PDF exportados usam a cor escolhida.
- [ ] Cor sem contraste 4,5:1 contra branco continua rejeitada com a mensagem de hoje.
- [ ] Manual sem `theme` exporta idêntico ao de hoje.
- [ ] Texto da tela e do `manual-format.md` dizem quais elementos cada cor muda.
- [ ] Teste de interface: trocar cor, exportar HTML, conferir a cor do marcador.

**Riscos**
- `accent` também muda links e passos; deixar claro na tela. Separar exigiria campo novo no tema (formato).
- Rótulos em pt e en (`i18n.en.ts`).

**Fora**: tudo da opção B; qualquer campo novo.

## Rascunho de spec (opção B, para depois do T-133)

**Escopo**: `style` opcional na raiz de `assets/<imagem>.json` (`color`, `size`, `stroke`, valores de lista fechada); `parseAnnotations` valida e ignora o inválido; CSS por variáveis no `.frame`; painel "Aparência" no editor; `annotate_image` aceita e preserva; `manual-format.md` documenta.

**Critérios de aceite**
- [ ] Arquivo sem `style` abre e exporta igual ao de hoje; abrir não regrava.
- [ ] `style` inválido é ignorado; `style` válido sobrevive a regravar pelo Studio e pelo MCP.
- [ ] Todas as cores da paleta passam 4,5:1 (script) em claro e escuro.
- [ ] PDF em escala de cinza: número, ponta cheia, moldura e tracejado legíveis em todas as cores.
- [ ] Studio e export desenham igual (teste `annotation-shapes` verde nas duas cópias).
- [ ] Alvo de clique ≥ 24 px em qualquer tamanho.
- [ ] `npm run check`, e2e de marcação.

**Riscos**: formato novo (aditivo); duas cópias de forma; leitor antigo descarta `style`; paleta precisa de aprovação do design.

**Fora**: cor livre, por marcação, estilo de seta, numeração, padrão global.

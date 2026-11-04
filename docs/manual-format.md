# Formato do manual em disco

Versão 1. O Studio e o Agent leem e gravam este formato pelo módulo `explicai/core`.

```
meu-workspace/
  financeiro/                  um manual = uma pasta com manual.json
    manual.json                título, idioma e árvore de páginas
    pages/
      cadastrar-cliente.md     uma página = um Markdown com frontmatter
    assets/
      tela-clientes.png        imagem
      tela-clientes.png.json   marcadores, destaques, setas e áreas clicáveis
    .lixeira/                  páginas excluídas, até serem restauradas
    .versoes/                  versões guardadas de cada página
    exportacao/                HTML, PDF e Markdown gerados (pode ir para o .gitignore)
```

## manual.json

```json
{
  "version": 1,
  "title": "Financeiro",
  "language": "pt-BR",
  "pages": [
    { "id": "3f2c…", "file": "pages/visao-geral.md", "children": [
      { "id": "9a1b…", "file": "pages/cadastrar-cliente.md", "published": "2026-10-29T13-02-11-480Z", "children": [] }
    ] }
  ]
}
```

A ordem do array é a ordem das páginas. O título de cada página fica só no frontmatter dela. O campo opcional `theme` guarda a aparência do manual exportado (ver abaixo). Os campos opcionais `cover` e `footer` guardam o texto da capa e do rodapé (ver Capa e rodapé). O campo opcional `published` aponta a versão escolhida para o manual final (ver Versões). O campo opcional `audiences` lista os perfis do manual (ver Público).

### theme

Todos os campos são opcionais e valem só para o HTML e o PDF; o Markdown exportado não muda. Cores em hexadecimal de 6 dígitos (`#2b4fe0`). Manual sem `theme` exporta como antes.

```json
"theme": {
  "text": "#222222",
  "accent": "#0f7a55",
  "highlight": "#ffe066",
  "headings": { "cover": "#000000", "page": "#000000", "h1": "#7a3fc4", "h2": "#000000", "h3": "#000000" },
  "fonts": { "text": "lora", "headings": "playfair-display" },
  "logo": "assets/logo-cliente.png",
  "hideColophon": true
}
```

| Campo | Efeito | Padrão |
|---|---|---|
| `text` | Texto do manual; o texto secundário (legendas, rodapé) deriva dele | `#151a33` |
| `accent` | Links, números dos passos e marcações sobre os prints | `#2b4fe0` |
| `highlight` | Marca-texto: linha da capa, "Resultado:" e destaque das imagens | `#ffd43b` |
| `fonts` | Fonte do texto (`text`) e dos títulos (`headings`), pelo nome da lista abaixo | Atkinson Hyperlegible Next e Archivo |
| `logo` | Logo do cliente, no topo do sumário e na capa do HTML e do PDF | sem logo |
| `hideColophon` | `true` exporta sem o rodapé "Manual feito com o Explicaí Studio" (HTML e PDF). Só aceita `true`; para voltar ao padrão, apague o campo | rodapé aparece |
| `headings` | Cor do título da capa (`cover`), do título da página (`page`) e dos títulos de nível 1 a 3 do editor (`h1`, `h2`, `h3`) | `#000000` |

Fontes empacotadas (todas OFL, copiadas do `@fontsource`; o texto só aceita as que têm itálico):

| Nome | Tipo | Texto | Títulos |
|---|---|---|---|
| `atkinson-hyperlegible-next` (padrão do texto) | sem serifa | sim | sim |
| `inter` | sem serifa | sim | sim |
| `source-sans-3` | sem serifa | sim | sim |
| `source-serif-4` | serifada | sim | sim |
| `lora` | serifada | sim | sim |
| `archivo` (padrão dos títulos) | sem serifa, de título | não | sim |
| `montserrat` | sem serifa, de título | não | sim |
| `playfair-display` | serifada, de título | não | sim |

Nome fora da lista é recusado ao gravar. O HTML leva só as fontes escolhidas, mais a de código (JetBrains Mono), cada uma com a licença em `fonts/OFL-<nome>.txt`, e abre sem internet.

### logo

`theme.logo` é o caminho de um arquivo dentro de `assets/` (`assets/logo-cliente.png`): sem pasta no meio, sem `..`, sem barra invertida. Só PNG, JPG ou SVG, até 1 MB. O core confere o caminho, o tipo e o tamanho ao gravar (Studio e MCP) e recusa com o motivo (`logo-path`, `logo-type`, `logo-size`, `logo-missing`). Campo opcional: manual antigo, sem `logo`, segue válido e exporta como antes.

No export o arquivo é copiado para `assets/` ao lado do `index.html` e entra por `<img>` (o SVG não roda script) na capa e no topo do sumário. O tamanho na capa tem teto (96 px de altura), então um logo grande não estoura a página do PDF. Se o arquivo sumir do disco, o export sai sem logo e avisa. Trocar ou tirar o logo não mexe em cores nem fontes, e mudar cores ou fontes não mexe no logo. O arquivo continua em `assets/` depois de tirar o logo.

O core recusa, ao gravar (Studio e MCP), `text`, `accent` e cada cor de `headings` com contraste menor que 4,5:1 com o branco, e um `highlight` que deixe o texto por cima com menos de 4,5:1. A mensagem diz o contraste atual e o mínimo. Editar um campo mantém os outros.

### Capa e rodapé

`cover` e `footer` são opcionais, ficam na raiz do `manual.json` ao lado de `theme` e valem só para o HTML e o PDF; o Markdown exportado não muda. Manual sem eles exporta como antes, e a `version` do formato continua 1.

```json
"cover": { "subtitle": "Para: Acme", "author": "Time de Finanças", "version": "Versão 2.1", "date": "outubro de 2026" },
"footer": { "text": "Confidencial · Acme", "pageNumbers": true }
```

| Campo | Efeito | Limite |
|---|---|---|
| `cover.subtitle`, `author`, `version`, `date` | Linhas abaixo do título da capa, nessa ordem; campo vazio não deixa espaço. Texto livre: o Studio sugere data e versão, mas nunca preenche sozinho | 120 caracteres cada |
| `footer.text` | Linha no fim do HTML e, no PDF, texto à esquerda no rodapé de cada página (menos a capa) | 100 caracteres |
| `footer.pageNumbers` | `true` põe "n / total" à direita no rodapé do PDF (menos a capa; a capa conta como página 1) | só `true` |

O core (Studio e MCP) recusa texto acima do limite com o motivo (`too-long`) e não grava nada; texto vazio apaga o campo. O texto é escapado no HTML e na string CSS do rodapé. O rodapé por página usa as margens de página do CSS (`@page`), que o Chrome só aceita a partir da versão 131: em Chrome mais antigo o PDF sai sem texto e sem número, com um aviso no resultado da exportação, não erro. O export com público leva a mesma capa e o mesmo rodapé. O Studio edita tudo em Ajustes, Aparência do manual, com prévia.

## Campos desconhecidos

`manual.json` e `assets/*.json` são lidos e regravados inteiros: campo que o Studio não conhece (de uma versão mais nova ou de uma ferramenta externa) volta intacto ao salvar, na raiz, em `theme`, nos nós da árvore de páginas e em cada marcação, destaque, seta e área clicável. Vale para o Studio e para o MCP, que regrava pelo `explicai/core`. Exceção: dentro de `style` (anotações), só os quatro campos conhecidos ficam; valor fora da lista já é descartado. Coberto por `test/unknown-fields.test.ts`. O frontmatter das páginas segue a mesma regra (`extra`).

## Página

```markdown
---
id: 9a1b…
title: Cadastrar cliente
---

1. Clique em **Novo cliente**.

![Tela de clientes](../assets/tela-clientes.png)
```

O nome do arquivo acompanha o título: quando o título muda, o arquivo é renomeado e o `manual.json` é atualizado. O `id` do frontmatter nunca muda, e é ele que as áreas clicáveis usam como destino.

O frontmatter pode ter `status`, a etapa da página no fluxo de aprovação: `revisao`, `aprovado` ou `publicado`. Sem ele, a página é rascunho, e por isso página escrita à mão continua válida. A exportação pode levar só as páginas aprovadas ou publicadas.

Campos do frontmatter que o Studio não conhece (`sources:`, `owner:` ou qualquer outro) voltam intactos quando a página é salva. Comentários YAML não sobrevivem, porque o arquivo é regravado.

### Público

O campo opcional `audience` do frontmatter lista os perfis que veem a página, como `audience: [admin, operador]` (um texto solto vale uma lista de um). Sem o campo, a página vale para todos. A subpágina herda a restrição da mãe: quem não vê a mãe não vê as filhas, e uma filha com `audience` próprio exige as duas condições. O `manual.json` pode ter `audiences`, a lista dos perfis conhecidos (o Studio e o MCP a mantêm a partir das páginas); sem ela, o manual abre e exporta como antes. A lista pode ter um público que nenhuma página cita. Criar, renomear e remover público são ações do Studio (`addAudience`, `renameAudience` e `removeAudience` em `explicai/core`): renomear reescreve a lista e todas as páginas que citam o nome, lixeira incluída, e remover tira o nome de ambas (a página que só tinha esse nome volta a valer para todos). Nomes têm de 1 a 40 caracteres e não repetem outro, ignorando maiúsculas. O formato do `manual.json` e do frontmatter não muda.

Exportar com um público (`exportManual(dir, formato, { audience })`) gera só as páginas que ele vê, em HTML, PDF e Markdown: sem o texto, as imagens, o item do sumário nem o arquivo em `assets/` das páginas de fora. Link ou área clicável para uma página de fora vira texto simples e gera um aviso. Público que nenhuma página cita exporta só as páginas sem restrição, com aviso.

**Público não é controle de acesso.** Os arquivos-fonte (`pages/`, `assets/`, `.versoes/`, `manual.json`) guardam tudo, e quem tem a pasta lê tudo. Só o arquivo exportado é filtrado: entregue ao cliente o export do perfil dele, nunca a pasta do manual.

## Links entre páginas

Um link para outra página do manual é um link Markdown relativo ao arquivo: `[Cadastro](./cadastrar-cliente.md)`, ou `./cadastrar-cliente.md#campos` para uma seção. Todas as páginas ficam em `pages/`, então o caminho é sempre `./nome.md`. Quando uma página é renomeada, os links das outras páginas são atualizados.

## Cor do texto

Um trecho colorido fica como `<span data-color="red">texto</span>`, com o nome de uma cor da paleta: `gray`, `red`, `orange`, `green`, `blue` ou `purple`. Dentro do `span` vale Markdown comum (`**negrito**`). Nome fora da paleta é ignorado pelo editor. No HTML e no PDF cada nome vira uma cor com contraste AA no branco; qualquer outro HTML continua saindo como texto. O Markdown exportado leva só o texto, sem o `span`.

## Marca-texto

Um trecho marcado fica como `==texto==`, na mesma linha, com o `==` colado no texto (nem espaço nem `=` logo depois de abrir ou antes de fechar). Dentro vale Markdown comum (`**negrito**`, `*itálico*`, link). `a == b`, `x===y` e o que está em código ficam como texto. Outros leitores de Markdown mostram os sinais `==` no texto. No HTML e no PDF vira `<mark>` com o amarelo do realce do manual (contraste do texto com ele de pelo menos 4,5:1) e a cor sai na impressão. O Markdown exportado mantém `==texto==`. Atalho no Studio: Ctrl+Shift+H. Não muda o `FORMAT_VERSION`.

## Alertas

Um alerta é uma citação cuja primeira linha é um marcador do GFM, o mesmo que o GitHub desenha:

```markdown
> [!TIP]
> Salve com **Ctrl+S** antes de sair.
```

Os tipos são `[!TIP]` (Dica), `[!WARNING]` (Atenção), `[!CAUTION]` (Erro) e `[!NOTE]` (Nota). O marcador fica sozinho na primeira linha e o corpo é Markdown comum (parágrafos, listas, negrito). Vale também dentro de um passo, recuado como o resto do item, e não se confunde com o "Resultado:", que continua sendo uma citação comum. Outro marcador (como `[!IMPORTANT]`) e a citação sem marcador seguem como citação. Não muda o `FORMAT_VERSION`: para qualquer leitor de Markdown o alerta ainda é uma citação.

No Studio cada tipo tem cor fixa e um ícone; a Nota usa a cor de destaque do manual. No HTML e no PDF o alerta sai como painel com o rótulo em texto (Dica, Atenção, Erro, Nota; Tip, Warning, Error, Note nos manuais em inglês), com contraste AA. O Markdown exportado mantém o marcador. HTML colado dentro do alerta continua saindo como texto.

## Anotações da imagem

`assets/<imagem>.json`. Todas as coordenadas vão de 0 a 1, relativas à largura e à altura da imagem, para funcionarem em qualquer tamanho de tela.

```json
{
  "version": 1,
  "display": "m",
  "markers":    [{ "id": "m1", "n": 1, "x": 0.82, "y": 0.12, "label": "Novo cliente" }],
  "highlights": [{ "id": "h1", "x": 0.10, "y": 0.20, "w": 0.50, "h": 0.08 }],
  "arrows":     [{ "id": "a1", "from": { "x": 0.1, "y": 0.1 }, "to": { "x": 0.2, "y": 0.2 } }],
  "hotspots":   [{ "id": "s1", "x": 0.70, "y": 0.05, "w": 0.20, "h": 0.10,
                   "target": { "type": "page", "pageId": "9a1b…" } }]
}
```

`display` é opcional e guarda o tamanho da imagem na página: `"s"` (Pequena, até 40% da coluna), `"m"` (Média, 70%) ou `"full"` (Larga, 100%). Sem o campo, a imagem aparece como sempre: tamanho natural, limitada à coluna. Nenhum tamanho amplia a imagem acima do natural. Vale para a imagem em todo lugar onde ela aparece, no editor, no HTML e no PDF; o Markdown da página e o Markdown exportado não mudam, e as coordenadas das marcações continuam as mesmas. Valor fora de `s`, `m` e `full` é ignorado. O arquivo pode existir só com `display` (listas vazias). Quem regrava o JSON (o Studio, o Agent) deve manter o campo.

`style` é opcional e guarda a aparência das marcações da imagem: `{ "color": "red", "size": "l", "stroke": "s", "border": "m" }`. Todos os campos são opcionais e valor fora da lista é ignorado (sem nenhum valor válido, o campo some).

| Campo | Valores | Efeito |
|---|---|---|
| `color` | `cobalt` (padrão), `ink`, `red`, `green`, `purple`, `orange` | Cor do marcador, da seta e da área clicável (não do destaque). Cada chave tem par claro/escuro e cor do número, todos com contraste de 4,5:1 ou mais. Sobrepõe a cor de destaque do tema nesta imagem. |
| `size` | `s` (20 px), `m` (24 px, padrão), `l` (32 px) | Diâmetro do disco do marcador. |
| `stroke` | `s`, `m` (padrão), `l` | Espessura da seta e do contorno de destaque e área (0,75, 1 e 1,5 vez a de sempre). |
| `border` | `none`, `s` (1 px), `m` (2 px), `l` (3 px) | Borda de todas as marcações da imagem: anel branco do marcador, halo branco da seta e contorno de destaque e área. `none` tira. O destaque ganha contorno de cor própria, mais escura que o marca-texto, para a espessura aparecer. Sem o campo vale o de sempre. |

Sem `style` a imagem aparece como sempre e o HTML exportado não muda. Número, ponta cheia, moldura e tracejado não dependem da cor. No HTML e no PDF o `style` vira variáveis CSS no `.shot` (`--anotacao`, `--sobre-anotacao`, `--disco`, `--marca-espessura`, `--borda`). `version` continua 1. Quem regrava o JSON (Studio, `annotate_image`) deve manter o campo.

`style` também vale em cada marcador, seta, destaque e área clicável (`markers[].style` etc.) e sobrepõe o da imagem só nos campos que escolheu: item > imagem > tema do manual. Cada tipo guarda só os campos dele; o resto é ignorado e valor fora da lista também (sem nenhum válido, o campo some):

| Tipo | Campos |
|---|---|
| marcador | `color`, `size`, `border` |
| seta | `color`, `stroke`, `border` |
| destaque | `border` (cor e preenchimento do destaque: T-195) |
| área clicável | `color`, `border`, `fill` (`solid`, `soft` padrão, `none`) |

`fill: "none"` junto com `border: "none"` deixaria a área invisível: `border` volta a `s` ao ler. No HTML e no PDF o `style` do item vira as mesmas variáveis CSS no próprio elemento (mais `--preenchimento`), sem JavaScript; o chip da legenda usa a cor do marcador. Sem `style` nos itens o HTML exportado não muda e `version` continua 1. Leitor antigo descarta o `style` do item e mostra a marcação com o estilo da imagem.

Destinos de área clicável: `page` (outra página), `anchor` (seção de uma página) e `url` (só `http`, `https` ou `mailto`).

## Lixeira

Excluir uma página move o arquivo dela (e o das subpáginas) para `.lixeira/<id>/pages/`, junto com um `entry.json` que guarda a posição na árvore. Restaurar devolve tudo ao mesmo lugar. Se o pai também foi excluído, a página volta para a raiz. Se o nome do arquivo foi ocupado nesse meio tempo, ela ganha um nome novo. "Imagens sem uso" move para `.lixeira/imagens-<data>/` as imagens que nenhuma página, versão ou item da lixeira cita, junto com as marcações delas, e as marcações cuja imagem não existe mais. A lixeira não é esvaziada sozinha: dá para apagar a pasta `.lixeira/` à mão ou colocá-la no `.gitignore`.

Uma página pode ficar sem título enquanto é escrita. O arquivo vira `sem-titulo.md` e é renomeado quando o título aparece.

## Versões

"Guardar versão da página" copia a página para `.versoes/<id da página>/<data>.md`. A cópia tem o mesmo formato de uma página, com `savedAt` e `note` (o nome que a pessoa deu, pode ser vazio) no frontmatter:

```markdown
---
id: 9a1b…
title: Cadastrar cliente
savedAt: 2026-10-29T13:02:11.480Z
note: Revisado pelo suporte
---

Texto da página naquele momento.
```

O id da versão é o nome do arquivo sem `.md`. A versão que vai para o manual final se chama "Versão do manual". Quando `published` está no nó da página em `manual.json`, a exportação usa aquela versão. Sem ele, usa o texto atual. Restaurar uma versão troca o texto atual por ela e antes guarda o texto que estava lá como uma versão "Antes de restaurar". As versões acompanham a página na lixeira, porque ficam pelo id.

## Exportação

A exportação lê o manual e grava em `exportacao/`, substituindo a anterior do mesmo formato:

- `exportacao/html/index.html`: o manual num arquivo só, com sumário, uma seção por página e as marcações desenhadas sobre os prints. As imagens usadas vão para `exportacao/html/assets/` e as fontes do manual (com a licença OFL), para `exportacao/html/fonts/`.
- `exportacao/<titulo>.pdf`: o mesmo HTML impresso pelo Chrome, Edge ou Chromium da máquina (ou o navegador em `EXPLICAI_BROWSER`).
- `exportacao/markdown/manual.md`: o manual num Markdown só, para quem lê com IA. Depois de cada print vem a legenda em texto.

Exportar para um público (perfil) grava ao lado, sem apagar os outros: `exportacao/html-<perfil>/`, `exportacao/markdown-<perfil>/` e `exportacao/<titulo>-<perfil>.pdf`. Sem perfil, os nomes acima.

Os títulos do corpo da página saem logo abaixo do título dela, sem pular nível (h2, h3, h4…), tanto no HTML quanto no Markdown. Cada página entra com a Versão do manual (a versão apontada por `published`) ou, sem ela, com o texto atual. Página com arquivo apagado fica de fora e aparece como aviso. Com `audience`, só entram as páginas do perfil (ver Público). HTML colado no texto sai como texto (só a cor do texto passa, ver acima), e links só passam se forem `http`, `https`, `mailto` ou âncora.

## Regras

- Os ids são únicos dentro de cada arquivo de anotações.
- Nenhum caminho pode sair da pasta do manual.
- As gravações são atômicas: o conteúdo vai para um arquivo temporário, que depois é renomeado.

## Compatibilidade

Esta seção vale a partir da 1.0 do Studio (pacote `explicai`). O MCP (`explicai-mcp`) segue na 0.x, com semver próprio, e declara a faixa de `explicai` que aceita.

**O que é contrato.** Mudanças nestes pontos seguem semver: só crescem na versão menor, e qualquer quebra exige versão maior.

- O formato em disco descrito neste arquivo: `manual.json`, páginas, `assets/*.json` e `.versoes/`.
- Os exports de `explicai/core`.
- As flags do comando `explicai` (`--port`, `--no-open`, `--version`).
- Os nomes e os schemas das tools e dos prompts do MCP.

**O que é interno.** A API HTTP local do Studio serve só ao editor que vem no mesmo pacote. Ela pode mudar em qualquer versão, e quem a chama por fora não tem garantia.

**Política de acréscimo.** A versão 1 do formato cresce só por acréscimo: campo opcional novo, ou valor novo numa lista. Nenhum campo some e nenhum muda de sentido. Enquanto for assim, `version` em `manual.json` continua 1. Todo manual criado a partir da 0.1 deve abrir, editar e exportar em qualquer 1.x.

**Migração.** A 1.0 não tem migração, porque não existe versão 2. Se ela vier, entra só com o comando `explicai migrate`, com cópia de segurança antes de qualquer mudança, e a leitura da versão 1 continua em toda a série 1.x.

**Manual de formato mais novo (meta).** O objetivo é que um manual com `version` maior que a suportada abra com a mensagem "atualize o Studio" e não seja regravado. Hoje isso ainda não está implementado: `readManual` rejeita a versão diferente com um erro (`versão de formato não suportada`). O ticket T-198 só registra a política; a abertura em modo leitura fica para uma fatia de código.

**Campos desconhecidos.** Ler e regravar sem perder campos que o Studio não conhece está documentado só para o frontmatter das páginas. Para `manual.json` e `assets/*.json`, a garantia ainda não foi verificada por teste.

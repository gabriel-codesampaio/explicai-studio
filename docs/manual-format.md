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

A ordem do array é a ordem das páginas. O título de cada página fica só no frontmatter dela. O campo opcional `theme` guarda a aparência do manual exportado (ver abaixo). O campo opcional `published` aponta a versão escolhida para o manual final (ver Versões).

### theme

Todos os campos são opcionais e valem só para o HTML e o PDF; o Markdown exportado não muda. Cores em hexadecimal de 6 dígitos (`#2b4fe0`). Manual sem `theme` exporta como antes.

```json
"theme": {
  "text": "#222222",
  "accent": "#0f7a55",
  "highlight": "#ffe066",
  "headings": { "cover": "#000000", "page": "#000000", "h1": "#7a3fc4", "h2": "#000000", "h3": "#000000" }
}
```

| Campo | Efeito | Padrão |
|---|---|---|
| `text` | Texto do manual; o texto secundário (legendas, rodapé) deriva dele | `#151a33` |
| `accent` | Links, números dos passos e marcações sobre os prints | `#2b4fe0` |
| `highlight` | Marca-texto: linha da capa, "Resultado:" e destaque das imagens | `#ffd43b` |
| `headings` | Cor do título da capa (`cover`), do título da página (`page`) e dos títulos de nível 1 a 3 do editor (`h1`, `h2`, `h3`) | `#000000` |

O core recusa, ao gravar (Studio e MCP), `text`, `accent` e cada cor de `headings` com contraste menor que 4,5:1 com o branco, e um `highlight` que deixe o texto por cima com menos de 4,5:1. A mensagem diz o contraste atual e o mínimo. Editar um campo mantém os outros.

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

## Links entre páginas

Um link para outra página do manual é um link Markdown relativo ao arquivo: `[Cadastro](./cadastrar-cliente.md)`, ou `./cadastrar-cliente.md#campos` para uma seção. Todas as páginas ficam em `pages/`, então o caminho é sempre `./nome.md`. Quando uma página é renomeada, os links das outras páginas são atualizados.

## Anotações da imagem

`assets/<imagem>.json`. Todas as coordenadas vão de 0 a 1, relativas à largura e à altura da imagem, para funcionarem em qualquer tamanho de tela.

```json
{
  "version": 1,
  "markers":    [{ "id": "m1", "n": 1, "x": 0.82, "y": 0.12, "label": "Novo cliente" }],
  "highlights": [{ "id": "h1", "x": 0.10, "y": 0.20, "w": 0.50, "h": 0.08 }],
  "arrows":     [{ "id": "a1", "from": { "x": 0.1, "y": 0.1 }, "to": { "x": 0.2, "y": 0.2 } }],
  "hotspots":   [{ "id": "s1", "x": 0.70, "y": 0.05, "w": 0.20, "h": 0.10,
                   "target": { "type": "page", "pageId": "9a1b…" } }]
}
```

Destinos de área clicável: `page` (outra página), `anchor` (seção de uma página) e `url` (só `http`, `https` ou `mailto`).

## Lixeira

Excluir uma página move o arquivo dela (e o das subpáginas) para `.lixeira/<id>/pages/`, junto com um `entry.json` que guarda a posição na árvore. Restaurar devolve tudo ao mesmo lugar. Se o pai também foi excluído, a página volta para a raiz. Se o nome do arquivo foi ocupado nesse meio tempo, ela ganha um nome novo. "Imagens sem uso" move para `.lixeira/imagens-<data>/` as imagens que nenhuma página, versão ou item da lixeira cita, junto com as marcações delas, e as marcações cuja imagem não existe mais. A lixeira não é esvaziada sozinha: dá para apagar a pasta `.lixeira/` à mão ou colocá-la no `.gitignore`.

Uma página pode ficar sem título enquanto é escrita. O arquivo vira `sem-titulo.md` e é renomeado quando o título aparece.

## Versões

"Guardar versão" copia a página para `.versoes/<id da página>/<data>.md`. A cópia tem o mesmo formato de uma página, com `savedAt` e `note` (o nome que a pessoa deu, pode ser vazio) no frontmatter:

```markdown
---
id: 9a1b…
title: Cadastrar cliente
savedAt: 2026-10-29T13:02:11.480Z
note: Revisado pelo suporte
---

Texto da página naquele momento.
```

O id da versão é o nome do arquivo sem `.md`. Quando `published` está no nó da página em `manual.json`, a exportação usa aquela versão. Sem ele, usa o texto atual. Restaurar uma versão troca o texto atual por ela e antes guarda o texto que estava lá como uma versão "Antes de restaurar". As versões acompanham a página na lixeira, porque ficam pelo id.

## Exportação

A exportação lê o manual e grava em `exportacao/`, substituindo a anterior do mesmo formato:

- `exportacao/html/index.html`: o manual num arquivo só, com sumário, uma seção por página e as marcações desenhadas sobre os prints. As imagens usadas vão para `exportacao/html/assets/` e as fontes da marca (com a licença OFL), para `exportacao/html/fonts/`.
- `exportacao/<titulo>.pdf`: o mesmo HTML impresso pelo Chrome, Edge ou Chromium da máquina (ou o navegador em `EXPLICAI_BROWSER`).
- `exportacao/markdown/manual.md`: o manual num Markdown só, para quem lê com IA. Depois de cada print vem a legenda em texto.

Os títulos do corpo da página saem logo abaixo do título dela, sem pular nível (h2, h3, h4…), tanto no HTML quanto no Markdown. Cada página entra com a versão marcada em `published` ou, sem ela, com o texto atual. Página com arquivo apagado fica de fora e aparece como aviso. HTML colado no texto sai como texto, e links só passam se forem `http`, `https`, `mailto` ou âncora.

## Regras

- Os ids são únicos dentro de cada arquivo de anotações.
- Nenhum caminho pode sair da pasta do manual.
- As gravações são atômicas: o conteúdo vai para um arquivo temporário, que depois é renomeado.

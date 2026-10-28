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
```

## manual.json

```json
{
  "version": 1,
  "title": "Financeiro",
  "language": "pt-BR",
  "pages": [
    { "id": "3f2c…", "file": "pages/visao-geral.md", "children": [
      { "id": "9a1b…", "file": "pages/cadastrar-cliente.md", "children": [] }
    ] }
  ]
}
```

A ordem do array é a ordem das páginas. O título de cada página fica só no frontmatter dela.

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

Excluir uma página move o arquivo dela (e o das subpáginas) para `.lixeira/<id>/pages/`, junto com um `entry.json` que guarda a posição na árvore. Restaurar devolve tudo ao mesmo lugar. Se o pai também foi excluído, a página volta para a raiz. Se o nome do arquivo foi ocupado nesse meio tempo, ela ganha um nome novo. A lixeira não é esvaziada sozinha: dá para apagar a pasta `.lixeira/` à mão ou colocá-la no `.gitignore`.

Uma página pode ficar sem título enquanto é escrita. O arquivo vira `sem-titulo.md` e é renomeado quando o título aparece.

## Regras

- Os ids são únicos dentro de cada arquivo de anotações.
- Nenhum caminho pode sair da pasta do manual.
- As gravações são atômicas: o conteúdo vai para um arquivo temporário, que depois é renomeado.

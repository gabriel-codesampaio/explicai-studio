<p>
  <img src="https://gabriel-codesampaio.github.io/explicai-brandbook/logo/explicai-logo-horizontal.svg" alt="Explicaí" height="56">
</p>

Construtor de manuais open source e gratuito. Do print ao manual pronto em PDF, HTML e Markdown.

> Tira o print, que o Explicaí explica.

**Status:** em construção. O núcleo que lê e grava manuais está pronto. O editor vem a seguir.

## Como vai funcionar

```bash
npx explicai
```

O editor abre no navegador. Você cola textos e prints, organiza as páginas em árvore, marca as imagens com números, destaques, setas e áreas clicáveis, e exporta em PDF, HTML ou Markdown. Cada manual é uma pasta de arquivos Markdown que você pode versionar no git junto com o código.

O [Explicaí Agent](https://github.com/gabriel-codesampaio/explicai-mcp) deixa uma IA montar manuais no mesmo formato, pelo MCP.

## Desenvolvimento

```bash
npm install
npm test
npm run typecheck
```

- Formato do manual em disco: [docs/manual-format.md](docs/manual-format.md)
- Especificação da v1: [docs/spec-v1.md](docs/spec-v1.md)
- Brand book: [gabriel-codesampaio.github.io/explicai-brandbook](https://gabriel-codesampaio.github.io/explicai-brandbook/)

## English

Explicaí is a free, open source manual builder. Paste text and screenshots, organize pages in a tree, annotate images with numbered markers, highlights, arrows and clickable areas, then export to PDF, HTML or Markdown. Pronounced *ex-plee-kah-EE*.

## Licença

MIT. Um projeto [codesampa.io](https://codesampa.io).

<p>
  <img src="https://gabriel-codesampaio.github.io/explicai-brandbook/logo/explicai-logo-horizontal.svg" alt="Explicaí" height="56">
</p>

Construtor de manuais open source e gratuito. Do print ao manual pronto em PDF, HTML e Markdown.

> Tira o print, que o Explicaí explica.

## Como usar

Precisa do Node 20.12 ou mais novo.

```bash
npx explicai manuais
```

O Explicaí Studio abre no navegador, e os manuais ficam na pasta `manuais` (sem pasta, vale a pasta atual). Opções: `--port 4321` para trocar a porta e `--no-open` para não abrir o navegador.

No Studio você:

- escreve cada tela ou tarefa do sistema numa página, organizada em árvore;
- cola prints e marca com números, destaques, setas e áreas clicáveis;
- escreve passos numerados com o print e o resultado esperado de cada um;
- guarda versões de cada página e escolhe qual vai para o manual final;
- marca cada página como rascunho, em revisão, aprovada ou publicada;
- exporta em HTML, PDF ou Markdown. O PDF usa o Chrome, o Edge ou o Chromium que já estiver na máquina.

Cada manual é uma pasta de arquivos Markdown que você pode versionar no git junto com o código. O formato está em [docs/manual-format.md](docs/manual-format.md).

A interface está em português e em inglês, e segue o idioma do navegador. O [Explicaí Agent](https://github.com/gabriel-codesampaio/explicai-mcp) vai deixar uma IA montar manuais no mesmo formato, pelo MCP.

## Desenvolvimento

```bash
npm install
npm run check      # lint, tipos e testes
npm run test:e2e   # testes de ponta a ponta no Chrome instalado
npm run build
```

Para trabalhar no editor: `npm run dev:server` em um terminal e `npm run dev:web` em outro.

Contribuições são bem-vindas. Abra uma issue para conversar sobre a ideia, ou mande um pull request com `npm run check` passando.

- Formato do manual em disco: [docs/manual-format.md](docs/manual-format.md)
- Brand book: [gabriel-codesampaio.github.io/explicai-brandbook](https://gabriel-codesampaio.github.io/explicai-brandbook/)

## English

Explicaí is a free, open source manual builder. Run `npx explicai manuals` (Node 20.12+), write one page per screen or task, paste screenshots and mark them up with numbered markers, highlights, arrows and clickable areas, then export to HTML, PDF or Markdown. Each manual is a folder of Markdown files you can keep in git next to your code. The interface is available in Portuguese and English. Pronounced *ex-plee-kah-EE*.

## Licença

MIT. Um projeto [codesampa.io](https://codesampa.io).

<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://gabriel-codesampaio.github.io/explicai-brandbook/logo/explicai-logo-horizontal-escuro.svg">
    <img src="https://gabriel-codesampaio.github.io/explicai-brandbook/logo/explicai-logo-horizontal.svg" alt="Explicaí" height="56">
  </picture>
</p>

Construtor de manuais open source e gratuito. Do print ao manual pronto em PDF, HTML e Markdown.

> Tira o print e explica. O Explicaí monta o manual.

[Português](#português) · [English](#english)

## Português

### Como usar

Precisa do Node 22.12 ou mais novo. Para exportar em PDF, precisa também do Chrome, do Edge ou do Chromium instalado na máquina.

```bash
npx explicai manuais
```

O Explicaí Studio abre no navegador, e os manuais ficam na pasta `manuais` (sem pasta, vale a pasta atual). Opções:

- `--port 4321` troca a porta;
- `--no-open` não abre o navegador;
- `--help` mostra o uso.

### O que dá para fazer

- Escrever cada tela ou tarefa do sistema numa página, organizada em árvore.
- Colar prints e marcar com números, destaques, setas e áreas clicáveis.
- Escrever passos numerados com o print e o resultado esperado de cada um.
- Guardar versões de cada página e escolher qual vai para o manual final.
- Marcar cada página como rascunho, em revisão, aprovada ou publicada.
- Escolher cores, fontes e logo do manual exportado.
- Separar o manual por público, como aluno e administrador, e exportar uma versão para cada um.

### Exportar

Pelo botão Exportar do Studio, em três formatos:

| Formato | O que sai |
| --- | --- |
| HTML | Um manual com sumário, que abre offline, com as imagens e as fontes ao lado. |
| PDF | O mesmo HTML impresso pelo navegador da máquina (Chrome, Edge ou Chromium). Se ele estiver num caminho fora do comum, aponte com a variável `EXPLICAI_BROWSER`. |
| Markdown | Um arquivo só, com a legenda de cada print em texto, bom para ler com IA. |

Os arquivos saem em `exportacao/`, dentro da pasta do manual.

### Formato da pasta

Cada manual é uma pasta de arquivos Markdown que você pode versionar no git junto com o código:

```
manuais/
  financeiro/
    manual.json              título, idioma e árvore de páginas
    pages/cadastrar-cliente.md
    assets/tela-clientes.png
    assets/tela-clientes.png.json   marcações do print
    exportacao/              HTML, PDF e Markdown gerados
```

O formato completo está em [docs/manual-format.md](https://github.com/gabriel-codesampaio/explicai-studio/blob/main/docs/manual-format.md).

#### Compatibilidade

A partir da 1.0 do Studio, o formato da pasta só cresce por acréscimo: campo opcional novo, nunca um campo que some ou muda de sentido. Manuais criados desde a 0.1 devem abrir na 1.x. Seguem semver o formato em disco, os exports de `explicai/core`, as flags do comando `explicai` e os nomes e schemas das tools e prompts do MCP. A API HTTP local do Studio é interna e pode mudar a qualquer versão. O MCP segue na 0.x, com versão própria. A política completa está em [Compatibilidade](https://github.com/gabriel-codesampaio/explicai-studio/blob/main/docs/manual-format.md#compatibilidade).

### Usar como biblioteca

O mesmo código que o Studio usa para ler, gravar e exportar manuais está em `explicai/core`. É assim que o [Explicaí Agent](https://github.com/gabriel-codesampaio/explicai-mcp) monta manuais pelo MCP.

```js
import { createManual, addPage, exportManual } from "explicai/core";

const manual = await createManual("manuais", { title: "Financeiro", language: "pt-BR" });
await addPage(manual.dir, { title: "Cadastrar cliente", body: "1. Clique em **Novo cliente**." });
await exportManual(manual.dir, "html");
```

### Contribuir

Contribuições são bem-vindas. Abra uma [issue](https://github.com/gabriel-codesampaio/explicai-studio/issues) para conversar sobre a ideia, ou mande um pull request seguindo o [guia de contribuição](CONTRIBUTING.md). O código está em [github.com/gabriel-codesampaio/explicai-studio](https://github.com/gabriel-codesampaio/explicai-studio).

## English

### Usage

Needs Node 22.12 or newer. PDF export also needs Chrome, Edge or Chromium installed on the machine.

```bash
npx explicai manuals
```

Explicaí Studio opens in your browser, and the manuals live in the `manuals` folder (with no folder, the current one is used). Options: `--port 4321` changes the port, `--no-open` skips opening the browser, `--help` prints the usage. The interface is available in Portuguese and English and follows the browser language.

### What you can do

- Write one page per screen or task, organized as a tree.
- Paste screenshots and mark them up with numbered markers, highlights, arrows and clickable areas.
- Keep versions of each page and pick the one that goes into the final manual.
- Split the manual by audience and export one version for each.
- Export to HTML (offline, with images and fonts next to it), PDF (printed by your Chrome, Edge or Chromium; set `EXPLICAI_BROWSER` if it lives somewhere unusual) or a single Markdown file.

### Folder format

Each manual is a folder of Markdown files you can keep in git next to your code: a `manual.json` with the page tree, one `.md` per page under `pages/`, images and their annotations under `assets/`, and the exports under `exportacao/`. Details (in Portuguese) in [docs/manual-format.md](https://github.com/gabriel-codesampaio/explicai-studio/blob/main/docs/manual-format.md).

#### Compatibility

From Studio 1.0 on, the folder format only grows by addition: a new optional field, never one that disappears or changes meaning. Manuals created since 0.1 should open on any 1.x. Semver covers the on-disk format, the `explicai/core` exports, the `explicai` CLI flags, and the names and schemas of the MCP tools and prompts. The Studio's local HTTP API is internal and may change in any release. The MCP stays on 0.x with its own version. The full policy is in [Compatibilidade](https://github.com/gabriel-codesampaio/explicai-studio/blob/main/docs/manual-format.md#compatibilidade) (in Portuguese).

### Library

`explicai/core` exports the functions the Studio uses to read, write and export manuals (`createManual`, `addPage`, `exportManual` and more), as in the example above. Types are included.

### Contributing

Contributions are welcome. See the [contributing guide](CONTRIBUTING.md), which has a summary in English, and the [Code of Conduct](CODE_OF_CONDUCT.md).

## Licença / License

MIT. Um projeto [codesampa.io](https://codesampa.io) / A [codesampa.io](https://codesampa.io) project. Veja o arquivo [LICENSE](https://github.com/gabriel-codesampaio/explicai-studio/blob/main/LICENSE).

As fontes em `fonts/` (Archivo, Atkinson Hyperlegible Next, Inter, JetBrains Mono, Lora, Montserrat, Playfair Display, Source Sans 3 e Source Serif 4) seguem a SIL Open Font License 1.1, com a licença de cada uma ao lado. Elas vão junto com o manual exportado em HTML. / The fonts in `fonts/` are licensed under the SIL Open Font License 1.1, with each license next to the files.

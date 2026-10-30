# Explicaí · especificação da v1

Status: rascunho para revisão · 2026-10-28

## O que é

O **Explicaí Studio** é um editor de manuais no estilo do editor do Confluence. A pessoa cola o conteúdo (texto, prints, tabelas), organiza em páginas, marca as imagens e exporta. O Studio não captura tela: o print vem de fora.

O **Explicaí Agent** é um servidor MCP que permite a uma IA montar manuais com os mesmos recursos do editor.

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Formato | App web local: `npx explicai` abre o editor no navegador, sem login e sem servidor na nuvem |
| Stack | TypeScript nos dois projetos. Studio em React + Vite. Agent com o SDK oficial de MCP |
| Estrutura | Árvore de páginas: um manual tem páginas e subpáginas, numa barra lateral |
| Imagens | Marcadores numerados, destaques e setas desde a v1, com legenda gerada a partir dos marcadores |
| Links em imagens | Áreas clicáveis desenhadas sobre a imagem, cada uma levando a uma página, a uma seção ou a uma URL |
| Idiomas da interface | Português e inglês |

## Escopo da v1

**Editor**
- Blocos: título (H1–H3), parágrafo, listas, lista de passos numerados, tabela, código, aviso (info, atenção, erro) e imagem.
- Colar imagem direto da área de transferência ou arrastar o arquivo.
- Links entre páginas do manual.
- Atalhos de teclado e menu de blocos com `/`, como no Confluence.

**Imagem**
- Marcadores numerados, retângulo de destaque e seta.
- A legenda abaixo da imagem é gerada a partir dos marcadores e editada como texto.
- Áreas clicáveis com destino: página, seção (âncora) ou URL.

**Manual**
- Árvore de páginas com arrastar e soltar para reordenar.
- Vários manuais por pasta de trabalho.

**Exportação**
- Cores do manual por cliente: texto, títulos por nível, destaque e realce em hexadecimal livre, com contraste mínimo de 4,5:1, e fonte do texto e dos títulos entre oito fontes OFL empacotadas (lista em `docs/manual-format.md`). Logo do cliente fica de fora.
- **Markdown:** uma pasta com um `.md` por página e as imagens, pensada para ser lida por IAs.
- **HTML:** um site estático com navegação lateral, em que as áreas clicáveis funcionam.
- **PDF:** com sumário e numeração de páginas.

**Agent (MCP)**
- Ferramentas para listar manuais e páginas, criar e editar páginas, inserir imagem, adicionar marcadores e áreas clicáveis, e exportar.
- Parâmetro de tom de voz no texto gerado: profissional (padrão), tranquilo ou personalizado.
- Funciona sem o Studio aberto, porque lê e grava a mesma pasta do manual.

## Fora da v1

Captura de tela, checagem automática do manual no sistema (Chrome DevTools MCP), colaboração em tempo real, versão hospedada com login, logo do cliente e busca.

## Decisões técnicas

1. **Formato salvo em disco** (decidido): Markdown, um arquivo por página, com frontmatter. Os marcadores e as áreas clicáveis de cada imagem ficam num JSON ao lado da imagem. HTML e PDF são gerados na exportação.
2. **Código compartilhado** (decidido): o núcleo (ler e gravar manuais, exportar) é publicado pelo pacote `explicai` e usado pelo `explicai-mcp`.
3. **Biblioteca do editor** (decidido em 2026-10-28): Tiptap. Comparação abaixo.

### Tiptap × BlockNote

Consulta na documentação atual, 2026-10-28.

| Critério | Tiptap | BlockNote |
|---|---|---|
| Licença do núcleo | MIT | MPL-2.0 |
| Markdown | Oficial e nos dois sentidos (`@tiptap/markdown`, desde a 3.7). Cada bloco define como vira Markdown (`renderMarkdown`) e como volta (`parseMarkdown`) | "Lossy" nos dois sentidos (`blocksToMarkdownLossy`, `tryParseMarkdownToBlocks`): perde aninhamento e alguns estilos |
| Exportar PDF | Só pela extensão Pro, que exige token da nuvem do Tiptap | Só pelo pacote `xl-pdf-exporter`, em GPL-3.0 ou licença comercial |
| Menu `/`, arrastar blocos | Arrastar é open source desde a 3.0. O menu `/` é montado sobre a extensão `suggestion` | Prontos, sem configuração |
| Bloco customizado (imagem com marcadores) | Node view em React, com controle total | Blocos customizados, dentro do modelo de blocos dele |
| Visual pronto | Nenhum (headless). Montamos a interface | Interface pronta, parecida com a do Notion |

**Por que Tiptap:** Markdown é o formato salvo, então a ida e volta precisa ser sem perda, e no BlockNote ela é "lossy" por definição. O bloco de imagem com marcadores e áreas clicáveis precisa virar Markdown + JSON de um jeito que nós controlamos, e no Tiptap isso é uma função por bloco.

**O que custa:** montar a interface (menu `/`, barra de formatação, painel lateral). É mais trabalho no começo.

**PDF:** nenhuma das duas resolve sem custo ou sem conflito de licença. Um projeto MIT não deve depender de pacote GPL-3.0. A proposta é gerar o PDF a partir do HTML exportado, com Chromium em modo headless (Playwright), o que também mantém PDF e HTML iguais.

## Impacto na marca

Alguns textos do brand book prometem captura de tela e precisam de ajuste: a descrição do Studio ("captura de tela, marcadores..."), o "vai do print ao manual pronto", o posicionamento ("do print ao manual pronto") e o exemplo do topo. O print anotado continua válido como exemplo, porque o editor marca imagens. Só não é o Explicaí que tira o print.

# Primeiros passos

English: [getting-started.md](getting-started.md).

Este guia leva você de nenhum manual a um manual exportado. Leva uns dez minutos.

## O que você precisa

- Node 22.12 ou mais novo.
- Para exportar em PDF, Chrome, Edge ou Chromium instalado na máquina. HTML e Markdown não precisam de navegador. Se o navegador estiver num caminho fora do comum, aponte com a variável `EXPLICAI_BROWSER`.

## 1. Abra o Studio

```bash
npx explicai manuais
```

O Studio abre no navegador em `http://localhost:4321`. A pasta `manuais` é o workspace: cada manual vira uma subpasta dela, e a pasta é criada se não existir. Sem argumento, vale a pasta atual.

Opções do comando:

- `--port 4322` (ou `-p`) troca a porta. Se a 4321 estiver ocupada, o comando avisa e sugere a próxima.
- `--no-open` não abre o navegador.
- `--version` mostra a versão e `--help` mostra o uso.

O Studio só escuta em `127.0.0.1`, então ninguém de fora da sua máquina o acessa. Para parar, use Ctrl+C no terminal.

## 2. Crie um manual

Na primeira vez o Studio pergunta "Qual sistema você vai explicar?". Digite o nome, como "Financeiro", e confirme. "Novo manual" cria os outros. O idioma do manual é o da interface na hora da criação (português ou inglês, conforme o navegador) e vale para o corretor ortográfico e para os rótulos do HTML exportado.

No disco aparece `manuais/financeiro/manual.json`. O formato completo está em [manual-format.md](manual-format.md).

## 3. Escreva uma página

Use "Nova página" na árvore à esquerda. Uma página por tela ou tarefa, com subpáginas para as partes de uma tarefa maior. Arraste na árvore para reordenar.

Dentro da página:

- Digite `/` para inserir um bloco (título, lista, divisor, alerta e outros).
- Escreva os passos numa lista numerada. Depois de cada passo, uma citação começando por "Resultado:" diz o que a pessoa deve ver. O HTML exportado destaca essa linha.
- Um alerta (Dica, Atenção, Erro, Nota) é uma citação que começa por `[!TIP]`, `[!WARNING]`, `[!CAUTION]` ou `[!NOTE]`.

## 4. Cole um print e marque

O Studio não captura tela. Tire o print com a ferramenta do seu sistema e cole na página com Ctrl+V. A imagem vai para `assets/`.

Clique no print e escolha "Editar imagem" para colocar marcadores numerados, destaques, setas e áreas clicáveis (que levam a outra página, a uma seção ou a um endereço). As posições ficam em `assets/<imagem>.json`, entre 0 e 1, e valem em qualquer tamanho de tela. Escreva ao lado de cada número o que ele mostra: marcador sem descrição vira aviso na conferência do manual.

## 5. Guarde versões e escolha a que vale

"Guardar versão da página" copia o texto atual para `.versoes/`. Na lista de versões, "Usar na página do manual" escolhe qual delas entra na exportação. Sem escolha, entra o texto atual. Restaurar uma versão guarda antes o texto que estava lá.

Cada página também tem uma etapa: rascunho, em revisão, aprovada ou publicada. No diálogo de exportação, "Só páginas aprovadas" deixa as outras de fora.

## 6. Exporte

Use "Exportar manual", no topo da página, e escolha o formato. Os arquivos saem em `exportacao/`, dentro da pasta do manual:

| Formato | Arquivo |
| --- | --- |
| HTML | `exportacao/html/index.html`, com `assets/` e `fonts/` ao lado. Abre offline. |
| PDF | `exportacao/<titulo>.pdf`, o mesmo HTML impresso pelo navegador da máquina. |
| Markdown | `exportacao/markdown/manual.md`, um arquivo só, com a legenda de cada print em texto. |

Para separar o manual por público (aluno e administrador, por exemplo), defina o público de cada página e exporte um perfil por vez. A exportação de um perfil sai ao lado das outras, em `exportacao/html-<perfil>/` e equivalentes. Público não é controle de acesso: entregue o arquivo exportado, nunca a pasta do manual.

## 7. Versione no git

Um manual é uma pasta de texto. Você pode versionar `pages/`, `assets/` e `manual.json` junto com o código. `exportacao/` e `.lixeira/` costumam ir para o `.gitignore`.

## Ver um manual completo

[docs/exemplo](exemplo/README.md) traz o manual "Financeiro" pronto, com três páginas, um print marcado, uma versão escolhida e um público. Para abrir:

```bash
npx explicai docs/exemplo
```

Num clone do repositório, rode `npm run build` e depois `npm start -- docs/exemplo`.

## Compatibilidade

A partir da 1.0, o formato da pasta só cresce por acréscimo, e um manual criado desde a 0.1 abre em qualquer 1.x. O que segue semver e o que é interno estão em [Compatibilidade](manual-format.md#compatibilidade).

# T-039: Barra flutuante na seleção, com cor do texto

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: pedido direto (2026-10-30), "igual ao Confluence". Revê a recusa da opção 3 da [discovery de cor na seleção](../discovery/2026-10-30-cor-na-selecao.md): a cor vem de uma paleta fixa, não de hex livre.

## Problema
Para formatar um trecho, a pessoa precisa subir até a barra fixa. E não há como pintar uma palavra para chamar a atenção do leitor.

## Critérios de aceite
- [x] Selecionar texto abre uma barra flutuante com: tipo do bloco, negrito, itálico, código, link e cor do texto.
- [x] Cor de uma paleta fixa (cinza, vermelho, laranja, verde, azul, roxo) mais "Cor padrão", que tira a cor.
- [x] Cada cor tem uma versão para o tema claro e outra para o escuro, as duas com contraste ≥ 4,5:1 (teste).
- [x] Salva como `<span data-color="red">texto</span>`. Salvar e reabrir deixa igual, também com negrito junto (teste em `web/test/markdown.test.ts`).
- [x] No HTML e no PDF, só esse `span` com uma cor da paleta passa. Qualquer outro HTML continua saindo como texto.
- [x] O Markdown exportado para IA sai sem o `span`, só com o texto.
- [x] `docs/manual-format.md` atualizado.

## Onde
`web/src/features/editor/` (marca, barra flutuante), `web/src/styles/`, `src/core/export/html.ts`, `src/core/export/markdown.ts`, `docs/manual-format.md`.

## Como verificar
Testes de ida e volta do Markdown, do HTML exportado e do contraste da paleta; e2e da barra; conferir no navegador nos dois temas.

## Registro
Commits 42a700a, 95bd2f4, a39f7cf e 7702bee. Marca `textColor` com tokenizer próprio (o Markdown de dentro do span continua sendo lido), barra flutuante (`SelectionMenu`) com tipo do bloco, negrito, itálico, código, link e cor; a linha de cores abre dentro da barra e ela se reposiciona. Export: só `<span data-color>` com nome da paleta passa; o Markdown para IA tira o span. Verificado: `npm run check` verde, e2e 21/21 (novo: "barra da seleção"), no Chrome no tema escuro (cor, negrito por fora, tipo de bloco pela barra, barra sem cobrir o texto). Fora: a cor não está na barra fixa, então pelo teclado não há como pintar; o `explicai-mcp` não conhece a sintaxe (grava texto normal, sem problema); tema claro e PDF não conferidos no navegador, só o contraste por teste.

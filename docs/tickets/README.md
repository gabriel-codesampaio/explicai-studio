| [T-030](fechados/T-030-fontes-do-manual.md) | Deixar a pessoa escolher as fontes do manual exportado | P2 | feito | 4d091d1 |
| [T-029](fechados/T-029-cores-do-manual.md) | Deixar a pessoa escolher as cores do manual exportado | P2 | feito | 230d294 |
| [T-011](fechados/T-011-amarelo-com-um-sentido.md) | Dar ao amarelo um sentido só (conteúdo e página ativa) | P2 | feito | dd8b1b9 |
| [T-002](fechados/T-002-titulos-do-export.md) | Corrigir o pulo de nível de título no manual exportado | P2 | feito | afbfa87 |
# Tickets

Fila de trabalho do Studio. Formato e ciclo de vida: skill `tickets` do plugin [explicai-workflow](https://github.com/gabriel-codesampaio/explicai-workflow).

Prioridade: **P0** atinge quem lê o resultado final; **P1** é o pedido principal (tirar a cara de IA); **P2** incomoda, há como contornar; **P3** acabamento.

Ticket fechado (feito ou descartado) vai para `fechados/` com `git mv`.

## Abertos

| ID | Título | Prioridade | Status | Agente |
|----|--------|------------|--------|--------|
| [T-007](fechados/T-007-icones-decorativos.md) | Tirar os ícones que só decoram e usar a extensão do arquivo na exportação | P1 | feito | 205d9c4 |
| [T-008](T-008-menu-barra-com-previa.md) | Menu "/" com prévia do bloco e grupos, sem ícones em quadrado | P1 | aberto | frontend |
| [T-012](T-012-marcacoes-do-brand-book.md) | Marcações como no brand book | P2 | aberto | frontend |
| [T-013](T-013-tela-dividida.md) | Manter a árvore visível em tela dividida (~960 px) | P2 | aberto | frontend |
| [T-014](T-014-atalhos-de-marcacao.md) | Atalhos de letra nas ferramentas de marcação | P2 | aberto | frontend |
| [T-017](T-017-status-legivel.md) | Status da página mais legível | P2 | aberto | design |
| [T-023](T-023-marcacao-no-celular.md) | Deixar a legenda editável no diálogo de marcação em 375 px | P2 | aberto | frontend |
| [T-026](T-026-aparencia-no-celular.md) | Abrir o painel Aparência dentro da tela no celular e marcar a opção escolhida no escuro | P2 | aberto | design |
| [T-027](T-027-tokens-do-escuro.md) | Alinhar as cores do tema escuro ao brand book | P2 | aberto | design |
| [T-028](T-028-textos-sem-traducao.md) | Traduzir os textos que ainda aparecem em português com a interface em inglês | P2 | aberto | frontend |
| [T-031](T-031-transicao-no-studio.md) | Transição curta ao trocar de página no Studio | P3 | aberto | frontend |
| [T-032](T-032-logo-do-cliente.md) | Logo do cliente na capa do manual exportado | P2 | aberto | frontend |
| [T-033](T-033-exportar-sem-rodape.md) | Exportar o manual sem o rodapé do Explicaí | P3 | aberto | frontend |
| [T-034](T-034-bloco-de-aviso.md) | Bloco de aviso (Dica, Atenção, Erro, Nota) | P2 | aberto | frontend |
| [T-035](T-035-guia-de-contribuicao.md) | Guia de contribuição e código de conduta | P3 | aberto | frontend |
| [T-036](T-036-corretor-do-navegador.md) | Deixar o corretor do navegador explícito no editor e explicar na ajuda | P3 | aberto | frontend |
| [T-037](T-037-design-md-e-audit.md) | Gerar o DESIGN.md e rodar o audit do impeccable | P2 | aberto | design |
| [T-038](T-038-harden-antes-do-npm.md) | Rodar o harden do impeccable antes da versão pública no npm | P2 | aberto | design |
| [T-018](T-018-primeiro-print.md) | Página vazia que ensina o primeiro passo e onde exportar | P3 | aberto | design |
| [T-020](T-020-dimensoes-das-imagens.md) | Dimensões das imagens no HTML exportado | P3 | aberto | core |
| [T-021](T-021-serve-limpa-temporarios.md) | Apagar as pastas temporárias que o e2e/serve.mjs cria | P3 | aberto | qa |
| [T-024](T-024-indice-sem-rolagem-lateral.md) | Tirar a rolagem horizontal de "Nesta página" com título longo | P3 | aberto | design |

## Fechados

| ID | Título | Prioridade | Status | Commit |
|----|--------|------------|--------|--------|
| [T-046](fechados/T-046-titulo-corrompido.md) | Recusar corpo não UTF-8 que gravava U+FFFD no título | P1 | feito | a29b735 |
| [T-044](fechados/T-044-colar-print-fora-da-tela-no-celular.md) | "Colar print" fica fora da tela em 375 px | P2 | feito | — |
| [T-025](fechados/T-025-barra-no-celular.md) | Mostrar que a barra de ferramentas rola em 375 px | P2 | feito | — |
| [T-041](fechados/T-041-cor-pelo-teclado.md) | Cor do texto com nome visível e pelo teclado | P1 | feito | — |
| [T-042](fechados/T-042-erros-traduzidos.md) | Erros do núcleo traduzidos na interface em inglês | P3 | feito | — |
| [T-043](fechados/T-043-botao-exportar.md) | Exportar manual como último item do topo, à direita | P2 | feito | — |
| [T-045](fechados/T-045-menu-ajustes.md) | Menu Ajustes com Idioma próprio, ícones e cursor de mão | P2 | feito | — |
| [T-040](fechados/T-040-rodape-ajustes.md) | Rodapé da barra lateral como a linha "Ajustes" | P2 | feito | — |
| [T-039](fechados/T-039-barra-na-selecao.md) | Barra flutuante na seleção, com cor do texto | P1 | feito | a39f7cf |
| [T-010](fechados/T-010-barra-colar-print.md) | "Colar print" com Ctrl+V na barra de ferramentas | P1 | feito | 428cbc6 |
| [T-016](fechados/T-016-um-nome-para-versao.md) | Um nome só para a versão do manual final | P2 | feito | 94ee9a3 |
| [T-015](fechados/T-015-so-aprovadas-sem-aprovadas.md) | "Só páginas aprovadas" desabilitado quando não há nenhuma | P2 | feito | bf91cab |
| [T-006](fechados/T-006-exportar-no-topo.md) | Levar "Exportar manual" para o topo da página como botão principal | P1 | feito | 060a936 |
| [T-005](fechados/T-005-manual-como-cabecalho.md) | Mostrar o nome do manual como cabeçalho, sem caixa | P1 | feito | d5f92a0 |
| [T-004](fechados/T-004-numeracao-na-arvore.md) | Mostrar a numeração 2.1 na árvore de páginas e na busca | P1 | feito | c558b39 |
| [T-003](fechados/T-003-rotulos-mono.md) | Usar rótulos de seção em mono maiúsculo, como no brand book | P1 | feito | 77a41f9 |
| [T-022](fechados/T-022-enter-depois-de-imagem.md) | Corrigir o Enter que não cria parágrafo em página com imagem vinda do Markdown | P1 | feito | 3c3d2b3 |
| [T-019](fechados/T-019-cores-so-no-manual.md) | Tirar as cores extras do Studio e manter só no manual exportado | P1 | feito | 240c3fb |
| [T-009](fechados/T-009-raio-de-papel.md) | Raio de 3 px na interface de trabalho | P1 | feito | 8a5867c |
| [T-001](fechados/T-001-fontes-no-export.md) | Embutir as fontes da marca no manual exportado | P0 | feito | 1d34585 |

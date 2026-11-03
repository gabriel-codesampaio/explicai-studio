# Tickets

Fila de trabalho do Studio. Formato e ciclo de vida: skill `tickets` do plugin [explicai-workflow](https://github.com/gabriel-codesampaio/explicai-workflow).

Prioridade: **P0** atinge quem lê o resultado final; **P1** é o pedido principal (tirar a cara de IA); **P2** incomoda, há como contornar; **P3** acabamento.

Ticket fechado (feito ou descartado) vai para `fechados/` com `git mv`.

## Lote de bugs

Decisão da pessoa (03/11/2026): bug (comportamento errado, perda de dado, falha de segurança, erro visível) é corrigido agora, em lotes de 2 a 3 tickets, por prioridade. Sugestão (melhoria, acabamento, refatoração, medição, doc) fica aberta, em espera.

Feitos no lote 1: T-107, T-088, T-092. Ordem do resto: T-093, T-094 (P2); T-098, T-099, T-100, T-101, T-102, T-103, T-024, T-076, T-077, T-078, T-081, T-080 (P3).

Em espera (sugestão): T-018, T-020, T-021, T-031, T-033, T-035, T-036, T-037, T-038, T-064, T-079, T-090, T-091, T-095, T-096, T-097, T-104, T-105, T-106.

## Abertos

| ID | Título | Prioridade | Status | Agente |
|----|--------|------------|--------|--------|
| [T-037](T-037-design-md-e-audit.md) | Gerar o DESIGN.md e rodar o audit do impeccable | P2 | aberto | design |
| [T-038](T-038-harden-antes-do-npm.md) | Rodar o harden do impeccable antes da versão pública no npm | P2 | aberto | design |
| [T-064](T-064-qa-da-imagem.md) | QA completo da feature de imagem do editor | P2 | em andamento | qa |
| [T-090](T-090-contagem-de-imagens-sem-uso-so-sob-demanda.md) | Contagem de imagens sem uso só sob demanda | P2 | aberto | frontend |
| [T-091](T-091-imagesize-le-so-o-cabecalho-do-arquivo.md) | `imageSize` lê só o cabeçalho do arquivo | P2 | aberto | frontend |
| [T-093](T-093-exportar-em-pasta-temporaria-e-trocar-no-fim.md) | Exportar em pasta temporária e trocar no fim | P2 | aberto | frontend |
| [T-094](T-094-renomear-arquivo-da-pagina-so-ao-parar-de-dig.md) | Renomear arquivo da página só ao parar de digitar o título | P2 | aberto | frontend |
| [T-097](T-097-testes-de-concorrencia-usestudio-e-fluxo-de-i.md) | Testes de concorrência, `useStudio` e fluxo de imagem | P2 | aberto | qa |
| [T-018](T-018-primeiro-print.md) | Página vazia que ensina o primeiro passo e onde exportar | P3 | aberto | design |
| [T-020](T-020-dimensoes-das-imagens.md) | Dimensões das imagens no HTML exportado | P3 | aberto | core |
| [T-021](T-021-serve-limpa-temporarios.md) | Apagar as pastas temporárias que o e2e/serve.mjs cria | P3 | aberto | qa |
| [T-024](T-024-indice-sem-rolagem-lateral.md) | Tirar a rolagem horizontal de "Nesta página" com título longo | P3 | aberto | design |
| [T-031](T-031-transicao-no-studio.md) | Transição curta ao trocar de página no Studio | P3 | aberto | frontend |
| [T-033](T-033-exportar-sem-rodape.md) | Exportar o manual sem o rodapé do Explicaí | P3 | aberto | frontend |
| [T-035](T-035-guia-de-contribuicao.md) | Guia de contribuição e código de conduta | P3 | aberto | frontend |
| [T-036](T-036-corretor-do-navegador.md) | Deixar o corretor do navegador explícito no editor e explicar na ajuda | P3 | aberto | frontend |
| [T-076](T-076-titulo-sem-tooltip-na-arvore.md) | Título truncado na árvore estreita sem tooltip | P3 | aberto | frontend |
| [T-116](T-116-ferramenta-ocultar-dados-sensiveis.md) | Ferramenta Ocultar dados sensíveis nos prints | P1 | aberto | frontend |
| [T-077](T-077-botoes-de-marcacao-no-toque.md) | Botões da barra de marcação abaixo de 44 px e sem nome no toque | P3 | aberto | design |
| [T-078](T-078-grupo-exportar-deslocado-em-375.md) | Grupo Versões / Rascunho / Exportar deslocado em 375 px | P3 | aberto | design |
| [T-079](T-079-breakpoint-900-duplicado.md) | Breakpoint de 900 px duplicado em COLUMN_MIN_REM e Navigation.tsx | P3 | aberto | frontend |
| [T-080](T-080-gitignore-sem-env.md) | Incluir .env no .gitignore | P3 | aberto | qa |
| [T-081](T-081-duas-marcas-com-gaveta-aberta.md) | Duas marcas visíveis com a gaveta aberta abaixo de 900 px | P3 | aberto | frontend |
| [T-095](T-095-serializar-o-markdown-so-no-flush-do-autosave.md) | Serializar o Markdown só no flush do autosave | P3 | aberto | frontend |
| [T-096](T-096-readpagetree-le-so-o-frontmatter.md) | `readPageTree` lê só o frontmatter | P3 | aberto | frontend |
| [T-098](T-098-descartar-resposta-antiga-ao-trocar-de-pagina.md) | Descartar resposta antiga ao trocar de página | P3 | aberto | frontend |
| [T-099](T-099-posicao-da-imagem-colada-acompanha-edicao-dur.md) | Posição da imagem colada acompanha edição durante o envio | P3 | aberto | frontend |
| [T-100](T-100-realpath-ao-servir-e-copiar-arquivos-do-manua.md) | `realpath` ao servir e copiar arquivos do manual | P3 | aberto | frontend |
| [T-101](T-101-erros-de-arquivo-sem-caminho-absoluto-diretor.md) | Erros de arquivo sem caminho absoluto; diretório vira 404 | P3 | aberto | frontend |
| [T-102](T-102-lixeira-pula-item-com-entry-json-quebrado.md) | Lixeira pula item com `entry.json` quebrado | P3 | aberto | frontend |
| [T-103](T-103-addpage-grava-o-arquivo-antes-da-arvore.md) | `addPage` grava o arquivo antes da árvore | P3 | aberto | frontend |
| [T-104](T-104-separar-css-de-html-ts-e-acoes-de-usestudio.md) | Separar CSS de `html.ts` e ações de `useStudio` | P3 | aberto | frontend |
| [T-105](T-105-verificar-pdf-com-100-imagens-lazy-maxbuffer.md) | Verificar PDF com 100 imagens (`lazy`, `maxBuffer`) | P3 | aberto | qa |
| [T-106](T-106-medir-arvore-com-500-paginas-e-memoizar-numer.md) | Medir árvore com 500 páginas e memoizar numeração | P3 | aberto | qa |

## Fechados

| ID | Título | Prioridade | Status | Commit |
|----|--------|------------|--------|--------|
| [T-107](fechados/T-107-seletor-de-tema-com-duas-opcoes-marcadas.md) | Seletor de tema mostra duas opções marcadas e não bate com o tema aplicado | P2 | feito | 0c31551, 07bbd4a |
| [T-088](fechados/T-088-limpar-imagens-sem-uso-gravar-a-fila-antes-e-.md) | Limpar imagens sem uso: gravar a fila antes e poupar arquivo novo | P2 | feito | 3b5c332, 6f90a74, c90dce1 |
| [T-092](fechados/T-092-marcacao-com-json-quebrado-vira-aviso-na-expo.md) | Marcação com JSON quebrado vira aviso na exportação | P2 | feito | 080b62a |
| [T-087](fechados/T-087-autosave-um-put-por-vez-por-pagina.md) | Autosave: um `PUT` por vez por página | P2 | feito | 84c43e9 |
| [T-089](fechados/T-089-aceitar-origin-so-da-mesma-porta-do-host.md) | Aceitar Origin só da mesma porta do Host | P2 | feito | 0b27143 |
| [T-086](fechados/T-086-imagens-com-etag-304-streaming-e-loading-lazy.md) | Imagens com ETag/304, streaming e `loading="lazy"` | P1 | feito | 7d7dfe7 |
| [T-082](fechados/T-082-svg-servido-sem-csp.md) | CSP e sandbox nas respostas de /files/ (SVG na origem do Studio) | P1 | feito | 0b27143 |
| [T-085](fechados/T-085-fila-por-pasta-em-updatemanual-perda-de-mudan.md) | Fila por pasta em `updateManual` (perda de mudança na árvore) | P1 | feito | ca2f2b0 |
| [T-084](fechados/T-084-icones-linha-e-coluna.md) | Ícones de adicionar linha e coluna da tabela | P3 | feito | 5f34c1c |
| [T-083](fechados/T-083-codigo-inline-e-link-no-editor.md) | Botão de código inline e fluxo de link: investigar e corrigir | P2 | feito | 6676df0 |
| [T-075](fechados/T-075-menu-barra-atras-da-barra-fixa.md) | Menu "/" aparece atrás da barra fixa | P1 | feito | bd8dfca |
| [T-074](fechados/T-074-e2e-copiar-imagem-usa-a-area-de-transferencia.md) | e2e de copiar e colar a imagem falha às vezes na suíte completa | P3 | feito | dd7572f |
| [T-073](fechados/T-073-controles-na-tabela.md) | Controles de tabela direto na tabela | P2 | feito | 236239e |
| [T-072](fechados/T-072-menu-barra-nao-rola-com-a-seta.md) | Menu "/": o item ativo some quando a seta desce | P1 | feito | 84a6cda |
| [T-071](fechados/T-071-esc-no-balao-da-imagem-perde-o-foco.md) | Esc no balão da descrição da imagem joga o foco para o body | P2 | feito | cbcd5a4 |
| [T-070](fechados/T-070-ctrl-end-antes-da-imagem.md) | Ctrl+End nem sempre leva o cursor para depois da imagem | P3 | feito | 6ead6cd |
| [T-069](fechados/T-069-uri-malformed-em-ingles.md) | Mensagem "URI malformed" em inglês no 400 do servidor | P3 | feito | ef631c1 |
| [T-068](fechados/T-068-fonte-na-pagina-de-erro-do-servidor.md) | Página HTML de erro do servidor sem a fonte Archivo | P3 | feito | 9838432 |
| [T-067](fechados/T-067-decodeuricomponent-sem-guarda.md) | decodeURIComponent sem guarda no hash e nas anotações | P2 | feito | 82a28b5 |
| [T-066](fechados/T-066-revisao-de-design-erros-e-export.md) | Revisão de design das páginas de erro (T-051) e do feedback do export (T-052) | P3 | feito | 708e54c |
| [T-065](fechados/T-065-fonte-do-manual-na-barra.md) | Escolher a fonte do manual pela barra de ferramentas | P2 | feito | bb4acc8 |
| [T-063](fechados/T-063-popover-da-imagem-no-rodape.md) | Popover da descrição da imagem não pode encostar no rodapé | P2 | feito | d3f5b38 |
| [T-062](fechados/T-062-ci-github-actions.md) | CI no GitHub Actions | P2 | feito | 3b44ed9 |
| [T-061](fechados/T-061-testes-da-web.md) | Testes unitários da web (autosave, rota, marcações, teclado) | P2 | feito | d03dde3 |
| [T-060](fechados/T-060-medir-cobertura.md) | Medir a cobertura de testes | P2 | feito | cfb82a0 |
| [T-059](fechados/T-059-deps-de-teste.md) | Dependências de teste (cobertura, Testing Library, axe) | P2 | feito | 40b3e87 |
| [T-058](fechados/T-058-testes-da-exportacao.md) | Testes da exportação (refs, collect, labels, safeHref, XSS, PDF) | P1 | feito | f83e3ec, 5f32ddf |
| [T-057](fechados/T-057-utf8-e-formato-em-disco.md) | UTF-8 e formato em disco | P1 | feito | ac1ea97 |
| [T-056](fechados/T-056-testes-fs-e-seguranca.md) | Testes de fs.ts, security.ts e caminho malformado | P2 | feito | f769ffb |
| [T-052](fechados/T-052-feedback-do-export.md) | Feedback visual ao exportar o manual | P2 | feito | 8fe288a |
| [T-051](fechados/T-051-paginas-de-erro.md) | Páginas de erro em tela cheia | P1 | feito | f09a58e |
| [T-050](fechados/T-050-cor-do-texto-44px.md) | Cor do texto com 44 px em toque e barra da seleção sem cobrir a fixa | P2 | feito | b46e5fb |
| [T-049](fechados/T-049-rodapes-alinhados.md) | Rodapés da barra lateral e da página na mesma linha | P2 | feito | 12a493c |
| [T-048](fechados/T-048-botao-imagem.md) | Botão "Imagem" na barra fixa, sem o atalho ao lado | P2 | feito | cd07ddb |
| [T-047](fechados/T-047-telas-de-erro.md) | Telas de erro: servidor fora, rota inexistente, erro inesperado | P1 | feito | 83dbbb0 |
| [T-046](fechados/T-046-titulo-corrompido.md) | Recusar corpo não UTF-8 que gravava U+FFFD no título | P1 | feito | a29b735 |
| [T-045](fechados/T-045-menu-ajustes.md) | Menu Ajustes com Idioma próprio, ícones e cursor de mão | P2 | feito | 5a05684 |
| [T-044](fechados/T-044-colar-print-fora-da-tela-no-celular.md) | "Colar print" fica fora da tela em 375 px | P2 | feito | 4282764 |
| [T-043](fechados/T-043-botao-exportar.md) | Exportar manual como último item do topo, à direita | P2 | feito | 7dc2f62 |
| [T-042](fechados/T-042-erros-traduzidos.md) | Erros do núcleo traduzidos na interface em inglês | P3 | feito | 8217af2 |
| [T-041](fechados/T-041-cor-pelo-teclado.md) | Cor do texto com nome visível e pelo teclado | P1 | feito | 74cb1e9 |
| [T-040](fechados/T-040-rodape-ajustes.md) | Rodapé da barra lateral como a linha "Ajustes" | P2 | feito | a2a2021 |
| [T-039](fechados/T-039-barra-na-selecao.md) | Barra flutuante na seleção, com cor do texto | P1 | feito | a39f7cf |
| [T-034](fechados/T-034-bloco-de-aviso.md) | Bloco de aviso (Dica, Atenção, Erro, Nota) | P2 | feito | 6144b88 |
| [T-032](fechados/T-032-logo-do-cliente.md) | Logo do cliente na capa do manual exportado | P2 | feito | 6798aef..77723fd |
| [T-030](fechados/T-030-fontes-do-manual.md) | Deixar a pessoa escolher as fontes do manual exportado | P2 | feito | 4d091d1 |
| [T-029](fechados/T-029-cores-do-manual.md) | Deixar a pessoa escolher as cores do manual exportado | P2 | feito | 230d294 |
| [T-028](fechados/T-028-textos-sem-traducao.md) | Traduzir os textos que ainda aparecem em português com a interface em inglês | P2 | feito | 4b1b5ff |
| [T-027](fechados/T-027-tokens-do-escuro.md) | Alinhar as cores do tema escuro ao brand book | P2 | feito | 45d97df |
| [T-026](fechados/T-026-aparencia-no-celular.md) | Abrir o painel Aparência dentro da tela no celular e marcar a opção escolhida no escuro | P2 | feito | 0eeb73a |
| [T-025](fechados/T-025-barra-no-celular.md) | Mostrar que a barra de ferramentas rola em 375 px | P2 | feito | 4282764 |
| [T-023](fechados/T-023-marcacao-no-celular.md) | Deixar a legenda editável no diálogo de marcação em 375 px | P2 | feito | f8be5dd |
| [T-022](fechados/T-022-enter-depois-de-imagem.md) | Corrigir o Enter que não cria parágrafo em página com imagem vinda do Markdown | P1 | feito | 3c3d2b3 |
| [T-019](fechados/T-019-cores-so-no-manual.md) | Tirar as cores extras do Studio e manter só no manual exportado | P1 | feito | 240c3fb |
| [T-017](fechados/T-017-status-legivel.md) | Status da página mais legível | P2 | feito | 87eeb8e |
| [T-016](fechados/T-016-um-nome-para-versao.md) | Um nome só para a versão do manual final | P2 | feito | 94ee9a3 |
| [T-015](fechados/T-015-so-aprovadas-sem-aprovadas.md) | "Só páginas aprovadas" desabilitado quando não há nenhuma | P2 | feito | bf91cab |
| [T-014](fechados/T-014-atalhos-de-marcacao.md) | Atalhos de letra nas ferramentas de marcação | P2 | feito | 955d683 |
| [T-013](fechados/T-013-tela-dividida.md) | Manter a árvore visível em tela dividida (~960 px) | P2 | feito | c4b1f33 |
| [T-012](fechados/T-012-marcacoes-do-brand-book.md) | Marcações como no brand book | P2 | feito | 6be64a9 |
| [T-011](fechados/T-011-amarelo-com-um-sentido.md) | Dar ao amarelo um sentido só (conteúdo e página ativa) | P2 | feito | dd8b1b9 |
| [T-010](fechados/T-010-barra-colar-print.md) | "Colar print" com Ctrl+V na barra de ferramentas | P1 | feito | 428cbc6 |
| [T-009](fechados/T-009-raio-de-papel.md) | Raio de 3 px na interface de trabalho | P1 | feito | 8a5867c |
| [T-008](fechados/T-008-menu-barra-com-previa.md) | Menu "/" com prévia do bloco e grupos, sem ícones em quadrado | P1 | feito | 1ba09e3 |
| [T-007](fechados/T-007-icones-decorativos.md) | Tirar os ícones que só decoram e usar a extensão do arquivo na exportação | P1 | feito | 205d9c4 |
| [T-006](fechados/T-006-exportar-no-topo.md) | Levar "Exportar manual" para o topo da página como botão principal | P1 | feito | 060a936 |
| [T-005](fechados/T-005-manual-como-cabecalho.md) | Mostrar o nome do manual como cabeçalho, sem caixa | P1 | feito | d5f92a0 |
| [T-004](fechados/T-004-numeracao-na-arvore.md) | Mostrar a numeração 2.1 na árvore de páginas e na busca | P1 | feito | c558b39 |
| [T-003](fechados/T-003-rotulos-mono.md) | Usar rótulos de seção em mono maiúsculo, como no brand book | P1 | feito | 77a41f9 |
| [T-002](fechados/T-002-titulos-do-export.md) | Corrigir o pulo de nível de título no manual exportado | P2 | feito | afbfa87 |
| [T-001](fechados/T-001-fontes-no-export.md) | Embutir as fontes da marca no manual exportado | P0 | feito | 1d34585 |

# Tickets

Fila de trabalho do Studio. Formato e ciclo de vida: skill `tickets` do plugin [explicai-workflow](https://github.com/gabriel-codesampaio/explicai-workflow).

Prioridade: **P0** atinge quem lê o resultado final; **P1** é o pedido principal (tirar a cara de IA); **P2** incomoda, há como contornar; **P3** acabamento.

Ticket fechado (feito ou descartado) vai para `fechados/` com `git mv`.

Bug (comportamento errado, perda de dado, falha de segurança, erro visível) é corrigido agora, por prioridade. Sugestão (melhoria, acabamento, refatoração) espera até a pessoa pedir.

## Abertos

| ID | Título | Prioridade | Status | Agente |
|----|--------|------------|--------|--------|
| [T-134](T-134-export-por-publico-sobrescreve.md) | HTML e Markdown de perfis diferentes se sobrescrevem | P3 | aberto | frontend |
| [T-135](T-135-menu-de-publico-dois-cliques.md) | Menu de público sem trava contra dois cliques | P3 | aberto | frontend |
| [T-136](T-136-matriz-do-popover-de-publico.md) | Matriz de tela do Popover de público | P3 | aberto | qa |
| [T-137](T-137-pdf-por-publico-com-chrome.md) | PDF por público com Chrome de verdade | P3 | aberto | qa |
| [T-147](T-147-capa-e-rodape-editaveis.md) | Editar a capa e o rodapé do manual | P2 | aberto | frontend |
| [T-148](T-148-passeio-guiado-no-studio.md) | Passeio guiado no primeiro uso do Studio | P3 | aberto | frontend |
| [T-149](T-149-sobras-da-revisao-de-desempenho.md) | Fila entre processos e tamanho do bundle | P3 | aberto | frontend |
| [T-150](T-150-manual-do-app-de-terceiro-com-banco-local.md) | Prova do MCP em app de terceiro, com banco local | P3 | aberto | supervisor |
| [T-130](T-130-menores-do-t-123.md) | Menores deixados pelo T-123 | P3 | aberto | frontend |
| [T-129](T-129-testes-instaveis.md) | Testes que falham às vezes: reduzir e unused-assets-race | P3 | aberto | qa |
| [T-127](T-127-e2e-primeiro-uso-fragil.md) | E2e "primeiro uso" falha em paralelo | P3 | aberto | qa |
| [T-128](T-128-conferir-lote-6-na-tela.md) | Conferir na tela o que o lote 6 não viu | P3 | aberto | design |
| [T-138](T-138-personalizar-cor-das-marcacoes.md) | Personalizar a aparência das marcações de imagem | P2 | aberto | frontend |
| [T-037](T-037-design-md-e-audit.md) | Gerar o DESIGN.md e rodar o audit do impeccable | P2 | aberto | design |
| [T-064](T-064-qa-da-imagem.md) | QA completo da feature de imagem do editor | P2 | em andamento | qa |
| [T-031](T-031-transicao-no-studio.md) | Transição curta ao trocar de página no Studio | P3 | aberto | frontend |
| [T-104](T-104-separar-css-de-html-ts-e-acoes-de-usestudio.md) | Separar CSS de `html.ts` e ações de `useStudio` | P3 | aberto | frontend |
| [T-105](T-105-verificar-pdf-com-100-imagens-lazy-maxbuffer.md) | Verificar PDF com 100 imagens (`lazy`, `maxBuffer`) | P3 | aberto | qa |
| [T-106](T-106-medir-arvore-com-500-paginas-e-memoizar-numer.md) | Medir árvore com 500 páginas e memoizar numeração | P3 | aberto | qa |

## Fechados

| ID | Título | Prioridade | Status | Commit |
|----|--------|------------|--------|--------|
| [T-125](fechados/T-125-manual-de-app-real-pelo-mcp.md) | Manual de um app real feito com o MCP | P1 | feito | codelab #2, #3, #4 |
| [T-133](fechados/T-133-decisoes-da-marcacao-de-imagem.md) | Decisões da marcação de imagem | P2 | feito | #30 |
| [T-141](fechados/T-141-sidebar-corta-titulos-cedo.md) | Sidebar corta títulos e o seletor do manual cedo demais | P2 | feito | #36 |
| [T-142](fechados/T-142-status-so-bolinha-na-arvore.md) | Status da página vira só a bolinha na árvore | P2 | feito | #36 |
| [T-140](fechados/T-140-menu-de-bloco-abre-no-canto.md) | Menu de tipo de bloco abre no canto da tela | P1 | feito | #34 |
| [T-143](fechados/T-143-renomear-o-manual.md) | Renomear o manual | P2 | feito | #37 |
| [T-144](fechados/T-144-remover-versao-da-pagina.md) | Remover uma versão da página | P2 | feito | #38 |
| [T-145](fechados/T-145-marca-texto-no-editor.md) | Marca-texto (caneta marcadora) no editor | P2 | feito | #39 |
| [T-146](fechados/T-146-divisor-no-menu-de-blocos.md) | Componente divisor (linha divisória) | P2 | feito | #40 |
| [T-139](fechados/T-139-passo-depois-de-imagem-volta-ao-1.md) | Passo depois de imagem volta a numerar do 1 | P1 | feito | #31 |
| [T-132](fechados/T-132-leitura-do-export-html.md) | Leitura do manual exportado em HTML | P1 | feito | #28 |
| [T-131](fechados/T-131-prompts-depois-da-critica.md) | Prompts do MCP depois da crítica do manual | P1 | feito | explicai-mcp #7 |
| [T-035](fechados/T-035-guia-de-contribuicao.md) | Guia de contribuição e código de conduta | P3 | feito | #27 |
| [T-124](fechados/T-124-manual-por-publico.md) | Manual por público, um export para cada perfil | P2 | feito | #25, explicai-mcp #6 |
| [T-123](fechados/T-123-mcp-fase-2-sugere-e-automatiza.md) | MCP fase 2, sugerir e automatizar | P1 | feito | #23, explicai-mcp #5 |
| [T-122](fechados/T-122-mcp-fase-1-funciona.md) | MCP fase 1, o agente cria e exporta um manual | P1 | feito | #18, #21 |
| [T-126](fechados/T-126-piloto-do-mcp-no-codelab.md) | Piloto do MCP no CodeLab | P1 | feito | explicai-mcp #4 |
| [T-020](fechados/T-020-dimensoes-das-imagens.md) | Dimensões das imagens no HTML exportado | P3 | feito | `a8f670b` |
| [T-033](fechados/T-033-exportar-sem-rodape.md) | Exportar o manual sem o rodapé do Explicaí | P3 | feito | `e59a29e` |
| [T-036](fechados/T-036-corretor-do-navegador.md) | Deixar o corretor do navegador explícito no editor e explicar na ajuda | P3 | feito | `9f84f65` |
| [T-018](fechados/T-018-primeiro-print.md) | Página vazia que ensina o primeiro passo e onde exportar | P3 | feito | `f7cf737` |
| [T-121](fechados/T-121-ocultar-com-desfoque.md) | Ocultar com desfoque, além da tarja | P2 | feito | — |
| [T-116](fechados/T-116-ferramenta-ocultar-dados-sensiveis.md) | Ferramenta Ocultar dados sensíveis nos prints | P1 | feito | `4889a1b` |
| [T-076](fechados/T-076-titulo-sem-tooltip-na-arvore.md) | Título truncado na árvore estreita sem tooltip | P3 | feito | `58cad86` |
| [T-118](fechados/T-118-recortar-imagem.md) | Recortar imagem | P2 | feito | `4cac12b` |
| [T-119](fechados/T-119-reduzir-resolucao-da-imagem.md) | Reduzir resolução e peso da imagem | P3 | feito | `82a1c53` |
| [T-117](fechados/T-117-tamanho-de-exibicao-da-imagem.md) | Tamanho de exibição da imagem (Pequena, Média, Larga) | P2 | feito | `481ee61` |
| [T-112](fechados/T-112-e2e-barra-da-selecao-instavel.md) | e2e "barra da seleção" falha às vezes | P2 | feito | — |
| [T-113](fechados/T-113-foco-do-painel-aparencia-sem-fallback.md) | Painel Aparência: foco sem fallback | P3 | feito | — |
| [T-114](fechados/T-114-linha-de-status-mente-durante-conflito-de-disco.md) | Rodapé diz "Não foi possível salvar" durante conflito de disco | P3 | feito | — |
| [T-115](fechados/T-115-rodape-em-tela-estreita-esconde-o-caminho.md) | Rodapé em tela estreita esconde o caminho | P3 | feito | — |
| [T-099](fechados/T-099-posicao-da-imagem-colada-acompanha-edicao-dur.md) | Posição da imagem colada acompanha edição durante o envio | P3 | feito | 1164a5a |
| [T-097](fechados/T-097-testes-de-concorrencia-usestudio-e-fluxo-de-i.md) | Testes de concorrência, `useStudio` e fluxo de imagem | P2 | feito | 50422fa |
| [T-096](fechados/T-096-readpagetree-le-so-o-frontmatter.md) | `readPageTree` lê só o frontmatter | P3 | descartado | medido, sem ganho |
| [T-095](fechados/T-095-serializar-o-markdown-so-no-flush-do-autosave.md) | Serializar o Markdown só no flush do autosave | P3 | descartado | medido, sem ganho |
| [T-120](fechados/T-120-sync-de-rename-corre-com-o-autosave.md) | `settleRenames` corre com o autosave e mostra conflito falso | P2 | feito | — |
| [T-090](fechados/T-090-contagem-de-imagens-sem-uso-so-sob-demanda.md) | Contagem de imagens sem uso só sob demanda | P2 | feito | — |
| [T-091](fechados/T-091-imagesize-le-so-o-cabecalho-do-arquivo.md) | `imageSize` lê só o cabeçalho do arquivo | P2 | feito | — |
| [T-021](fechados/T-021-serve-limpa-temporarios.md) | Apagar as pastas temporárias que o e2e/serve.mjs cria | P3 | feito | — |
| [T-024](fechados/T-024-indice-sem-rolagem-lateral.md) | Tirar a rolagem horizontal de "Nesta página" com título longo | P3 | feito | — |
| [T-077](fechados/T-077-botoes-de-marcacao-no-toque.md) | Botões da barra de marcação abaixo de 44 px e sem nome no toque | P3 | feito | — |
| [T-078](fechados/T-078-grupo-exportar-deslocado-em-375.md) | Grupo Versões / Rascunho / Exportar deslocado em 375 px | P3 | feito | — |
| [T-079](fechados/T-079-breakpoint-900-duplicado.md) | Breakpoint de 900 px duplicado em COLUMN_MIN_REM e Navigation.tsx | P3 | feito | — |
| [T-081](fechados/T-081-duas-marcas-com-gaveta-aberta.md) | Duas marcas visíveis com a gaveta aberta abaixo de 900 px | P3 | feito | — |
| [T-080](fechados/T-080-gitignore-sem-env.md) | Incluir .env no .gitignore | P3 | feito | 354eb5a |
| [T-108](fechados/T-108-detectar-edicao-feita-fora-do-studio.md) | Detectar edição feita fora do Studio antes de sobrescrever | P1 | feito | f2a4e8b, e33ea45 |
| [T-111](fechados/T-111-pacote-npm-pronto-para-publicar.md) | Pacote npm pronto para publicar | P1 | feito | 655ddfe, 6e15458, 366757e |
| [T-109](fechados/T-109-marcacao-json-com-forma-errada.md) | Marcação com JSON válido de forma errada derruba a exportação | P2 | feito | 1004374 |
| [T-110](fechados/T-110-findunusedassets-stat-paralelo-e-enoent.md) | findUnusedAssets: stat em paralelo e ENOENT tolerado | P2 | feito | e7623cb |
| [T-038](fechados/T-038-harden-antes-do-npm.md) | Rodar o harden do impeccable antes da versão pública no npm | P2 | feito | 52102f6 |
| [T-093](fechados/T-093-exportar-em-pasta-temporaria-e-trocar-no-fim.md) | Exportar em pasta temporária e trocar no fim | P2 | feito | a08b2bb |
| [T-094](fechados/T-094-renomear-arquivo-da-pagina-so-ao-parar-de-dig.md) | Renomear arquivo da página só ao parar de digitar o título | P2 | feito | c825a9b, 8e0d79f |
| [T-098](fechados/T-098-descartar-resposta-antiga-ao-trocar-de-pagina.md) | Descartar resposta antiga ao trocar de página | P3 | feito | c1c8e26 |
| [T-100](fechados/T-100-realpath-ao-servir-e-copiar-arquivos-do-manua.md) | `realpath` ao servir e copiar arquivos do manual | P3 | feito | 03f0511 |
| [T-101](fechados/T-101-erros-de-arquivo-sem-caminho-absoluto-diretor.md) | Erros de arquivo sem caminho absoluto; diretório vira 404 | P3 | feito | 61e1082 |
| [T-102](fechados/T-102-lixeira-pula-item-com-entry-json-quebrado.md) | Lixeira pula item com `entry.json` quebrado | P3 | feito | 1ecc274 |
| [T-103](fechados/T-103-addpage-grava-o-arquivo-antes-da-arvore.md) | `addPage` grava o arquivo antes da árvore | P3 | feito | b9496ba |
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

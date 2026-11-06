# Changelog

Todas as mudanças importantes do Explicaí Studio ficam aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

All notable changes to Explicaí Studio are listed here, in Portuguese first with a short English summary at the end of each release. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Adicionado

- `AnnotationsPatch` (`explicai/core`) aceita `style` em cada item, e os tipos do estilo saem de `explicai/core`; é o que o `annotate_image` do MCP usa. / `AnnotationsPatch` takes a per-item `style`; style types are exported from `explicai/core`.

### Alterado

- Aparência do manual: a cor dos títulos é uma só ("Cor dos títulos"), com "Ajustar por nível" para mudar cada um. O padrão dos títulos passou de preto (`#000000`) para o nanquim da marca (`#151a33`): manuais que nunca escolheram cor de título saem no HTML e no PDF com os títulos em nanquim. Quem quer o preto escolhe `#000000`.

### English summary

Manual appearance has a single "Heading color" with "Adjust by level" for per-level colors. The default heading color changed from black (`#000000`) to the brand ink (`#151a33`), so manuals that never set a heading color export with ink headings in HTML and PDF.

## [1.0.0] - 2026-11-05

### Adicionado

- Aparência do manual nos Ajustes, fora da tela de exportação, com amostra ao vivo do tema e uma seção Capa e rodapé com prévia e sugestões. Capa e rodapé ficam no `manual.json` e saem no HTML e no PDF (no PDF, o rodapé vai na margem de cada página, com número de página opcional). O Markdown não muda. Um botão no cabeçalho da página abre a capa e o rodapé direto.
- Públicos: diálogo nos Ajustes para criar, renomear e remover, com a lista de páginas que ficam abertas a todos quando você remove um público. O termo "Público" vale em toda a interface e "Ver como público" fica acima da busca da barra lateral.
- Painel Estilo nas marcações: cor, tamanho, espessura, borda e preenchimento valem só para o item selecionado e passam por cima do estilo da imagem. O destaque ganhou paleta de marca-texto, preenchimento e a opção de borda nenhuma. Tudo vale no Studio, no HTML e no PDF.
- Marcações mais cômodas: setas movidas pelo teclado, número centrado no marcador, barra com divisor e dica visível, excluir pelo painel Estilo, foco na legenda do marcador novo (Esc devolve o teclado) e pergunta antes de fechar com mudanças não salvas.
- Passeio guiado no primeiro uso, só em manual vazio, com entrada animada e deslize entre os passos. Reabre pelo menu Ajustes.
- Fonte por trecho: menu de fonte na barra da seleção (Ctrl+Shift+F), salvo no Markdown e renderizado no HTML e no PDF.
- Botão "Remover imagem" no painel da imagem.
- Lixeira e ajuda no rodapé da barra lateral. A lixeira pede confirmação e cuida do foco.
- Busca por digitação na árvore de páginas.
- Transição curta ao trocar de página.
- Ao voltar para a aba, o Studio atualiza manuais, árvore e página. O aviso de conflito mostra o que mudou sem empurrar a página, e uma página apagada por fora pode ser recriada.
- Manual de formato mais novo abre só para leitura, com aviso para atualizar o Studio.
- Atalhos de teclado em teclas (`Kbd`), com Refazer na lista, e um Select próprio no lugar dos três nativos.
- A marca do Explicaí na tela de primeiro uso, `main`, regiões nomeadas e link de pular nas telas.
- Documentação da 1.0: política de compatibilidade e versionamento, formato do manual, metas de desempenho medidas para 500 páginas e modelos de issue no GitHub. O CI roda em Linux, Windows e macOS.

### Alterado

- O Studio pede Node 22.12 ou mais novo (antes, 20.12), a versão testada no CI.
- Formato do manual: a versão 1 só cresce por acréscimo (`FORMAT_VERSION` continua 1). Todo manual criado desde a 0.1 abre, edita e exporta em qualquer 1.x. Estilo por item, capa, rodapé, públicos e fonte por trecho são campos opcionais, e campos desconhecidos em `manual.json` e `assets/<imagem>.json` são preservados ao regravar.
- A barra da seleção abre para cima, por cima da barra fixa quando o texto está no topo. No celular ela vira para baixo para não cobrir a barra de formatação.
- Versões: o nome da versão fica visível, o botão Versões encurta e o texto deixa claro que a versão vale para a página.
- Menu da etapa da página com um indicador por item, dicas de status com o gênero certo e cursor de clique em selects, caixas, rádios e rótulos.
- Barra lateral sem a barra de rolagem passando pelo rodapé. Barra de rolagem fina, na cor da marca, sem cobrir o painel vizinho. Alvos pequenos chegam a 24 px.
- A árvore de páginas, a numeração e o público ativo ficam memoizados, para manuais de centenas de páginas.
- Imagem inválida, marcações ou ocultar dados em manual de formato mais novo são recusados com erro claro, sem gravar.
- Erros do Reduzir imagem, da consulta do git, da carga de imagens da marcação e da sincronização ao voltar o foco passam a aparecer.
- Criar manual desabilitado explica o motivo.

### Corrigido

- Trocar rápido de manual não mostra mais o conteúdo do manual anterior.
- Ao fechar menu ou diálogo, o foco volta ao botão que abriu, e o fundo dos menus fica inerte para leitores de tela.
- Cores inválidas, texto de capa ou rodapé que não é texto e outros valores errados no `manual.json` editado à mão deixam de quebrar ou de entrar no HTML exportado.
- Área clicável invisível quando a imagem não tem borda.
- A Aparência abre em manual sem rodapé salvo; a amostra de cor dos títulos fica legível no tema escuro e a linha de fontes não é mais cortada em telas de 1024 px.
- Aviso de conflito: foco levado à faixa, estrutura do trecho que difere corrigida, e a página não troca nem apaga texto novo ao atualizar no foco.
- Exportar mantém o botão e o resultado à vista no diálogo.
- Menu de público por página isolado; Esc na edição da linha não fecha o diálogo; trocas de público gravadas em fila.
- Imagem reabre o balão no primeiro clique depois de fechar a marcação; a imagem não encolhe ao marcar e o painel de marcação não gera rolagem lateral.
- Busca e menu `/` sem lista vazia; ponto do item de rádio no menu; `checkManual` sem falsos positivos.
- Arquivo da lixeira de um público fica confinado à pasta da entrada, e a limpeza de imagens da lixeira é protegida.
- Contraste da borda do marca-texto no tema escuro, cabeçalho de tabela nova com texto e trilha do manual repetido no celular.

### Summary

Explicaí Studio 1.0 adds a Manual appearance screen (live theme sample, cover and footer in HTML and PDF), Audiences managed from Settings, a per-item Style panel for annotations (color, size, thickness, border, fill), per-selection fonts, a guided first-use tour, and a sidebar with trash and help in the footer. The page tree, search, conflict notice and focus handling were reworked, and the selection toolbar flips below the text on phones. Studio needs Node 22.12 or newer, and CI now covers Linux, Windows and macOS. The manual format stays at version 1 and only grows by addition: every manual created since 0.1 opens, edits and exports in any 1.x, and a manual from a newer format opens read-only. Fixes cover quick manual switching, focus return after menus and dialogs, hand-edited `manual.json` values, and several accessibility details.

## [0.3.0] - 2026-11-04

### Adicionado

- Aparência das marcações por imagem (`style` em `assets/<imagem>.json`): cor de uma paleta de 6 (cobalto, tinta, vermelho, verde, roxo, laranja, todas com contraste de 4,5:1 ou mais), tamanho do marcador (20, 24 ou 32 px) e espessura da seta e do contorno (3 degraus). Painel "Aparência" no editor de marcação; vale no Studio, no HTML e no PDF. Sem `style`, tudo sai como antes; o `annotate_image` do MCP preserva o campo ao regravar.
- Divisor (linha divisória) no menu de blocos e no menu `/`; `---` no arquivo, `<hr>` no HTML e no PDF.
- Marca-texto no editor (botão nas duas barras e Ctrl+Shift+H), salvo como `==texto==`. No HTML e no PDF vira `<mark>` amarelo; o Markdown exportado mantém `==texto==`.
- Versões: botão "Remover" em cada versão guardada, com confirmação no diálogo. A versão marcada como "Usar no manual" não se remove (botão desligado, dica "Escolha outra versão antes"). Rota `DELETE /api/manuals/:slug/pages/:id/versions/:versionId` (409 para a marcada).
- Renomear o manual pelo seletor do Studio (`PUT /api/manuals/:slug`): muda só o `title` em `manual.json`; pasta, endereço e ids ficam iguais.
- Público: `audience` na página e `audiences` no manual; exportar HTML, PDF e Markdown por perfil, sem texto, imagem nem sumário das páginas de fora. Link para página de fora vira texto, com aviso. Público não é controle de acesso.
- Salvar uma página preserva os campos do frontmatter que o Studio não conhece (`sources:` etc.).
- Exportar: opção "Sem o rodapé do Explicaí" no HTML e no PDF (`theme.hideColophon`).
- Página vazia: passo a passo do primeiro print, com atalho para Exportar; o mesmo texto está na ajuda.
- Editor: corretor ortográfico explícito no idioma do manual e, na ajuda, como adicionar uma palavra ao dicionário.

### Alterado

- Exportar para um público grava HTML e Markdown em `exportacao/html-<perfil>/` e `exportacao/markdown-<perfil>/` (como o PDF), sem apagar o export de outro perfil.

- Exportar HTML: destaque em "Resultado:" e "Result:", print largo abre no tamanho original, sumário com as seções e recolhível no celular, navegação entre páginas e capa com tempo de leitura e por onde começar.
- Marcador de imagem: disco numerado de 24 px com cauda apontando o alvo, no Studio e no HTML e PDF exportados. A posição gravada continua sendo o alvo; manuais antigos abrem sem perder marcador.
- Marcador sem descrição não gera mais a linha "Sem descrição" na legenda (HTML, PDF e Markdown). O Studio avisa na lista de marcações e `checkManual` aponta o marcador sem descrição.

### Corrigido

- Editor: a legenda da imagem fica afastada do print e sem recuo; o estilo das listas do texto anulava esse espaço.

- Exportar HTML e PDF: o passo depois de um print segue a numeração, em vez de voltar ao 1.
- Exportar HTML: imagens com `width` e `height`, para a página não pular enquanto carrega.

### English summary

Audience: pages and manuals can declare who they are for, and HTML, PDF and Markdown exports can be limited to one profile (not access control). Highlighter in the editor (`==text==`, exported as `<mark>`), divider block, per-image annotation appearance (color, marker size, stroke), delete saved versions, rename a manual from the picker, optional "no Explicaí footer" on export, and a first-screenshot walkthrough on empty pages. Exports number steps correctly after an image, and image markers are numbered discs with a tail pointing at the target. Saving a page keeps unknown frontmatter fields. New `explicai/core` API used by the MCP server.

## [0.2.1] - 2026-11-03

### Corrigido

- Aparência: com Sistema marcado, o painel diz se o tema valendo agora é claro ou escuro.
- Editor: imagem colada ou solta acompanha o texto digitado durante o envio e entra no ponto certo, sem erro quando a página encolhe.
- CLI: `--version` mostra a versão, e opção desconhecida mostra o uso em vez de um erro do Node.

### English summary

An image pasted while you type now lands in the right place. With System selected, the Appearance panel says which theme is active. `--version` works, and an unknown CLI option shows the usage instead of a Node error.

## [0.2.0] - 2026-11-03

A 0.1.0 foi a primeira versão do Studio; este bloco reúne o que entrou desde a tag `v0.1.0`.

### Adicionado

- Exportação: fontes empacotadas (Archivo, Atkinson Hyperlegible Next, Inter, Source Sans 3, Source Serif 4, Lora, Montserrat, Playfair Display e JetBrains Mono, todas OFL) que vão junto do HTML exportado, e escolha da fonte do texto e dos títulos no diálogo e pela barra do editor.
- Exportação: tema do manual com cor do texto, dos títulos por nível, de realce e de destaque, com o nome de cada cor, e logo do cliente na capa (enviado e retirado no diálogo de exportação, limite de 1 MB).
- Exportação: o diálogo mostra a etapa, o resultado e o erro com nova tentativa; "Exportar manual" foi para o fim do topo, à direita.
- Editor: cor do texto com paleta fixa e nome de cada cor, também pelo teclado e na barra fixa; barra flutuante na seleção com o tipo do bloco, formatação e cor.
- Editor: bloco de alerta (salvo como alerta GFM, exportado com rótulo em texto e cor por tipo), menu `/` com blocos agrupados e prévia, controles de linha e coluna direto na tabela, botão "Colar print" com Ctrl+V visível, barra de formatação rolável no celular.
- Marcações do print: atalhos de letra (V, M, D, S, A) e barra compacta; seta, marcador e legenda redesenhados como no brand book, no editor e no export.
- Páginas: numeração na árvore e na busca com a mesma regra do sumário exportado, status escrito e legível, e o nome do arquivo da página só muda quando se para de digitar o título.
- Interface: telas de erro em tela cheia (servidor fora com reconexão de espera crescente, rota inexistente, erro inesperado), erros do núcleo com código e parâmetros estáveis, traduzidos em português e inglês, menu Ajustes com Idioma e Aparência, e página HTML de erro do servidor alinhada à marca.
- Layout: árvore em coluna estreita de 900 a 1023 px, marca na barra do topo, alvos de toque de 44 px no celular.
- Testes e CI: GitHub Actions com lint, tipos, testes com cobertura e ponta a ponta; cobertura medida com `npm run test:cov`; testes novos para sistema de arquivos, segurança, UTF-8, exportação, editor e pacote npm.
- Edição feita fora do Studio (MCP, outro editor): o servidor devolve a versão da página (`If-Match`, 409 `disk-conflict`) e o Studio avisa em vez de sobrescrever, com "Recarregar do disco" e "Manter a minha versão".
- Imagem: ferramenta Ocultar (O) para dados sensíveis, com Tarja (padrão) ou Desfoque forte (pixelado e borrado), queimados nos pixels; o original é apagado, com aviso quando a pasta está no git e lembrete de que exports antigos ainda têm o original.
- Imagem: tamanho de exibição Pequena, Média ou Larga, guardado no JSON ao lado da imagem e respeitado no editor, no HTML e no PDF.
- Imagem: Recortar (R), com as marcações reposicionadas e a confirmação listando as que vão sumir; Reduzir resolução e peso, sugerindo 1600 px de largura e sem nunca ampliar.
- Pacote npm: CHANGELOG, descrição bilíngue, palavras-chave e README para quem chega pelo npm.

### Alterado

- O Studio usa sempre o cobalto da marca, com seleção de texto em cobalto translúcido; raio de 3 px vindo de um token; rótulos de seção em mono maiúsculo; ícones decorativos removidos.
- "Versão do manual" é o nome único da versão apontada para o manual final.
- Imagens do Studio carregam com `loading="lazy"` e o servidor entrega arquivos com ETag, 304 e streaming.
- O botão do balão da imagem e o título do editor dizem "Editar imagem" (era "Marcar imagem").
- Legenda da imagem: três ou mais marcadores seguidos sem descrição viram um selo só com intervalo ("1–8").
- Lixeira: o painel não conta mais as imagens sem uso ao abrir; o botão fica sempre visível e avisa quando não há nada.
- O pacote publicado não leva mais os mapas de código (`.map`).

### Corrigido

- Autosave: grava uma página por vez, guarda uma mudança pendente por página e descarta a resposta antiga ao trocar de página.
- Autosave: o renome do arquivo (5 s depois do título) espera a gravação em voo e leva a versão nova, sem faixa de conflito falsa; com a faixa de conflito aberta, o rodapé diz "Aguardando sua escolha" em vez de "Não foi possível salvar".
- Núcleo: `updateManual` passou a ter fila por pasta (sem perder mudanças simultâneas); `addPage` grava o arquivo antes da árvore; a lixeira pula item com `entry.json` quebrado; `findUnusedAssets` ignora arquivo que sumiu; dois envios do mesmo nome de imagem não dão mais `EEXIST`; manual com BOM no começo abre; restaurar uma página fecha a lixeira.
- Limpeza de imagens sem uso: grava a fila do autosave antes, poupa imagem gravada há menos de 1 minuto e volta a 60 s quando a carência é inválida.
- Exportação: gera em pasta temporária e troca só no fim; marcação com JSON quebrado ou de forma errada vira aviso e a imagem sai pura; aviso quando a página cita imagem que não existe; `%` solto em link ou imagem não derruba mais a exportação; lê `width` e `height` de SVG; sem pulo de nível de título; "Só páginas aprovadas" fica desabilitado quando nenhuma está aprovada.
- Servidor: `%` malformado na URL responde 400 com código estável; corpo JSON que não é UTF-8 válido é recusado; diretório vira 404.
- Editor: Enter depois de imagem, ordem de várias imagens coladas, Esc no balão da imagem devolve o foco, Ctrl+End leva ao fim da página, menu `/` não fica atrás da barra fixa nem deixa de rolar com a seta, negrito e link junto de código no texto, popover da imagem ancorado dentro da área útil.
- Interface: título longo da página não corta ao carregar a fonte; erro ao trocar a fonte do manual aparece; contraste de 3:1 na borda de campo e na amostra de cor nos dois temas, seletor de tema com uma só opção marcada, título longo da árvore truncado, marca que não quebra em duas linhas.

- Telas: foco do painel Aparência sem opção marcada, rodapé em tela estreita mostra o caminho inteiro, botões da barra de marcação com 44 px e nome no toque, grupo Versões/Exportar alinhado em 375 px, uma marca só com a gaveta aberta, "Nesta página" sem rolagem lateral, nome inteiro do título truncado na árvore ao passar o mouse.
- Desempenho: `imageSize` lê só o começo do arquivo.

### Segurança

- Recusa link simbólico que sai da pasta do manual ao servir e ao copiar arquivos (`realpath`).
- CSP em `/files/` (SVG não executa script) e `Origin` aceito só da mesma porta do `Host`.
- Erros de arquivo sem caminho absoluto na resposta.
- Testes de escape contra XSS na exportação e de HTML colado no texto.

### Interno

- CI: publicação no npm com provenance e release no GitHub ao enviar uma tag `vX.Y.Z`; suíte e2e estável no CI (espera a seleção do editor antes do próximo passo); pastas temporárias do e2e apagadas ao fim.
- Regras do projeto (Conventional Commits, arquitetura, testes, revisão) e plugin da equipe de agentes; tickets em `docs/tickets`; documentação do formato do manual atualizada com tema, cor do texto, alertas e logo.

### English summary

New since 0.1.0: bundled OFL fonts and font choice for exports, manual theme colors and client logo, alert blocks, text colors with names, a floating selection toolbar, a richer `/` menu, table row and column controls, annotation shortcuts, full-screen error pages, translated errors, GitHub Actions CI and a much larger test suite. New: warning instead of overwrite when a page changed on disk outside the Studio. Image tools: hide sensitive data (solid bar or strong blur burned into the pixels), display size (small, medium, wide), crop with annotations remapped, and resolution/weight reduction. Fixes cover autosave races, per-folder write queue, atomic exports, unused-image cleanup and many editor and accessibility details. Security: symlinks that leave the manual folder are refused, CSP on `/files/`, same-port `Origin` check. The npm package no longer ships source maps.

[Unreleased]: https://github.com/gabriel-codesampaio/explicai-studio/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/gabriel-codesampaio/explicai-studio/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/gabriel-codesampaio/explicai-studio/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/gabriel-codesampaio/explicai-studio/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/gabriel-codesampaio/explicai-studio/compare/v0.1.0...v0.2.0

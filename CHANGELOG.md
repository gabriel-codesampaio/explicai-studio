# Changelog

Todas as mudanças importantes do Explicaí Studio ficam aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

All notable changes to Explicaí Studio are listed here, in Portuguese first with a short English summary at the end of each release. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

Prevista para a 0.2.0. A 0.1.0 foi a primeira versão do Studio; este bloco reúne o que entrou desde a tag `v0.1.0`.

### Adicionado

- Exportação: fontes empacotadas (Archivo, Atkinson Hyperlegible Next, Inter, Source Sans 3, Source Serif 4, Lora, Montserrat, Playfair Display e JetBrains Mono, todas OFL) que vão junto do HTML exportado, e escolha da fonte do texto e dos títulos no diálogo e pela barra do editor.
- Exportação: tema do manual com cor do texto, dos títulos por nível, de realce e de destaque, com o nome de cada cor, e logo do cliente na capa (enviado e retirado no diálogo de exportação, limite de 2 MB).
- Exportação: o diálogo mostra a etapa, o resultado e o erro com nova tentativa; "Exportar manual" foi para o fim do topo, à direita.
- Editor: cor do texto com paleta fixa e nome de cada cor, também pelo teclado e na barra fixa; barra flutuante na seleção com o tipo do bloco, formatação e cor.
- Editor: bloco de alerta (salvo como alerta GFM, exportado com rótulo em texto e cor por tipo), menu `/` com blocos agrupados e prévia, controles de linha e coluna direto na tabela, botão "Colar print" com Ctrl+V visível, barra de formatação rolável no celular.
- Marcações do print: atalhos de letra (V, M, D, S, A) e barra compacta; seta, marcador e legenda redesenhados como no brand book, no editor e no export.
- Páginas: numeração na árvore e na busca com a mesma regra do sumário exportado, status escrito e legível, e o nome do arquivo da página só muda quando se para de digitar o título.
- Interface: telas de erro em tela cheia (servidor fora com reconexão de espera crescente, rota inexistente, erro inesperado), erros do núcleo com código e parâmetros estáveis, traduzidos em português e inglês, menu Ajustes com Idioma e Aparência, e página HTML de erro do servidor alinhada à marca.
- Layout: árvore em coluna estreita de 900 a 1023 px, marca na barra do topo, alvos de toque de 44 px no celular.
- Testes e CI: GitHub Actions com lint, tipos, testes com cobertura e ponta a ponta; cobertura medida com `npm run test:cov`; testes novos para sistema de arquivos, segurança, UTF-8, exportação, editor e pacote npm.
- Pacote npm: CHANGELOG, descrição bilíngue, palavras-chave e README para quem chega pelo npm.

### Alterado

- O Studio usa sempre o cobalto da marca, com seleção de texto em cobalto translúcido; raio de 3 px vindo de um token; rótulos de seção em mono maiúsculo; ícones decorativos removidos.
- "Versão do manual" é o nome único da versão apontada para o manual final.
- Imagens do Studio carregam com `loading="lazy"` e o servidor entrega arquivos com ETag, 304 e streaming.
- O pacote publicado não leva mais os mapas de código (`.map`).

### Corrigido

- Autosave: grava uma página por vez, guarda uma mudança pendente por página e descarta a resposta antiga ao trocar de página.
- Núcleo: `updateManual` passou a ter fila por pasta (sem perder mudanças simultâneas); `addPage` grava o arquivo antes da árvore; a lixeira pula item com `entry.json` quebrado; `findUnusedAssets` ignora arquivo que sumiu; dois envios do mesmo nome de imagem não dão mais `EEXIST`; manual com BOM no começo abre; restaurar uma página fecha a lixeira.
- Limpeza de imagens sem uso: grava a fila do autosave antes, poupa imagem gravada há menos de 1 minuto e volta a 60 s quando a carência é inválida.
- Exportação: gera em pasta temporária e troca só no fim; marcação com JSON quebrado ou de forma errada vira aviso e a imagem sai pura; aviso quando a página cita imagem que não existe; `%` solto em link ou imagem não derruba mais a exportação; lê `width` e `height` de SVG; sem pulo de nível de título; "Só páginas aprovadas" fica desabilitado quando nenhuma está aprovada.
- Servidor: `%` malformado na URL responde 400 com código estável; corpo JSON que não é UTF-8 válido é recusado; diretório vira 404.
- Editor: Enter depois de imagem, ordem de várias imagens coladas, Esc no balão da imagem devolve o foco, Ctrl+End leva ao fim da página, menu `/` não fica atrás da barra fixa nem deixa de rolar com a seta, negrito e link junto de código no texto, popover da imagem ancorado dentro da área útil.
- Interface: contraste de 3:1 na borda de campo e na amostra de cor nos dois temas, seletor de tema com uma só opção marcada, título longo da árvore truncado, marca que não quebra em duas linhas.

### Segurança

- Recusa link simbólico que sai da pasta do manual ao servir e ao copiar arquivos (`realpath`).
- CSP em `/files/` (SVG não executa script) e `Origin` aceito só da mesma porta do `Host`.
- Erros de arquivo sem caminho absoluto na resposta.
- Testes de escape contra XSS na exportação e de HTML colado no texto.

### Interno

- Regras do projeto (Conventional Commits, arquitetura, testes, revisão) e plugin da equipe de agentes; tickets em `docs/tickets`; documentação do formato do manual atualizada com tema, cor do texto, alertas e logo.

### English summary

New since 0.1.0: bundled OFL fonts and font choice for exports, manual theme colors and client logo, alert blocks, text colors with names, a floating selection toolbar, a richer `/` menu, table row and column controls, annotation shortcuts, full-screen error pages, translated errors, GitHub Actions CI and a much larger test suite. Fixes cover autosave races, per-folder write queue, atomic exports, unused-image cleanup and many editor and accessibility details. Security: symlinks that leave the manual folder are refused, CSP on `/files/`, same-port `Origin` check. The npm package no longer ships source maps.

[Unreleased]: https://github.com/gabriel-codesampaio/explicai-studio/compare/v0.1.0...HEAD

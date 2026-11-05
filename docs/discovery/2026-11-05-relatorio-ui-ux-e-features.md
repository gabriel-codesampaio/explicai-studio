# Relatório de UI/UX e features do Studio 1.0.0

Data: 2026-11-05. Só leitura: nenhum código alterado, nenhum ticket criado. Aceitando uma sugestão, ela vira ticket.

Partes: 1) UI/UX (impeccable audit + segunda régua ui-ux-pro-max); 2) features pós-1.0 (concorrentes Confluence, Scribe, Tango, GitBook).

Segunda régua (ui-ux-pro-max 2.15.0, consultas `--domain ux`): confirmou A1 (teclado completo em toda ação, severidade Alta), B6 (alvo de toque: no web vale o mínimo WCAG 2.2 de 24 px, 44 px é regra de iOS; o produto já passa no mínimo, então B6 fica como melhoria e não defeito), skip link presente (ok) e passeio com opção de pular (ok, ligado à melhoria 2).

Lacunas gerais: `impeccable critique` formal e matriz 375 escuro completa não foram feitas; ver "Lacunas" na parte 1.

# Parte 1 - UI/UX

Data: 2026-11-05. Só leitura: nenhum código foi alterado, nenhum ticket criado. Rascunho: a lista de lacunas no fim diz o que não foi coberto.

### Método

- `impeccable audit`: detector estático em `web/src` (1 achado, ver Baixo B2) mais medidas no navegador. `impeccable critique` completa não rodou como passo formal; a leitura de hierarquia e fluxo abaixo vem dos prints e da navegação.
- Skill `ui-ux-pro-max`: não rodei os scripts `search.py`. Segunda régua não aplicada neste rascunho.
- Navegador: Playwright headless (Chrome instalado), 1 worker, pasta temporária com cópia de `docs/exemplo/financeiro` (porta 4871) e uma pasta vazia (porta 4872). Nenhum dado real tocado.
- Telas: abertura do manual, editor, barra de blocos, menu `/`, popover e edição de imagem, árvore (teclado, menu, exclusão com desfazer), busca (Ctrl+P), exportação, Ajustes, Aparência do manual, Ajuda, Lixeira, Versões, público, status, primeira execução (pasta vazia), manual sem páginas, primeira página, passeio guiado, 404, servidor caído.
- Medidas por script: overflow horizontal, alvos de toque, contraste de texto (calculado sobre o fundo efetivo), nome acessível, tamanho de fonte, ordem de Tab, anel de foco, Esc e retorno de foco.
- Prints em `C:\Users\PC\AppData\Local\Temp\claude\9e0de75f1873b03a\347759f2-859e-44d7-a919-f12ef054265b\scratchpad\shots`.
- Larguras e temas: 1280 claro (padrão), 1280 escuro, 375 claro; 375 escuro só parcial. Idioma pt-BR (pt na maior parte; en-US só na abertura).

### Achados

#### Crítico

Nenhum.

#### Alto

**A1. Marcações só se criam com ponteiro.**
Tela: edição de imagem. Arquivos: `web/src/features/annotations/AnnotationCanvas.tsx:149-171` (canvas `tabIndex={-1}`, só `onPointerDown/Move/Up`), `AnnotationEditor.tsx:142` (teclado só move item já selecionado). Evidência: o SVG da imagem tem `role="presentation"`; com Tab não há como pôr marcador, destaque, seta nem área. Pessoa que só usa teclado, ou tecnologia assistiva, não numera um print. WCAG 2.1.1. Correção: ferramenta ativa mais Enter no canvas focado cria o item no centro (ou na posição de um cursor visível movido por setas) e já seleciona para nudge; anunciar por `aria-live`. Esforço G.

#### Médio

**M1. Tamanho da imagem não mostra o atual.**
Tela: popover da imagem. Arquivo: `web/src/features/annotations/ImageSizePicker.tsx`. Evidência: Pequena/Média/Larga com `aria-pressed="false"` nos três e sem destaque visual no print `21-img-click.png`. Correção: `aria-pressed` e estilo de selecionado (contorno cobalto) no valor atual. Esforço P.

**M2. Popover da imagem cobre a própria imagem.**
Tela: página com print. Arquivo: `web/src/features/editor/ImagePopover.tsx`. Evidência: `21-img-click.png`; o painel de 320 px nasce sobre o canto superior esquerdo do print e termina colado na barra de status (cortando "Remover imagem" em telas baixas). Quem escreve a descrição não vê a imagem. Correção: ancorar abaixo ou ao lado da imagem, com `collisionPadding` do rodapé de 3rem. Esforço P.

**M3. Esc na busca não devolve o foco.**
Tela: Ctrl+P. Evidência: após Esc o foco foi para "Pular para o conteúdo" (início do documento), em vez de voltar ao botão Buscar ou ao ponto de edição. Os outros diálogos (Exportar, Ajuda, Lixeira, Versões, Aparência) devolvem o foco ao gatilho. WCAG 2.4.3. Correção: guardar `document.activeElement` ao abrir e restaurar no fechamento (`onCloseAutoFocus`). Esforço P.

**M4. Aviso de versão fixada: texto circular e layout apertado.**
Tela: página com "Versão do manual". Arquivos: `web/src/features/versions/PinnedNotice.tsx`, `VersionsPanel.tsx:99`. Evidência: `m-1280-dark-pagina-imagem.png`: o aviso "O manual final usa a Versão do manual desta página…" usa o mesmo termo para rótulo e para a coisa, fica colado à barra de ações e empurra o título para baixo. Correção: "Esta página está fixada em uma versão guardada. O que você escrever só entra no manual se voltar ao texto atual." com 12 px de respiro; rever o rótulo "Versão do manual" (ver docs de termos). Esforço P.

**M5. Primeira letra após Enter no título cai no título.**
Tela: página nova. Evidência: teste automático digitou "Entrar no sistema", Enter, "Abra o endereço…": título virou "Entrar no sistemaA" e o corpo "bra o endereço…". Repetiu com atraso de 30 a 120 ms entre as teclas (o intervalo entre o Enter e a primeira tecla era zero). Provável corrida: o foco vai ao corpo um instante depois. Pessoa lenta provavelmente não vê; quem digita rápido ou usa expansor de texto vê. A confirmar a mão com pausa de 100 ms. Arquivo a olhar: `web/src/features/editor/Editor.tsx` e o tratador de Enter do título. Correção: mover o foco de forma síncrona no `keydown`. Esforço P.

#### Baixo

**B1. Cores soltas nos componentes.** `VersionsPanel.tsx:99,151` e `ItemStylePanel.tsx:47` usam `#151a33`; `CoverFooterFields.tsx:92` usa `bg-white` e `#575e78`. DESIGN.md manda token. Correção: `text-nanquim` / `text-grafite` via `tokens.css`. P.

**B2. Faixa lateral grossa (detector).** `web/src/features/settings/ThemeSample.tsx:76` (`border-l-4`) e `editor/slash/SlashPreview.tsx:17`. É a amostra do callout do manual exportado, então pode ser intencional; confirmar com a marca antes de mexer. P.

**B3. Texto de 10 e 11 px.** `SlashPreview.tsx:12` (10 px), `kbd.tsx:10`, `MoreMenu.tsx:75,79`, `VersionsPanel.tsx:99` (11 px). Rótulos `rotulo` de 11 px são da marca; os de 10 px em corpo de menu passam de pequenos. Contraste passou em tudo (0 falhas nas 8 telas por tema). Correção: mínimo 12 px fora de `rotulo`. P.

**B4. Título padrão `#000000`.** `ThemeFields.tsx:14` (`heading: "#000000"`) mostra preto puro nos cinco campos de título em `12-capa.png`, fora da paleta (nanquim `#151a33`). Correção: padrão nanquim. P.

**B5. Imagem do manual de exemplo com mojibake.** "CobranÃ§as" no print do Financeiro (`docs/exemplo/financeiro/assets`). É o primeiro manual que o novo usuário abre. Correção: regerar a imagem. P.

**B6. Alvos de toque no celular.** Gaveta de páginas a 375 px: 15 de 36 controles abaixo de 44 px (botões "Nova subpágina" e "Mais ações" de 28x28, linhas de 35 px). O produto diz que no celular só não pode quebrar; nada quebra (overflow 0). Se subir a prioridade: `@media (pointer:coarse)` para 44 px, como o select já faz. M.

**B7. Dica de atalho em tela de toque.** "Ctrl+P" aparece ao lado de Buscar também a 375 px (gaveta). Ocultar em `pointer:coarse`. P.

**B8. Duas mensagens de queda de conexão.** `60-servidor-caiu.png`: faixa no topo ("Sem conexão… será salvo quando o servidor voltar") e, no rodapé, "Não foi possível salvar… Tentar de novo". Dizem coisas diferentes (vai salvar sozinho x tente de novo). A faixa também desloca só a coluna principal, não a barra lateral. Unificar a mensagem. P.

**B9. Dicas repetidas na primeira página.** `40-primeira.png`/`43-tour.png`: o cartão "Comece pelo primeiro print" e o placeholder do editor ("Cole um print com Ctrl+V") dizem o mesmo; em manual vazio há dois botões que criam página ("Nova página" e "Criar a primeira página"). Manter um. P.

### Contagem

Crítico 0, Alto 1, Médio 5, Baixo 9. Total 15.

### Pontos fortes

- Contraste: 0 falhas de texto em editor, imagem, anotação, exportar, ajuda, busca, ajustes, aparência e 404, em claro e escuro, 1280 e 375.
- Foco visível em toda a ordem de Tab; o título da página usa traço e fundo próprios; Esc fecha diálogos e devolve foco (exceto M3).
- Árvore: uma parada de Tab, setas, Home/End, Alt+Shift para mover, menu pelo teclado. Exclusão vai para a lixeira com "Desfazer" que não some sozinho.
- Mobile: gaveta de páginas, zero overflow horizontal, diálogos cabem em 375.
- Estados de erro com solução (404 com "Abrir Teste", queda do servidor sem perder texto). Primeira execução curta: uma pergunta e um botão.
- Marca aplicada com precisão: número mono cobalto, marca-texto só na página ativa, raio de 3 px, um botão sólido por tela.
- Tokens quase completos; as cores soltas se contam nos dedos (B1).

### Melhorias maiores

1. **Teclado na anotação (A1).** É o único buraco de acessibilidade estrutural. Resolvido, o fluxo principal do produto fica acessível.
2. **Onboarding.** A primeira página ensina o fluxo (colar print, numerar, exportar), mas o passeio guiado só aparece em Ajustes. Oferecer o passeio uma vez, na primeira página criada, com opção de pular. Hoje a pessoa que nunca abre Ajustes não o encontra.
3. **Aviso de versão fixada e vocabulário de versões.** Duas ideias (versão guardada da página e "Versão do manual") usam quase o mesmo nome nas barras, no aviso e no diálogo. Vale uma passada de copy e um rótulo único.
4. **Edição de imagem em um lugar só.** Popover de descrição/tamanho e janela de anotação são duas superfícies para a mesma imagem. Levar descrição e tamanho para a janela de edição reduziria M1 e M2 de uma vez.
5. **Aparência do manual.** Diálogo de 1024x720 com muitos campos num 1280x800. Dividir em abas (Cores, Fontes, Capa e rodapé) mantém a amostra à vista e encurta a rolagem.

### Matriz

Medidas por script. "<24" = alvos menores que 24 px (exclui o link de pular, 1x1, e links inline). "<44" = alvos abaixo de 44 px / total de controles visíveis. Contraste = textos abaixo de 4,5:1 (3:1 se grande). Overflow = `scrollWidth - clientWidth` do documento.

| Tela | 1280 claro | 1280 escuro | 375 claro | 375 escuro |
|---|---|---|---|---|
| Editor | overflow 0, <24 1, <44 32/35, contraste 0 | idem | overflow 0, <44 3/19, contraste 0 | overflow 0, <44 3/19, contraste 0 |
| Página com imagem | overflow 0, <44 33/36, contraste 0 | idem | overflow 0, <44 3/19, contraste 0 | overflow 0, <44 3/19, contraste 0 |
| Gaveta de páginas | n/a | n/a | n/a | overflow 0, <44 15/36, contraste 0 |
| Edição de imagem | overflow 0, <24 3, <44 70/73, contraste 0 | idem | overflow 0, contraste 0 (diálogo não abriu no script; ver lacunas) | não medido |
| Exportar | overflow 0, <24 3, <44 41/44, contraste 0 | idem | overflow 0, <44 8/27, diálogo cabe (16 a 359 px) | overflow 0, <44 8/27, diálogo cabe |
| Ajuda | overflow 0, <44 33/36, contraste 0 | idem | overflow 0, contraste 0 | não medido |
| Busca | overflow 0, <44 33/37, contraste 0 | idem | overflow 0, <44 3/20, contraste 0 | não medido |
| Aparência | overflow 0, <24 3, <44 76/81, contraste 0 | idem | overflow 0, <44 46/64, diálogo cabe | não medido |
| 404 | overflow 0, <44 4/4, contraste 0 | idem | overflow 0, <44 1/4, contraste 0 | não medido |
| Primeira execução (pasta vazia) | overflow 0, contraste 0 | não medido | não medido | não medido |

As células "<24 = 3" são os campos `input` de rádio e caixa de 13 a 16 px dentro de linhas clicáveis maiores (Exportar, Aparência) e o logo de 1x1 oculto; o rótulo cobre a área de toque.

### Lacunas

- Skill `ui-ux-pro-max`: scripts não rodados.
- `critique` completa com pontuação de heurísticas: não feita como passo formal.
- 375 escuro: só editor, página, gaveta e exportar. 375 claro: edição de imagem não abriu no script (toque em tela estreita); a anotação a 375 px não foi vista.
- Painéis de Lixeira com itens, Versões com versões guardadas, Mover página, Públicos, edição de capa/rodapé e logo: abertos, mas só medidos em contraste e foco, sem fluxo completo.
- Exportação real (HTML, PDF, Markdown) e o resultado exportado: fora do escopo desta passada.
- Interface em inglês: só a abertura foi lida; sem varredura de textos misturados.
- Arrastar para reordenar com mouse, zoom do navegador e `prefers-reduced-motion` com animação real: não exercitados.
- M5 precisa de confirmação manual com digitação humana.

# Parte 2 - Features pós-1.0

Pedido: sugestões de features pós-1.0 com esforço e risco, comparando com Confluence, Scribe, Tango e GitBook. Sem código, sem ticket, sem commit. Rascunho para o supervisor.

Não repete: [checagem do manual](2026-10-30-checagem-do-manual.md) (roteiro no sistema), [importar manual](importar-manual.md), [MCP](archives/mcp.md), [capa e rodapé](archives/capa-e-rodape.md), [personalizar marcações](archives/personalizar-marcacoes.md), [aparência e públicos](archives/aparencia-sidebar-e-perfis.md), [versão 1.0](archives/versao-1-0.md). Tickets abertos hoje: T-150, T-178, T-197, T-202, T-220, T-402, T-426 (nenhum toca as features abaixo).

Sem usuário real, número de uso ou depoimento (`PRODUCT.md`, "Evidence on Hand"). Tudo que diz "quem sente a dor" é hipótese vinda dos três perfis do `PRODUCT.md`, não de pesquisa.

### Problema em uma frase

Depois da 1.0, o Studio escreve e exporta bem, mas ajuda pouco a manter o manual em dia (princípio 1 do produto) e a achar coisa nele; os concorrentes sabem mais de busca e de saída para máquina, e nenhum cuida de "a tela mudou".

### O que o Studio já tem (conferido no código)

- `src/core/check.ts` com 8 tipos de achado (sem imagem, passo sem resultado, link morto, imagem faltando, área clicável sem página, imagem sem marcador, marcador sem rótulo, "a confirmar"). Só o MCP (`check_manual`) o usa: `checkManual` aparece só em `src/core/index.ts` e em `check.ts`, nenhuma rota nem tela do Studio.
- Comando `explicai` só abre o Studio (`--port`, `--no-open`, `--help`, README). Não exporta nem checa sem abrir a tela.
- Busca: só digitação na árvore (T-170). Não há busca no texto das páginas, nem no HTML exportado (`PRODUCT.md:47` deixa "busca" fora da v1, no contexto de versão hospedada).
- Versões por página com escolha da publicada, aviso de conflito com diff (`web/src/lib/conflictDiff.ts`), público, status, lixeira, redação, recorte, marcações com estilo.
- Exportação em HTML, PDF e um Markdown só.

### O que os concorrentes fazem

Legenda: sim, não, n/v (não verificado nesta rodada; sem fonte, é hipótese).

| Recurso | Confluence | Scribe | Tango | GitBook | Studio |
|---|---|---|---|---|---|
| Captura automática de passos | não | sim [1] | sim [2] | não | não, por decisão |
| Árvore de páginas | sim | "Pages" junta guias [1] | n/v | sim | sim |
| Anotar e esconder dado no print | n/v | Pro: editar print e esconder dado [1] | prints anotados [2] | n/v | sim (marcações, ocultar, recortar) |
| Export PDF | sim [3] | só Pro [1] | só Pro/Enterprise [2] | n/v | sim, grátis |
| Export HTML | espaço inteiro, zip [3] | só Pro [1] | só Pro/Enterprise [2] | site publicado | sim, offline |
| Export Markdown | não aparece na lista [3] | só Pro [1] | só Pro/Enterprise [2] | via Git Sync e `.md` [4] | sim, um arquivo |
| Export Word | sim [3] | n/v | n/v | n/v | não |
| Sincronia com Git | n/v | não | não | sim, nos dois sentidos [5] | a pasta já é do git |
| Busca no conteúdo | n/v | n/v | n/v | sim, "Ask or search" com IA [4] | só na árvore |
| Saída para IA (`llms.txt`) | n/v | n/v | n/v | sim [4] | Markdown + MCP |
| Pedido de mudança e revisão | n/v | n/v | n/v | "change requests" como PR [4] | status por página |
| Detectar guia desatualizado | n/v | não achei recurso [1] | n/v | n/v | não (só `check` por regras) |
| Público / versão por perfil | n/v | n/v | n/v | n/v | sim |
| Roda local, sem conta | não | não | não | não | sim |

Fontes:
1. Scribe: pesquisa agregando reviews e páginas da marca. [Preços 2026 (dubble.so)](https://dubble.so/compare/scribe-pricing), [Scribe Pricing (supademo)](https://supademo.com/blog/scribe-pricing), [Scribe AI Review 2026 (fast.io)](https://www.fast.io/resources/scribe-ai-review-2026.md), [Scribe: ferramentas](https://scribe.com/tools/how-to-guide-generator). Os preços divergem entre as fontes; usei só "export é Pro". Não achei recurso de guia defasado nem de troca automática de print; não é prova de que não existe.
2. Tango: [central de ajuda oficial](https://help.tango.ai/en/articles/7966907-how-do-i-use-tango-for-documentation) (export PDF, Markdown e HTML em Pro/Enterprise; "copiar HTML" em todos); captura de cliques e texto dos passos vem de [trainn.co](https://trainn.co/blog/what-is-tango/) e [Guidde](https://www.guidde.com/knowledge-hub/tango-software-features-use-cases-complete-guide), que são terceiros e um deles é concorrente.
3. Confluence: [suporte Atlassian, exportar](https://support.atlassian.com/confluence-cloud/docs/export-content-to-word-pdf-html-and-xml/): Word e PDF por página, HTML/CSV/XML por espaço, só versões publicadas, Word abre só no Word. Word com modelo e PDF de marca vêm de apps pagos de terceiros (K15t Scroll, [Marketplace](https://marketplace.atlassian.com/plugins/com.k15t.scroll.scroll-office/cloud/overview)).
4. GitBook: [glossário oficial](https://gitbook.com/docs/resources/glossary.md) (Git Sync, change requests, "Ask or search", `llms.txt`) e [changelog](https://gitbook.com/docs/changelog/readme.md). `.md` por página e `llms-full.txt` vêm de review de terceiro ([aiproductivity.ai](https://aiproductivity.ai/tools/gitbook/)): tratar como não confirmado.
5. GitBook Git Sync: [documentação](https://gitbook.com/docs/getting-started/git-sync): repo GitHub/GitLab com Markdown, sincronia nos dois sentidos, só admin e criador ligam.

Leitura: Scribe e Tango vendem captura e prendem o export no plano pago; o Studio entrega os três formatos de graça e local. GitBook é o único com busca, `llms.txt` e fluxo de revisão, e todos os quatro dependem de conta e nuvem. Ninguém, nas fontes que li, resolve "a tela mudou" além de refazer o guia à mão. É onde o Studio pode ser diferente sem entrar na briga de captura.

### Como ler a tabela de features

Esforço: P (um a dois dias), M (uma semana), G (mais). Risco: B baixo, M médio, A alto. Formato em disco: "aditivo" quer dizer campo opcional novo, que a política da 1.0 permite (`docs/manual-format.md`, Compatibilidade). Qualquer coisa que não seja aditiva é risco alto e fica de fora.

### Features, da primeira para a última

#### 1. Painel "Checar manual" no Studio
- **Problema:** `checkManual` já acha passo sem resultado, link morto e imagem sem marcador, mas só quem usa o MCP vê. Dev solo e redator não veem.
- **Por quê:** princípio 1 (manual acompanha o código). Reaproveita código pronto e testado; é a entrega mais barata que mexe na dor central. Nenhum concorrente verificado faz.
- **Esforço / risco:** P / B.
- **Corte mínimo:** rota `GET /api/manuals/:id/check` e um diálogo em Ajustes ou no menu Exportar com a lista agrupada por página; clique abre a página. Sem corrigir sozinho. Roda sozinho antes de exportar e mostra a contagem, sem bloquear.
- **Dependências:** nenhuma. Rótulos em pt/en (T-206 mostra que paridade é exigida).
- **Ticket:** "Mostrar no Studio os achados de `checkManual`, com clique para abrir a página."

#### 2. `explicai check` e `explicai export` na linha de comando
- **Problema:** equipe quer o manual no CI: falhar o build se há link morto, gerar PDF no release. Hoje só abre a tela.
- **Por quê:** o produto promete "versionado ao lado do código"; CI é o passo seguinte. Dev solo e software house (dois dos três perfis). Usa o `explicai/core`, que já exporta `exportManual`.
- **Esforço / risco:** M / M. O risco é a promessa: flags do CLI entram no semver da 1.x (README, Compatibilidade). Escolher nomes errados custa até a 2.0.
- **Corte mínimo:** `explicai check <pasta> [--manual id] [--fail-on aviso|erro]` e `explicai export <pasta> --format html|pdf|md [--audience x]`. Saída de texto; código de saída 1 se houver achado no nível pedido. Sem `--json` na primeira versão (decidir depois, porque `--json` é outra promessa).
- **Dependências:** feature 1 compartilha a lista de achados. PDF no CI precisa de Chrome na imagem, e o erro já avisa isso (hipótese: confirmar mensagem).
- **Ticket:** "Subcomandos `check` e `export` no CLI, sem abrir o servidor."

#### 3. Trocar o print mantendo as marcações
- **Problema:** a tela mudou um pouco, a pessoa tira um print novo e hoje refaz marcadores, destaques e áreas clicáveis.
- **Por quê:** é exatamente "o manual fica desatualizado" (`PRODUCT.md`, momentos de uso). Scribe e Tango, nas fontes, exigem refazer o guia. Diferença possível sem entrar em captura.
- **Esforço / risco:** M / M. Coordenadas são relativas (0 a 1, `manual-format.md`, "Anotações da imagem"), então tamanho diferente desloca as marcas. Risco de a marca ficar no lugar errado sem a pessoa notar.
- **Corte mínimo:** ação "Trocar imagem" no balão da imagem: grava o arquivo novo, mantém o `.json`, mostra as marcas sobre o print novo e um aviso se a proporção mudou mais de uns 2% (valor a medir). Sem alinhamento automático. Desfazer = o arquivo antigo vai para a lixeira.
- **Dependências:** lixeira e `findUnusedAssets` já existem. Formato não muda.
- **Ticket:** "Trocar o arquivo de uma imagem preservando as marcações, com aviso se a proporção mudar."

#### 4. Busca no texto do manual (Ctrl+K)
- **Problema:** manual com 50 páginas: achar onde se fala de "boleto" exige abrir página por página. Só a árvore filtra por título.
- **Por quê:** GitBook tem busca como recurso central [4]. Editar é sessão longa; busca encurta a volta.
- **Esforço / risco:** M / B. Sem formato novo.
- **Corte mínimo:** diálogo com campo, busca por substring sem acento nem caixa nos corpos das páginas visíveis (sem lixeira), resultado com trecho e abre a página. Servidor lê os `.md` na hora (`readPageTree` já lê só frontmatter, T-096; aqui lê o corpo). Sem índice persistente, sem IA. Medir com o manual de 500 páginas do T-423 antes de pensar em índice.
- **Dependências:** atalho novo entra na lista de atalhos (T-167, T-184); a11y do diálogo igual à do T-171.
- **Ticket:** "Busca por texto nas páginas do manual no Studio, com atalho e resultado com trecho."

#### 5. Busca dentro do HTML exportado
- **Problema:** o cliente recebe o HTML de 80 páginas e só tem o sumário.
- **Por quê:** o leitor final é metade do produto ("um manual, dois leitores"). Concorrente com busca é o GitBook, que é site hospedado [4]; offline e sem servidor é diferença nossa.
- **Esforço / risco:** M / M. O HTML hoje é um arquivo só com uma seção por página (`src/core/export/html.ts`); a busca pode ler as próprias seções, sem índice, mas tem de funcionar com o filtro de público e dentro da regra de CSP e de acessibilidade. PDF não ganha nada.
- **Corte mínimo:** campo no topo do sumário, filtra itens do sumário e destaca seções cujo texto contém o termo. JavaScript pequeno inline, sem dependência. Sem relevância nem fuzzy.
- **Dependências:** T-082 (CSP do SVG) como lembrete de que o export tem regras de segurança; T-132 (leitura do export). Ver feature 4 só para o mesmo normalizador de acento.
- **Ticket:** "Campo de busca no sumário do HTML exportado, com script inline e sem dependência."

#### 6. Data de conferência por página
- **Problema:** não dá para saber quais páginas ninguém olha há meses. `status` diz o estado do texto, não quando alguém confirmou que ainda vale.
- **Por quê:** princípio 1. É o substituto honesto de "detectar guia desatualizado", que ninguém resolve: marcar uma data, listar as velhas. Sem inventar checagem automática, que está fora da v1.
- **Esforço / risco:** P / B se for só campo opcional `reviewed: AAAA-MM-DD` no frontmatter (aditivo, campos desconhecidos já são preservados, T-200 e T-264). Risco de virar burocracia; por isso nenhum bloqueio.
- **Corte mínimo:** botão "Marcar como conferida" no menu da página; a árvore ganha o filtro "não conferida há mais de N dias" (N fixo, 90, até alguém pedir outro); entra na feature 1 como achado "página sem conferência".
- **Dependências:** feature 1 (para o achado). Atualizar `manual-format.md`. O MCP precisa deixar o campo passar (T-200 já garante).
- **Ticket:** "Campo `reviewed` na página e filtro de páginas sem conferência na árvore."

#### 7. Modelos de página
- **Problema:** toda página nova de tarefa começa vazia; a pessoa refaz o mesmo esqueleto (objetivo, passos, resultado, problemas).
- **Por quê:** o Confluence tem modelos de página (conhecimento geral; não confirmei na fonte desta rodada, então é hipótese). Cabe ao propósito "documentar não custa mais que construir" e aproveita o formato de passo com "Resultado:" que o `check` já cobra.
- **Esforço / risco:** P / B. Só conteúdo Markdown embutido no app, sem formato novo.
- **Corte mínimo:** ao criar página, escolher entre "Em branco", "Tarefa passo a passo" e "Referência de campos"; texto em pt e en, na voz do brand book. Sem modelos do usuário na primeira versão (seria pasta nova no manual: decisão de formato).
- **Dependências:** `docs/marca-resumo.md` para o texto dos modelos; revisão de voz com `humanizer`.
- **Ticket:** "Escolher um modelo ao criar página: em branco, tarefa e referência."

#### 8. Diferença entre versões da página
- **Problema:** a pessoa guarda versões (T-016, T-144), mas não vê o que mudou de uma para a outra; só restaura às cegas.
- **Por quê:** GitBook tem change requests como PR [4]; aqui o equivalente local mínimo é ver o diff antes de escolher a versão do manual. Reaproveita `conflictDiff.ts`.
- **Esforço / risco:** M / B. Sem formato novo; o risco é a interface (estado vazio, páginas grandes).
- **Corte mínimo:** na lista de versões, botão "Comparar com o atual" que mostra o diff de texto por linha em dois painéis. Sem diff de imagem nem de marcação.
- **Dependências:** `web/src/lib/conflictDiff.ts`, `src/core/versions.ts`.
- **Ticket:** "Comparar uma versão guardada com o texto atual, com diff por linha."

#### 9. `llms.txt` e um Markdown por página no export
- **Problema:** o Markdown exportado é um arquivo só; para uma IA ler o manual de 80 páginas cabe pouco por vez.
- **Por quê:** princípio 2 ("dois leitores"). GitBook publica `llms.txt` [4] (o `llms-full.txt` e o `.md` por página são de review de terceiro, não confirmados).
- **Esforço / risco:** P / B. Acrescenta arquivos a `exportacao/markdown/`; o arquivo único atual fica. Quem lê a pasta não quebra.
- **Corte mínimo:** `exportacao/markdown/llms.txt` com título, resumo de uma linha por página e link para `paginas/<slug>.md`, cada um com a legenda das imagens em texto, como o arquivo único. Respeita público.
- **Dependências:** `src/core/export/markdown.ts`; documentar em `manual-format.md` ("Exportação"). Não mexer em PDF e HTML.
- **Ticket:** "Exportar `llms.txt` e um `.md` por página junto do Markdown único."

#### 10. Bloco de diagrama (Mermaid)
- **Problema:** fluxo ("o pedido passa por aprovação") só cabe como lista ou print de outra ferramenta.
- **Por quê:** o discovery do MCP prevê a IA entender fluxos e diagramas (`mcp.md`). Em Markdown, um bloco ```` ```mermaid ```` degrada para código legível em qualquer leitor, então é aditivo. Hipótese: manual de sistema usa fluxo com frequência; sem evidência.
- **Esforço / risco:** G / M. Mermaid é MIT, mas pesa (centenas de KB), precisa rodar no editor, no HTML exportado e no Chromium do PDF, e exige regras de segurança (`securityLevel`), tema escuro e a fonte do manual. Mais a11y: o diagrama precisa de texto alternativo.
- **Corte mínimo:** só renderizar no export (HTML e PDF) e no editor como bloco de código com pré-visualização; sem editor visual. Se o peso do pacote for alto, renderizar para SVG na exportação em vez de levar a biblioteca para o HTML.
- **Dependências:** decisão sobre peso e licença (checar licenças da árvore de dependências, regra de não ter GPL/AGPL); T-082 (SVG e CSP). Esperar evidência de uso antes.
- **Ticket:** "Spike: blocos mermaid renderizados no export, medindo peso e segurança." (spike, não entrega)

#### 11. Exportar Word (.docx)
- **Problema:** cliente de software house pede "manda em Word" para editar.
- **Por quê:** Confluence exporta Word [3] e há mercado de apps pagos para melhorar esse export, o que indica demanda. Hipótese de que o nosso público também pede; nenhuma evidência em `PRODUCT.md`.
- **Esforço / risco:** G / M. Biblioteca nova (verificar licença), marcações do print têm de virar imagem queimada (o que a exportação já faz para PDF/HTML? hipótese a conferir), fidelidade de fonte e tabela.
- **Corte mínimo:** nenhum que valha: Word ruim é pior que não ter. Só entra se pedirem duas vezes.
- **Dependências:** decisão da pessoa; ver "Perguntas".
- **Ticket:** não criar ainda.

### Ordem sugerida

1, 6, 7 e 9 são P e baixo risco: lote único, em uma ou duas versões 1.1. Depois 4 e 3. 2 vem quando a pessoa aceitar o custo do semver do CLI. 5 e 8 depois. 10 e 11 esperam pedido.

| # | Feature | Esforço | Risco | Muda formato? |
|---|---|---|---|---|
| 1 | Painel Checar manual | P | B | não |
| 2 | CLI `check` e `export` | M | M | não (semver do CLI) |
| 3 | Trocar print mantendo marcações | M | M | não |
| 4 | Busca no Studio | M | B | não |
| 5 | Busca no HTML exportado | M | M | não |
| 6 | Data de conferência | P | B | aditivo |
| 7 | Modelos de página | P | B | não |
| 8 | Diff de versões | M | B | não |
| 9 | `llms.txt` e `.md` por página | P | B | não (pasta de export) |
| 10 | Diagrama Mermaid | G | M | aditivo (bloco de código) |
| 11 | Exportar Word | G | M | não |

### O que não fazer, e por quê

- **Captura de tela ou gravador de passos.** Decisão fixa (`CLAUDE.md`, `PRODUCT.md`). Scribe e Tango jogam nesse campo, com extensão e nuvem [1][2]. Aqui o print vem de fora.
- **Conta, login, nuvem ou versão hospedada.** Contra "roda local, sem conta". A vantagem sobre os quatro é exatamente não precisar disso.
- **Colaboração em tempo real e comentários.** Fora da v1 (`PRODUCT.md:47`); exigem servidor, identidade e resolução de conflito. Quem divide manual divide pelo git.
- **Git Sync com GitHub/GitLab dentro do Studio.** GitBook faz [5], mas pede conta e token. A pasta já é do git; o Studio avisa conflito de disco (T-108, T-163). Botão de commit empurraria o Studio a opinar sobre o fluxo de git da pessoa.
- **Busca ou chat com IA dentro do Studio.** GitBook oferece [4]. Exige chave de API ou serviço, custa dinheiro por uso e quebra "sem nuvem". A IA entra pelo MCP, com a chave da própria pessoa.
- **Checagem automática do manual abrindo o sistema.** Continua fora da v1; o discovery de 2026-10-30 desenhou o caminho (roteiro) e não foi aprovado. A feature 6 é o substituto sem esse risco.
- **Vídeo e GIF embutidos.** Scribe Pages aceita vídeo [1]. Arquivos pesados na pasta do git, PDF não toca vídeo, fugiria de "um manual, dois leitores".
- **Marketplace, plugins e macros de terceiros.** O ecossistema do Confluence depende deles [3]. Para o Studio vira superfície de segurança e de suporte que um projeto MIT pequeno não sustenta.
- **Tema livre com CSS do cliente.** Já decidido: cor e fonte do manual ficam no `theme` do `manual.json`, o export não aceita estilo solto. CSS livre quebra o PDF e a a11y.
- **Painel de uso e analytics do manual.** Não há hospedagem; medir leitura exige rastreador no HTML, contra a marca.
- **Cor e enfeite no Studio.** A personalidade fica no manual exportado; o Studio é ferramenta de trabalho (`docs/marca-resumo.md`). Os itens acima propõem diálogo e lista sóbrios, sem cor nova.
- **Importar manual de fora no Studio com tela própria.** Já tem discovery ([importar-manual](importar-manual.md)); a recomendação lá é prompt do MCP. Não repetir aqui.

### Perguntas só da pessoa

1. **Lote 1.1 sem CLI?** Recomendo sim: features 1, 6, 7, 9 primeiro (P, B). O CLI (2) compromete flags no semver.
2. **Quanto vale a feature 3 (trocar print) contra a 4 (busca)?** Recomendo a 3 primeiro: é a única que ataca a dor "tela mudou", que o produto cita como momento de uso. Medir: quantas vezes a pessoa refaz marcação ao trocar print.
3. **Nome do campo `reviewed`?** Recomendo manter em inglês no frontmatter, como `status` e `audience`, e rótulo em pt/en na interface ("Conferida em").
4. **Exportar Word: esperar pedido?** Recomendo esperar dois pedidos reais. Sem usuário medido, é aposta.
5. **Mermaid: vale o spike?** Recomendo só depois que um manual real precisar de fluxo; o MCP já descreve fluxo em lista numerada.

### Recomendação

Começar pela **feature 1** (painel de checagem). Menor corte que resolve parte da dor "manual atrasado", sem formato novo, com código já pronto. Em seguida **6** (data de conferência) que dá ao painel mais um achado. O que medir depois: quantas páginas a checagem aponta em manuais reais (o `docs/exemplo` e o manual do CodeLab de T-126), se a pessoa clica nos achados, e se pede o CLI. Se pedir CLI, abrir a 2.

### Rascunho de spec: feature 1 (Painel "Checar manual")

**Escopo**
- Rota `GET /api/manuals/:id/check` no servidor local (um arquivo em `src/server/routes/`), devolvendo `CheckFinding[]` de `checkManual`.
- Diálogo "Checar manual" aberto pelo menu do manual, com achados agrupados por página, nome do tipo em pt/en, detalhe e botão "Abrir página". Estado vazio: "Nenhum problema encontrado."
- Contagem de achados no botão Exportar, sem bloquear o export.
- Tipo `to-confirm` mostrado como "A confirmar", não como erro.

**Fora**
- Correção automática. Mudança no `check.ts`. Nova regra de checagem. Rodar no CLI (feature 2).

**Critérios de aceite**
1. Manual com os 8 tipos de achado mostra todos, cada um com a página certa; clicar abre a página.
2. Manual sem achado mostra o estado vazio.
3. Texto em pt e en, sem palavra em um idioma só (T-206).
4. Diálogo operável só por teclado, com foco preso e devolvido (T-173, T-424), nome acessível, e passa no axe.
5. Manual de 500 páginas (fixture de T-423) responde sem travar o editor (meta a definir com T-205).
6. Manual de formato mais novo (`format-newer`) abre a checagem só leitura (a rota não grava nada).
7. `npm run check` passa; teste unitário da rota; e2e de um fluxo (abrir diálogo, clicar no achado).

**Riscos**
- Lista longa vira ruído: agrupar por página e contar. Hipótese: ruído alto em manual novo cheio de "a confirmar". Medir no `docs/exemplo`.
- Caminho absoluto no erro (T-101): a rota devolve só id de página e texto, nunca caminho de disco.
- Formato em disco: não muda.

**Ticket sugerido:** "Mostrar no Studio os achados de `checkManual`" (P, prioridade P2, sugestão, não bug).

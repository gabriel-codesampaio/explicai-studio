# Discovery: respiro da Sidebar, gestão de públicos e "Aparência do manual"

Data: 2026-11-04. Três pedidos da pessoa, com as palavras dela:

1. "Dê mais respiro pra esse cabeçalho da Sidebar; deixe o 'Ver como' acima da busca de páginas."
2. Perfis de público ("crud"): o popover "Quem vê esta página" não deixa renomear nem remover perfil.
3. "A estilização não pode estar na exportação; já temos ferramentas para estilizar o manual antes de exportar, é assim que deve ser." Direção aprovada: tela "Aparência do manual" nos Ajustes, juntando cores, fontes, capa e rodapé; a exportação fica só com público e formato.

Complementa: `capa-e-rodape.md` (T-147), `personalizar-marcacoes.md` (cor das marcações, em paralelo; este arquivo não mexe nele), T-158, T-160, T-135, T-136, T-172.

Lente de design: `impeccable` (modo Operate) e o resumo da marca (`docs/marca-resumo.md`). O Studio fica sóbrio: tokens existentes, rótulo `rotulo` em mono, cobalto só na ação, um botão principal por tela. Nada de cor nova.

Sem pesquisa de concorrente neste arquivo: os três pedidos são ajuste de tela própria, e a comunicação do produto não compara (PRODUCT.md). Padrões citados abaixo (renomear propaga, remover pergunta) são hipótese de UX, não fato de mercado.

---

## 1. Sidebar

### Estado atual

- `web/src/layout/Sidebar.tsx:41`: o `<aside>` usa `gap-5` entre blocos (marca, manual, árvore, Ajustes).
- `Sidebar.tsx:67`: o `<nav>` usa `gap-1` (4 px) e junta quatro coisas diferentes: botão "Buscar página" (`:72-78`), linha "PÁGINAS + Nova página" (`:79-91`), "Ver como" (`:92-111`) e a árvore.
- Medido no Studio compilado, 1280 px, uma largura (Playwright headless, Chrome local): topo da busca 136 px (altura 32), linha PÁGINAS 176 (29), "Ver como" 209 (29), árvore 242. Ou seja, 4 px entre cada um, enquanto o resto da coluna respira 20 px. O cabeçalho da árvore fica apertado e o select "Ver como" parece colado na lista.
- "Ver como" só aparece com perfil cadastrado (`manual.audiences.length > 0`, `:92`). Estado `viewAs` é local e some ao recarregar (`:26`).
- Em tela de toque os alvos já têm 44 px (`[@media(pointer:coarse)]:min-h-11`).

### Proposta

Ordem nova, de cima para baixo: marca, manual, **Ver como**, **Buscar página**, PÁGINAS + Nova página, árvore.

- "Ver como" copia o padrão do bloco MANUAL logo acima: rótulo `rotulo` ("VER COMO") em cima, select de largura cheia embaixo. Mesma gramática, nenhum estilo novo. Sem perfil, o bloco não existe e o cabeçalho fica como hoje (só com mais respiro).
- Respiro: separar o cabeçalho (Ver como + Buscar) da árvore. Cabeçalho num `grid gap-3` (12 px); entre ele e a linha PÁGINAS, `mt-2`; a linha PÁGINAS com `py-1` e 8 px até a primeira página. Valores de escala Tailwind já usados no projeto, sem token novo. O implementador ajusta o número olhando o print, mas não passa de `gap-3`/`mt-3`: a coluna precisa continuar mostrando bastante árvore em 768 px de altura.
- Texto: o rótulo e o select usam o termo único do T-158 (ver pergunta 1). Até lá, "Ver como".

### Corte mínimo

Só mudar ordem e espaçamento em `Sidebar.tsx`. Sem estado novo, sem formato, sem i18n novo (o texto "Ver como" já existe). Tamanho P.

### Risco

Baixo. Teste e2e que procura "Ver como" ou clica em "Buscar página" por posição pode quebrar (`e2e/studio.publico.e2e.ts`, a conferir).

---

## 2. Gestão de públicos

### Problema

Quem entrega o mesmo manual a mais de um leitor (aluno, admin, cliente) cria o perfil digitando um nome numa página e depois não consegue corrigir o erro de digitação, trocar o nome nem apagar um perfil que não serve mais. Contorno hoje: editar `manual.json` e o frontmatter de cada página à mão.

### Estado atual

- Dado: `audiences` em `manual.json` (lista de nomes; `src/core/types.ts:24`) e `audience` no frontmatter de cada página (`types.ts:75`). O nome é a chave: não existe id. O formato está documentado em `docs/manual-format.md`, seção "Público" (linha 104).
- Perfil só nasce por uso: `registerAudiences` (`src/core/audience.ts:28`) acrescenta à lista quando uma página recebe o nome. **Nada remove**: tirar o nome da última página não tira o perfil de `audiences`, e o perfil continua aparecendo no "Ver como" e no "Para quem exportar" com zero páginas.
- Servidor: `optionalAudience` aceita até 10 nomes de até 40 caracteres (`src/server/workspace.ts:23-26`). Não há rota de perfil; só `PATCH` da página (`routes/pages.ts:49-51`) e `export` (`routes/export.ts:26`).
- Tela: `web/src/features/pages/AudienceMenu.tsx`. Popover de 288 px (`:40`) com checkboxes por perfil (`:43-56`), campo "Novo perfil" + "Adicionar" (`:58-74`) e uma nota (`:75-79`). Montado em `web/src/layout/PageView.tsx:75`, no cabeçalho da página. Grava via `setPageAudience` (`web/src/hooks/useStudio.ts:317`).
- Quem usa a lista: `Sidebar.tsx:92-111` (Ver como), `ExportDialog.tsx:136-158` (Para quem exportar), `core/export/collect.ts:52` (recusa perfil que não está em `audiences`).
- Consequência do dado: **renomear exige reescrever todas as páginas que citam o nome**, mais a lista. **Remover** um perfil de uma página que só tinha ele **muda a página de "restrita" para "todos veem"**: é vazamento de conteúdo no export. É o ponto de design mais importante.
- Tickets abertos que encostam: T-135 (trava contra dois cliques no menu, `AudienceMenu.tsx`), T-136 (matriz de tela do popover), T-172 (popover sem nome acessível, axe 4.1.2), T-158 (quatro nomes para a mesma coisa). T-134 e T-137 já estão fechados.
- O MCP (`explicai-mcp`) também grava `audience` por página (`add_page`, `add_pages`, `update_page`). Ele passa a ter um caminho de renomear só se a regra morar no core.

### Proposta

**Onde mora a gestão.** Um diálogo "Públicos do manual" (ou o termo do T-158), aberto de dois lugares: item novo no menu Ajustes (ao lado de Lixeira, que também é do manual aberto) e um link "Gerenciar públicos…" no rodapé do popover. O popover continua com o que faz bem: marcar quem vê esta página, e criar rápido. Renomear e remover não cabem em 288 px sem virar menu dentro de menu, e remover precisa de confirmação com texto.

**O diálogo.** Lista, uma linha por público:

| Nome | Páginas | Ações |
|---|---|---|
| aluno | 4 | Renomear, Remover |
| admin | 2 | Renomear, Remover |

- "Páginas" é a contagem de páginas marcadas, calculada no cliente a partir do `audience` que cada item da árvore já carrega (`TreeItem.audience`, `api.ts:24`). Sem rota nova para isso.
- Embaixo, o mesmo campo "Novo perfil" + "Adicionar". **Criar sem página passa a ser possível** (o formato já aceita lista vazia de uso, é só `audiences`). É o que falta para "crud".
- Um botão principal? Não há: "Fechar". As ações são de texto, como no resto do Studio. "Remover" em cor destrutiva só na confirmação.

**Renomear.** Edição na própria linha: o nome vira campo com o texto selecionado, Enter grava, Esc cancela. Regras:
- 1 a 40 caracteres (limite que o servidor já impõe).
- Nome igual a outro existente, ignorando maiúscula: recusado, com o motivo ("Já existe um público chamado admin."). Não mesclar: mesclar é decisão que muda quem vê o quê, e fica fora do corte.
- Grava em `audiences` e em todas as páginas que citam o nome, no core, numa operação só. O resultado informa quantas páginas mudaram.

**Remover.** Confirmação em diálogo, com o efeito escrito:
- Se nenhuma página usa: "Remover o público X? Nenhuma página usa." Um clique.
- Se há páginas: "N páginas citam X. M delas só têm esse público e passam a aparecer para todos." Lista os títulos das M (até 5, "e mais K"). Botões: "Remover e liberar essas páginas" (destrutivo) e "Cancelar". Foco inicial em Cancelar.
- As N−M páginas com mais de um público só perdem o nome.
- Alternativa descartada no corte mínimo: "mover essas páginas para outro público" (select). Boa, mas dobra a tela e o teste. Vira ticket depois, se a pessoa reclamar de ter que remarcar na mão.

**Por que não bloquear a remoção.** Bloquear obriga a desmarcar página por página antes. Pior para quem só quer limpar um perfil de teste. Aviso claro com a contagem resolve sem trava.

**O que o popover ganha.** Ao tocar T-135 e T-172 no mesmo arquivo: nome acessível ao diálogo (T-172), trava de gravação em curso (T-135) e link "Gerenciar públicos…". T-136 (matriz de tela) vira critério do ticket da tela nova, cobrindo popover e diálogo.

### API e formato

- Formato: **não muda**. `audiences` e `audience` seguem como estão. Risco de formato: baixo. O risco é de dado em disco: a operação reescreve vários arquivos. Falha no meio deixa páginas com o nome velho e outras com o novo.
- Core (`src/core/audience.ts`, arquivo já existe): `addAudience`, `renameAudience(dir, from, to)`, `removeAudience(dir, name)` e uma leitura `audienceUsage(dir, name)` para a confirmação (ou o cliente conta, como acima). Reescrever páginas usa as funções de página existentes, para manter escrita atômica e versão.
- Rotas: `POST /api/manuals/:slug/audiences`, `PATCH .../audiences/:name`, `DELETE .../audiences/:name`. Mesmo estilo de `routes/export.ts`.
- Cliente: `api.ts` + `useStudio.ts` (ação que dá `flush` do autosave antes, e recarrega a árvore e a página aberta depois).
- MCP: ferramenta de renomear/remover público é ticket à parte, só depois de o core existir. Não entra no corte.

### Riscos

- **Corrida com o autosave** (mesma família de T-120 e T-153): a página aberta guarda o nome velho em memória e pode regravá-lo. Mitigação: `flush` antes, recarregar a página depois, teste e2e renomeando com a página aberta.
- **Escrita parcial**: gravar páginas primeiro e `manual.json` por último, e fazer a operação ser reexecutável (renomear de novo termina o serviço). Teste com falha injetada.
- **Páginas na lixeira** e **versões salvas** podem guardar `audience` (não verifiquei se a versão publicada guarda o frontmatter; a conferir). Decisão proposta: a lixeira renomeia junto (é só frontmatter); versão não, e fica registrado.
- **Maiúscula**: hoje "Admin" e "admin" são dois perfis (comparação exata em `collect.ts:52` e `audience.ts:37`). A nova regra de duplicado ignora maiúscula só na criação e na renomeação; perfis antigos que já diferem só pela caixa seguem válidos. Hipótese de impacto: baixo, sem uso real medido.
- Perfil removido que o MCP ainda manda em `add_page` volta a nascer por `registerAudiences`. Aceitável: o servidor não vira dono do vocabulário.

### Corte mínimo

Criar sem página, renomear com propagação e remover com confirmação e contagem, no diálogo dos Ajustes. Sem mesclar, sem mover, sem MCP. Tamanho M (core) + M (tela).

---

## 3. "Aparência do manual" fora da exportação

### Estado atual

- `web/src/features/export/ExportDialog.tsx:160-184`: com formato HTML ou PDF, o diálogo mostra `LogoField`, `ThemeFields` (um `<details>` "Cores do manual") e a caixa "Sem o rodapé do Explicaí". Formato e público ficam em `:85-158`. O texto de `DialogDescription` e a nota de `AppearancePanel.tsx:64` ("A cor do manual fica em Exportar manual") dizem hoje que é lá.
- `ThemeFields.tsx` (113 linhas): cor do texto, destaque (com 4 atalhos: Cobalto, Esmeralda, Ameixa, Grafite), realce, cinco cores de título, fonte do texto e dos títulos (`FontPicker`), aviso de contraste. Cada campo salva sozinho (`setManualTheme`, `useStudio.ts:356` → `PUT /api/manuals/:slug/theme`, `routes/export.ts:35`). Mesma validação no servidor e no MCP (`mergeTheme`, `core/export/theme.ts`).
- Existe um painel "Aparência" nos Ajustes (`web/src/features/settings/AppearancePanel.tsx`), mas ele é do **tema do Studio** (claro, escuro, sistema), salvo no navegador. Mesmo nome, outro assunto. O nome "Aparência do manual" ao lado dele confunde.
- Fonte do texto também é editada na barra do editor (`web/src/features/editor/FontMenu.tsx:13-22`), sem aviso de alcance; T-160 pede levar para onde o alcance é claro.
- Capa e rodapé (T-147, aberto, G): hoje só existe a lista de campos e um modal por hover no cabeçalho da página; o plano vigente põe os campos dentro do `ExportDialog` (`capa-e-rodape.md`) e, na etapa 2, num modal.
- Prévia no editor: **só a fonte é refletida.** `Editor.tsx:124` aplica `manualFontStyle` (`lib/manualFont.ts`) ao conteúdo, ao vivo. Cor do texto, destaque, realce e cor dos títulos **não aparecem** no editor: `editor-content.css` usa os tokens do Studio (`--tinta`, `--cobalto`, `--grafite`). A pessoa só vê as cores no HTML/PDF exportado. É o buraco do argumento "já temos ferramentas para estilizar antes de exportar": para cor, ainda não temos onde olhar.

### Problema

Quem entrega o manual quer acertar a cara dele (cores, fontes, capa, rodapé) antes de exportar, olhando o resultado, e depois exportar quantas vezes precisar (um por público, um por formato) sem reabrir a estilização. Hoje a estilização vive dentro do ato de exportar, escondida num `<details>`, sem prévia, e a pessoa descobre o erro depois de gerar o arquivo.

### Proposta

Tela **"Aparência do manual"** nos Ajustes, como diálogo grande (ou painel lateral largo) com seções em coluna, no mesmo vocabulário do resto:

1. **Cores**: texto, destaque (com os 4 atalhos), realce, títulos. O que hoje está em `ThemeFields`, reaproveitado (`ColorField` e `FontPicker` ficam; só mudam de pasta/uso).
2. **Fontes**: texto e títulos.
3. **Capa**: logo (`LogoField`), subtítulo, autor, versão, data (T-147).
4. **Rodapé**: texto, "Numerar páginas", "Sem o rodapé do Explicaí" (a caixa que hoje está em `ExportDialog.tsx:164-182`).
5. **Amostra**: um bloco fixo ao lado/abaixo que mostra título, parágrafo, link, número de passo, destaque e capa com as cores e fontes escolhidas, em miniatura. É o que dá sentido a "estilizar antes de exportar".

Cada campo salva sozinho (comportamento de hoje, sem botão "Salvar" e sem "Cancelar"). Um botão principal: nenhum; só "Fechar". Fica o texto do aviso de contraste.

**Exportação depois da mudança.** `ExportDialog` fica com formato, "Só páginas aprovadas" e público. Uma linha de texto no fim, para HTML/PDF: "Cores, fontes, capa e rodapé: Aparência do manual" com botão de texto que abre a tela. É só o ponteiro; nenhum campo de estilo sobra. O diálogo encurta e o botão Exportar deixa de ficar fora da área visível (T-152 melhora de graça, sem ser absorvido).

**Nome do painel atual.** Renomear "Aparência" do Studio para "Tema do Studio" no menu e no título, e atualizar a nota em `AppearancePanel.tsx:64` ("Muda só o Studio, neste navegador. A cor do manual fica em Aparência do manual."). Alternativa: manter "Aparência" e chamar o novo de "Estilo do manual"; mas a pessoa já usou "Aparência do manual". Recomendo o renome do antigo.

**Onde no menu Ajustes.** Ordem: Lixeira, Públicos (item 2), Aparência do manual, Tema do Studio, Idioma, Atalhos. As três primeiras só com manual aberto (como a Lixeira hoje, `MoreMenu.tsx:41`). Quem não tem manual aberto não vê "Aparência do manual".

**Fonte na barra do editor (T-160).** Com a tela nova, o `FontMenu` da barra vira duplicata sem aviso de alcance. Recomendo **tirá-lo da barra** e deixar a fonte só na tela de Aparência; o editor continua refletindo a fonte ao vivo (já faz). A barra fica só com formatação do trecho selecionado, o que fecha o terceiro critério do T-160 (fonte de seleção separada da fonte do manual) de forma definitiva e remove o nome cortado ("Atkinson Hyp…"). Isso desfaz uma escolha que a pessoa fez no T-065 (fonte na barra): vai como pergunta (pergunta 4).

**Capa e rodapé (T-147).** Não vira ticket novo; **T-147 é reescrito** para ter a tela como casa. As decisões da pessoa seguem: texto livre, só sugere data e versão, por manual, sem imagem de fundo, aviso para PDF sem número em Chrome < 131, com prévia. O que muda: a seção "Capa e rodapé" não vai dentro do `ExportDialog`; vai nas seções 3 e 4 da tela. A "etapa 2" (botão de edição que aparece ao passar o mouse no cabeçalho da página) passa a abrir a mesma tela já rolada até a seção Capa: um componente, dois pontos de entrada, sem caminho paralelo no core.

**Prévia das cores no editor.** Recomendo **não** pintar o editor com as cores do manual. Motivos: (a) o Studio é a ferramenta de trabalho, sóbria e cobalto (marca-resumo); cor do manual no editor mistura as duas coisas; (b) no tema escuro do Studio, "cor do texto" escura sobre fundo escuro quebra o contraste do próprio editor; (c) o editor mostra anotação e marcação com as cores do Studio. A amostra dentro da tela de Aparência resolve a necessidade de ver. A fonte continua refletindo, porque fonte não tem problema de contraste. Se a pessoa discordar (pergunta 5), o caminho é um interruptor "Ver com a aparência do manual" no cabeçalho da página, desligado por padrão, claro-sobre-claro, com trava para o tema escuro. Fica fora do corte.

**A amostra e o código do export.** A amostra deve usar as mesmas variáveis CSS que o export (`themeCss`, `core/export/theme.ts:138-157`: `--tinta`, `--accent`, `--marca`, `--t-*`, `--texto`, `--display`) para não virar segunda renderização. O `themeCss` está no core (Node). Duas saídas: rota `GET /api/manuals/:slug/theme/css` que devolve a string pronta, ou espelhar o mapeamento em TypeScript do web (cópia de ~15 linhas, com risco de divergir). Recomendo a rota: uma fonte de verdade. A conferir se o web já importa algo do core (não verifiquei).

### Formato

**Não muda.** `theme` continua igual; `cover` e `footer` (T-147) continuam aditivos e opcionais. A mudança é de lugar de tela. Risco de formato: nenhum.

### Corte mínimo

Mover o que existe, sem inventar nada:
- Tela "Aparência do manual" com seções Cores, Fontes, Logo e "Sem o rodapé do Explicaí" (os componentes de hoje, reorganizados em seções em vez de `<details>`).
- `ExportDialog` sem `ThemeFields`, `LogoField` e a caixa do rodapé; com a linha-ponteiro.
- Renome do painel atual para "Tema do Studio" e textos que apontam o lugar (`AppearancePanel.tsx:64`, `ExportDialog.tsx:82`).
- Sem amostra, sem capa/rodapé (T-147 entra depois, dentro da tela), sem mudar a barra do editor (T-160 depois, pela resposta da pergunta 4).

Tamanho M. O corte já cumpre a frase da pessoa ("a estilização não pode estar na exportação"). A amostra e a capa/rodapé seguem em tickets próprios, nessa ordem de valor: amostra primeiro, porque é ela que faz a tela ser "antes de exportar".

### Riscos

- Quem hoje abre Exportar para trocar a cor não acha mais lá: o ponteiro de uma linha cobre, e a descrição do diálogo tem de dizer onde.
- Testes e2e que mexem nas cores pelo diálogo de exportação (`e2e/studio*.e2e.ts`; a conferir quais) precisam mudar de caminho.
- Tela com 5 seções vira "painel de configuração" gigante. Mitigação: seções com `rotulo`, sem `<details>`, uma coluna, e a amostra visível sem rolar quando couber (1280 px). Em 375 px a amostra vem depois das seções, sem sticky.
- Contraste: o aviso de 4,5:1 e a recusa do servidor ficam como estão. A tela herda isso; não relaxar.
- Cor do Studio no diálogo: usar os tokens do Studio. A amostra é o único lugar que mostra a cor do manual, e rotulada como "Amostra".

---

## Tickets propostos

IDs provisórios (N1 a N6); o supervisor atribui os T-numbers. Ordem sugerida: N1, N3, N4, N5 (T-147 reescrito), N2, depois N6.

### N1. Sidebar: mais respiro no cabeçalho e "Ver como" acima da busca

- Prioridade: P2. Tamanho: P. Agente: frontend.
- Absorve: nada. Usa o termo do T-158 se já decidido.
- Critérios de aceite:
  - [ ] Ordem na barra: manual, Ver como (só com público cadastrado), Buscar página, PÁGINAS com "Nova página", árvore.
  - [ ] "Ver como" com rótulo `rotulo` acima do select de largura cheia, no mesmo padrão do bloco MANUAL.
  - [ ] Respiro medido: pelo menos 12 px entre Ver como, Buscar página e a linha PÁGINAS, e 8 px da linha PÁGINAS à primeira página (script, 1280 px).
  - [ ] Sem público cadastrado, nenhum espaço vazio onde estaria o Ver como.
  - [ ] Em 768 px de altura a árvore mostra pelo menos 6 páginas sem rolar a coluna (manual de 10 páginas).
  - [ ] Alvos de 44 px em tela de toque continuam.
  - [ ] Textos em pt e en; e2e do público atualizado se dependia da posição.

### N2. Públicos: criar, renomear e remover (core e API)

- Prioridade: P2. Tamanho: M. Agente: frontend (core e servidor).
- Absorve: nada. Base do N3.
- Critérios de aceite:
  - [ ] `addAudience`, `renameAudience`, `removeAudience` em `src/core/audience.ts`, usadas pelo servidor; formato de `manual.json` e do frontmatter inalterado.
  - [ ] Renomear reescreve `audiences` e todas as páginas que citam o nome (inclusive na lixeira); devolve a contagem.
  - [ ] Nome vazio, acima de 40 caracteres ou igual a outro (ignorando maiúscula) é recusado com o motivo; nada é gravado.
  - [ ] Remover tira o nome de `audiences` e das páginas; página que só tinha esse nome volta a "todos"; a resposta traz as páginas liberadas.
  - [ ] Operação reexecutável: com falha no meio, repetir termina o serviço (teste com falha injetada).
  - [ ] Rotas `POST/PATCH/DELETE /api/manuals/:slug/audiences[/:name]` com validação de entrada.
  - [ ] Teste: renomear e remover com página aberta no editor não regrava o nome antigo (flush + recarga).
  - [ ] `docs/manual-format.md` (seção Público) diz que renomear e remover são do Studio e que a lista pode ter público sem página.
  - [ ] `npm run check` passa.

### N3. Diálogo "Públicos do manual" nos Ajustes

- Prioridade: P2. Tamanho: M. Agente: frontend. Depende do N2 e do termo do T-158.
- Absorve: **T-135** (trava de dois cliques), **T-136** (matriz de tela), **T-172** (nome acessível do popover). Cada um vira critério abaixo; fechar os três com referência a este ticket.
- Critérios de aceite:
  - [ ] Item "Públicos" no menu Ajustes, só com manual aberto; o popover da página ganha o link "Gerenciar públicos…".
  - [ ] Lista com nome e contagem de páginas; renomear na linha (Enter grava, Esc cancela); criar sem página; remover.
  - [ ] Remover com páginas mostra a confirmação com a contagem e os títulos das páginas que passam a aparecer para todos; foco inicial em Cancelar; sem páginas, um clique.
  - [ ] Erros (nome repetido, comprimento) aparecem junto ao campo com o motivo.
  - [ ] T-172: o popover de público e o diálogo novo têm nome acessível; axe sem violação nos dois.
  - [ ] T-135: dois cliques seguidos no menu não disparam duas gravações, ou a última escolha vence e o menu mostra o valor gravado (e2e com resposta atrasada).
  - [ ] T-136: conferido em 375 e 1280, claro e escuro, pt e en; só com teclado; leitor de tela anuncia nome e estado.
  - [ ] Sem cor nova; tokens do Studio; destrutivo só na confirmação.

### N4. "Aparência do manual" nos Ajustes (move cores, fontes, logo e rodapé do Explicaí)

- Prioridade: P2. Tamanho: M. Agente: frontend. Pedido central da pessoa.
- Absorve: **T-160** (fonte do manual em lugar com alcance claro), no corte definido pela pergunta 4.
- Critérios de aceite:
  - [ ] Item "Aparência do manual" nos Ajustes (só com manual aberto) abre a tela com seções Cores, Fontes, Logo e "Sem o rodapé do Explicaí"; cada campo salva sozinho, como hoje.
  - [ ] `ExportDialog` não tem mais cor, fonte, logo nem a caixa do rodapé; mostra formato, só aprovadas, público e um ponteiro "Cores, fontes, capa e rodapé: Aparência do manual" que abre a tela (HTML e PDF).
  - [ ] Painel atual "Aparência" renomeado para "Tema do Studio" no menu e no título; nota dele e descrição do diálogo de exportação apontam o lugar certo (pt e en).
  - [ ] Mesmas validações de contraste e mesmas mensagens de hoje (4,5:1); nenhum campo novo no `theme`.
  - [ ] Fonte: se a pergunta 4 for "sim", `FontMenu` sai da barra do editor, a fonte do manual continua refletindo ao vivo no editor, e a fonte de um trecho selecionado fica separada (T-160). Nome da fonte inteiro em 1280 e 375 px (scrollWidth x clientWidth).
  - [ ] 375 e 1280, claro e escuro: sem rolagem horizontal; foco preso e devolvido ao fechar; teclado completo.
  - [ ] e2e que usava as cores pelo diálogo de exportação aponta para a tela nova.
  - [ ] `grep` por "Cores do manual" e "Sem o rodapé do Explicaí" em `ExportDialog.tsx` não acha mais nada.

### N5. T-147 reescrito: capa e rodapé como seções da tela de Aparência

- Prioridade: P2. Tamanho: G (o mesmo do T-147). Agente: frontend. Depende do N4.
- Absorve: **T-147** (editar o ticket existente em vez de abrir outro): os campos, as regras de PDF e as decisões da pessoa ficam; muda o lugar (seções Capa e Rodapé da tela, não `ExportDialog`) e a etapa 2 (botão de edição no cabeçalho da página abre a mesma tela na seção Capa). `capa-e-rodape.md` ganha uma linha apontando esta discovery.
- Critérios de aceite: os do T-147 (manual sem `cover`/`footer` exporta igual; escape de `<`, `"`, `'`, `\`, quebra de linha; rodapé por página no PDF com aviso em Chrome < 131; limites 120/100; prévia que muda enquanto digita; sugestão de data e versão; mesmo conteúdo no export por público; 375 e 1280; `manual-format.md`), mais:
  - [ ] Os campos ficam na tela de Aparência, nunca no `ExportDialog`.
  - [ ] O botão de edição por hover (etapa 2) abre a mesma tela na seção Capa, sem componente duplicado.
  - [ ] A prévia da capa vive na seção Capa e usa o código do export.

### N6. Amostra ao vivo na tela de Aparência

- Prioridade: P3. Tamanho: M. Agente: frontend. Depende do N4.
- Absorve: nada.
- Critérios de aceite:
  - [ ] Bloco "Amostra" mostra título 1 e 2, parágrafo, link, número de passo, destaque, realce e um marcador, com as cores e fontes escolhidas; muda ao mudar um campo.
  - [ ] As variáveis vêm do mesmo `themeCss` do export (rota que devolve o CSS, sem cópia do mapeamento no web).
  - [ ] A amostra respeita as fontes empacotadas (mesma carga do `useFontPreview`).
  - [ ] Em 1280 px a amostra aparece ao lado das seções sem rolar; em 375 px, abaixo, sem `sticky`.
  - [ ] O resto do Studio (editor, barra) não muda de cor.

### Opcional (P3, G): botão "Mover para outro público" ao remover

Não abrir agora. Observar se a pessoa remarca páginas na mão depois de remover um público.

---

## Perguntas para a pessoa

1. **Um nome só para o público (T-158).** Hoje: Ver como, Público da página, Quem vê esta página, Para quem exportar. Recomendo o substantivo "Público" em toda parte: "Ver como público" (barra), "Público da página" (popover), "Público do export" (exportação), "Públicos do manual" (gestão). "Perfil" sai da interface (hoje aparece em textos de ajuda). Serve?
2. **Remover público com páginas só dele.** Recomendo liberar essas páginas para todos, com confirmação mostrando a contagem e os títulos. Alternativa: bloquear até a pessoa desmarcar. Prefere avisar ou bloquear?
3. **Renomear para nome que já existe.** Recomendo recusar, sem mesclar. Mesclar fica para depois, se pedirem.
4. **Fonte do manual na barra do editor.** A pessoa decidiu no T-065 por pô-la na barra. Com a tela de Aparência, recomendo tirar da barra e deixar só na tela (o editor segue mostrando a fonte ao vivo). Ou manter nos dois lugares, com o aviso "vale para o manual inteiro" que o T-160 pedia?
5. **Cores do manual no editor.** Recomendo não colorir o editor (Studio sóbrio, contraste no tema escuro) e mostrar tudo na amostra da tela. Quer mesmo ver as cores no texto que escreve? Se sim, vira interruptor opcional, desligado por padrão.
6. **Nome do painel atual "Aparência".** Recomendo renomear para "Tema do Studio" e chamar o novo de "Aparência do manual", como a pessoa pediu. Confirma?

## Rascunho de spec da opção recomendada (formato da skill `especificar`)

Recomendação: **N1 e N4 primeiro** (resolvem o que a pessoa pediu de imediato, sem formato novo), depois **N2 + N3** (gestão de públicos), depois **N5** (T-147 dentro da tela) e **N6** (amostra).

**Escopo**
- Sidebar: reordenar e dar respiro (N1).
- Tela "Aparência do manual" nos Ajustes, com cores, fontes, logo e rodapé do Explicaí; exportação só com formato, aprovadas e público; painel antigo vira "Tema do Studio" (N4).
- Gestão de públicos: criar, renomear, remover, no core e em diálogo nos Ajustes; popover com link (N2, N3).
- T-147 reescrito para viver dentro da tela (N5); amostra ao vivo (N6).

**Critérios de aceite do conjunto**
1. Nenhum campo de estilo no `ExportDialog`.
2. Renomear e remover público nunca perde conteúdo: página restrita só vira "todos" depois de confirmação explícita com contagem.
3. Formato em disco (`manual.json`, frontmatter, JSON de anotações) inalterado, exceto os campos aditivos do T-147.
4. Abrir, editar, renomear e exportar com página aberta não regrava nome antigo.
5. 375 e 1280, claro e escuro, pt e en; teclado completo; axe sem violação nas telas novas.
6. `npm run check` e e2e das áreas tocadas passam.

**Riscos**
- Escrita em vários arquivos ao renomear (parcial, corrida com autosave).
- Remover libera conteúdo restrito (mitigado por confirmação).
- Dois painéis com a palavra "Aparência" (mitigado pelo renome).
- Tela de configuração que cresce demais (mitigado por seções simples e sem `<details>`).
- Duplicar o CSS do export na amostra (mitigado pela rota de `themeCss`).

**Fora**
Mesclar públicos, mover páginas ao remover, MCP para gerir público, imagem de fundo na capa, cor do manual no editor, rodapé por público.

## Lacunas

- Não olhei concorrentes: os três pedidos são de tela própria. Qualquer afirmação de mercado está ausente de propósito.
- Não verifiquei se versões salvas e a versão publicada guardam o `audience`; a decisão "versão não renomeia" depende disso.
- Não verifiquei quais e2e dependem da posição do "Ver como" ou das cores no diálogo de exportação.
- Não verifiquei se o código do web pode importar algo do core (afeta como a amostra obtém o CSS).
- Medidas da Sidebar são de uma largura (1280 px), um tema, uma conta de duas páginas.

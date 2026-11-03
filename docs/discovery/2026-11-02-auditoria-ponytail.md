# Discovery: auditoria de qualidade do código (2026-11-02)

Pedido: rodar a auditoria `ponytail-audit` em `src/` e `web/src/` como discovery. Nada foi alterado no código nem nos tickets.

## Escopo e método

- Leitura direta de `src/server`, `src/core` (incluindo `export/`) e dos arquivos de `web/src` que tocam salvamento, imagens, árvore e exportação. Telas e CSS ficaram de fora: a conferência visual já tem `/impeccable audit` e os tickets de design.
- Nenhuma medição de tempo foi feita. Onde o achado depende de tamanho real, está marcado como **hipótese** e diz o que medir.
- `docs/tickets/README.md` lido antes. Tickets abertos que tocam o assunto: T-064 (QA da imagem; linha 65 deixa "svg entra?" em aberto), T-020 (dimensões das imagens no export), T-080 (`.env` no `.gitignore`), T-079 (breakpoint duplicado), T-021 (temporários do e2e). Nenhum cobre os achados abaixo. O ticket "SVG sem CSP" citado no pedido **não aparece no README**; tratei como novo (achado 1). Se ele existir fora do README, descarte o item.
- Estado de teste hoje: 23 arquivos em `test/` e 27 em `web/test/`, piso de cobertura 42% (`vitest.config.ts:11`). O núcleo de caminhos e UTF-8 está bem coberto (T-056, T-057, T-058). Faltam testes de concorrência, de `useStudio` e dos fluxos de imagem (achado 14).

Resumo: 3 altas, 11 médias, 11 baixas (os itens 22 e 23 são notas, não defeitos).

---

## Altas

### 1. SVG servido na origem do Studio, sem CSP nem sandbox

- Onde: `src/server/http.ts:27` (mime `image/svg+xml`) e `:41-45` (resposta sem `content-security-policy`); `src/core/assets.ts:104` (aceita `.svg`); `src/server/routes/assets.ts:181-185` (`/files/:slug/*` serve qualquer arquivo do manual).
- O que acontece: o editor mostra o SVG dentro de `<img>`, onde script não roda. Mas se alguém abre o endereço do arquivo direto no navegador, o SVG é um documento da própria origem do Studio e o `<script>` dele executa.
- Cenário: a pessoa recebe um manual de um colega (zip, git) com `assets/logo.svg` contendo `<script>fetch('/api/manuals/x/pages/ID',{method:'DELETE'})</script>`. Abre `http://localhost:4321/files/x/assets/logo.svg` para ver a imagem. O script passa nas checagens de Host e Origin (é a mesma origem) e apaga, lê ou sobrescreve qualquer manual da pasta. A UI recusa SVG ao colar, mas o servidor, o MCP e o logo (`LOGO_EXT`) aceitam.
- Correção mínima: em `send()` de arquivos, mandar `content-security-policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` (não afeta `<img>`). Opcional: `content-disposition: attachment` para `.svg` fora de `<img>`.
- Teste: GET de um `.svg` devolve o cabeçalho; ficar em `test/server-security.test.ts`.
- Esforço: P. Agente: frontend (servidor), qa para o teste.
- Nota: `docs/manual-format.md:79` diz "o SVG não roda script" e vale só para o HTML exportado, não para o `/files/`.

### 2. Escritas simultâneas em `manual.json` perdem mudanças da árvore

- Onde: `src/core/manuals.ts:234-239` (`updateManual` lê, muda e grava sem trava); usado em `src/core/pages.ts:25,123`, `src/core/trash.ts:318,354`, `src/core/versions.ts:444`, `src/core/export/index.ts:342`.
- O que acontece: duas requisições leem o mesmo `manual.json`, cada uma muda uma cópia, e a que grava por último apaga a mudança da outra. O servidor é assíncrono e não serializa nada.
- Cenário: duplo clique em "Nova página" (as duas chamadas passam por `await flush()` ao mesmo tempo, `useStudio.ts:160-169`), ou arrastar uma página na árvore enquanto o autosave renomeia o título de outra (`PUT` com troca de título chama `updateManual`). Resultado: a página nova existe em `pages/` mas não aparece na árvore, ou o movimento é desfeito sem aviso. Um agente MCP escrevendo ao mesmo tempo agrava.
- Correção mínima: uma fila por pasta (`Map<string, Promise<unknown>>`) dentro de `updateManual`; cada chamada encadeia na anterior.
- Teste: `Promise.all` de 10 `addPage` devolve 10 nós na árvore.
- Esforço: P. Agente: frontend (núcleo), qa.

### 3. Imagens sem validador de cache e lidas inteiras na memória

- Onde: `src/server/http.ts:38-47` (`readFile` do arquivo inteiro; `cache-control: no-cache` sem `ETag` nem `Last-Modified`, então nunca vira 304); limite de envio de 20 MB por imagem em `src/server/routes/assets.ts:145`.
- O que acontece: a cada abertura de página, o navegador rebaixa todas as imagens, e o Node carrega cada arquivo inteiro na memória antes de responder. Assets têm nome único e nunca mudam depois de gravados (`saveAsset`, `flag: "wx"`), então o `no-cache` não protege nada.
- Cenário: manual com 60 prints de 3 MB, página com 20 deles. Cada troca de página: 60 MB lidos do disco e enviados. Com a árvore aberta em duas abas, dobra. O editor também não usa `loading="lazy"` (grep em `web/src`: nenhum), então todas as imagens da página baixam de uma vez.
- Correção mínima: `stat` + `ETag` por tamanho e mtime, responder 304; trocar `readFile` por `createReadStream(...).pipe(res)`; `cache-control: private, max-age=3600` nas imagens de `assets/`. `loading="lazy"` e `decoding="async"` no node de imagem do editor.
- Esforço: M. Agente: frontend.
- Relacionado: T-020 (dimensões das imagens no export) resolve o salto de layout no HTML exportado; o mesmo vale para o editor e pode entrar junto.

---

## Médias

### 4. Autosave pode mandar duas gravações da mesma página ao mesmo tempo

- Onde: `web/src/hooks/useAutosave.ts:26-45` e `:52` (o timer de 600 ms chama `flush` mesmo com um `PUT` em andamento); lado servidor em `src/core/pages.ts:100-135` (ler, montar e gravar, sem comparar versão).
- O que acontece: `flush` esvazia a fila e dispara o `PUT`. Se esse `PUT` demora (troca de título renomeia o arquivo e relê todas as outras páginas, achado 11), o próximo `flush` sai em paralelo. No servidor as duas gravações se intercalam e o texto mais antigo pode chegar por último.
- Cenário: manual de 300 páginas, a pessoa digita um título e continua no corpo da página. O corpo digitado depois do primeiro `PUT` pode voltar ao estado anterior no disco, e a linha de status mostra "Salvo". Reabrir a página mostra o texto velho.
- Correção mínima: encadear os `flush` numa promessa (`inFlight = inFlight.then(...)`), ou recusar disparar enquanto houver um em curso.
- Esforço: P. Agente: frontend, com teste em `web/test/useAutosave.test.ts`.
- Duas abas no mesmo manual seguem em "última gravação vence". Aceitável hoje; vale um `ETag` por página se aparecer relato.

### 5. "Limpar imagens sem uso" pode mover uma imagem recém-colada

- Onde: `web/src/features/pages/TrashPanel.tsx:32-39` (não chama `flush` antes); `src/core/assets.ts:152-185` (decide só pelo que está em disco).
- O que acontece: uma imagem colada há menos de 600 ms, ou presa numa fila de autosave que falhou, ainda não está em nenhuma página no disco. O painel a conta como sem uso e a move para `.lixeira/imagens-<data>/`.
- Cenário: a pessoa cola um print, abre Lixeira e clica em limpar. A imagem some do texto salvo quando o autosave termina; o editor mostra imagem quebrada.
- Correção mínima: `await studio.flush()` antes de `cleanUnusedAssets`, e ignorar arquivos com menos de 1 minuto no servidor.
- Esforço: P. Agente: frontend.

### 6. Qualquer página em outra porta de `localhost` consegue escrever no Studio

- Onde: `src/server/security.ts:5` (`LOCAL_ORIGIN` aceita qualquer porta); `src/server/http.ts:67-86` (`readJson` não confere `content-type`).
- O que acontece: Host e Origin são checados, mas Origin `http://localhost:3000` passa. Um `POST` com `text/plain` não dispara preflight, então o navegador envia, e o servidor lê o corpo como JSON. `PUT` e `DELETE` ficam protegidos (preflight falha, não há CORS). A resposta não é legível por quem enviou.
- Cenário: a pessoa roda outro projeto local (ou abre uma página não confiável servida em localhost). Essa página dispara `POST /api/manuals`, `.../assets/clean`, `.../export` e `.../assets` (upload de 20 MB) contra o Studio. Cria lixo e consome disco; não lê nada.
- Correção mínima: aceitar Origin só se for `http://${req.headers.host}` (mesma porta; funciona com o proxy do Vite, que mantém Host e Origin em 5173). Segunda camada: exigir `content-type: application/json` onde `readJson` é usado.
- Esforço: P. Agente: frontend, qa (teste em `server-security.test.ts`).

### 7. Abrir o painel Lixeira lê todo o manual, incluindo todas as versões

- Onde: `web/src/features/pages/TrashPanel.tsx:27` chama `unusedAssets` a cada abertura; `src/core/assets.ts:159-168` lê, um por vez, todo `.md` de `pages/`, `.versoes/` e `.lixeira/`.
- O que acontece: cada versão guardada é uma cópia completa da página (`versions.ts:405`). A leitura é sequencial e se repete a cada abertura do painel.
- Cenário (hipótese, medir): 300 páginas com média de 20 versões = 6 000 arquivos lidos em série só para mostrar "N imagens sem uso". O painel demora e o disco trabalha.
- Correção mínima: calcular só ao clicar em "Limpar" (o botão já existe) ou sob demanda com `Promise.all` em lotes; mostrar a contagem depois. Alternativa: guardar contagem por 60 s.
- Esforço: P a M. Agente: frontend.

### 8. `imageSize` lê a imagem inteira para ler o cabeçalho

- Onde: `src/core/export/imageSize.ts:77` (`readFile`), chamado de `src/core/export/refs.ts:37`, sequencial.
- O que acontece: PNG, GIF e WebP guardam as dimensões nos primeiros bytes; JPEG, nos primeiros KB. O código carrega o arquivo todo (até 20 MB) por imagem e depois o `copyFile` lê de novo.
- Cenário: exportar 200 prints de 3 MB lê 600 MB só para descobrir largura e altura.
- Correção mínima: `open` + `read` de 64 KB no começo; SVG: 4 KB. JPEG progressivo com EXIF grande: se não achar o marcador SOF nos 64 KB, ler o resto.
- Esforço: P. Agente: frontend. Já existe `test/image-size.test.ts`.

### 9. Um JSON de marcação quebrado derruba a exportação inteira

- Onde: `src/core/assets.ts:126` (`JSON.parse` sem proteção), chamado por `src/core/export/refs.ts:37`.
- O que acontece: `assets/tela.png.json` com erro de sintaxe (editado à mão, merge do git, disco cheio) faz `loadImages` lançar. O Studio mostra `Unexpected token...` sem dizer qual arquivo, e nenhum formato sai.
- Cenário: conflito de merge deixa `<<<<<<<` dentro de um `.json`. A pessoa clica em Exportar e recebe um erro técnico.
- Correção mínima: em `loadImages`, `try/catch` por imagem; sem marcações, exporta a imagem pura e acrescenta aviso (`warnings`) com o nome do arquivo. Na rota GET de anotações, devolver 400 com o nome do arquivo.
- Esforço: P. Agente: frontend, qa.

### 10. Exportar apaga a exportação anterior antes de gerar a nova; duas exportações ao mesmo tempo se pisam

- Onde: `src/core/export/index.ts:315,322` (`freshDir` primeiro, depois cópia e renderização); `:363-367`.
- O que acontece: se algo falha no meio (item 9, imagem apagada entre o `exists` e o `copyFile`, `renderHtml` lançando), `exportacao/html/` fica vazia ou pela metade, e a versão boa que já existia se foi. O diálogo desabilita o botão enquanto exporta, mas duas abas ou o MCP podem chamar juntos, e `rm` de uma apaga o que a outra gravou.
- Cenário: o manual publicado fica em `exportacao/html/` e é enviado para um servidor a partir dali. Uma exportação com erro deixa a pasta sem `index.html`.
- Correção mínima: gerar em `exportacao/.html-<uuid>/` e, no fim, `rm` do antigo + `rename`. Falhou, o antigo continua.
- Esforço: P a M. Agente: frontend.

### 11. Cada pausa de 600 ms na digitação do título renomeia o arquivo e relê todas as páginas

- Onde: `src/core/pages.ts:116-133` (novo arquivo, `updateManual`, `rm` do antigo) e `:138-150` (`relink` lê e regrava cada página que citar o arquivo; lê todas); disparo em `web/src/layout/PageView.tsx:84-87` e `useStudio.ts:274-281`.
- O que acontece: digitar "Cadastrar cliente" com duas pausas cria `cadastrar.md`, depois `cadastrar-cliente.md`, e a cada passo lê as outras páginas para corrigir links. Links externos para o arquivo antigo quebram, e o git vê várias renomeações.
- Cenário: manual de 300 páginas, 5 pausas ao digitar um título = 1 500 leituras de arquivo e 5 mudanças de nome.
- Correção mínima: só renomear o arquivo no `flush` ao sair da página ou depois de 5 s sem digitar; enquanto isso, gravar o título no frontmatter no mesmo arquivo. Em `relink`, só abrir páginas que mencionam o nome (busca simples antes de regravar já existe; falta evitar a releitura completa quando nada cita).
- Esforço: M. Agente: frontend.

### 12. Cada tecla serializa o documento inteiro para Markdown

- Onde: `web/src/features/editor/Editor.tsx:81` (`onUpdate` chama `ed.getMarkdown()` e `toDiskMarkdown`, duas regex sobre o texto todo, a cada transação).
- O que acontece: o custo cresce com o tamanho da página, e o resultado só é usado 600 ms depois da última tecla.
- Cenário (hipótese, medir com o Performance do Chrome numa página de 300 blocos): a digitação perde fluidez em páginas longas.
- Correção mínima: `useAutosave` aceitar uma função (`() => string`) em vez do texto pronto, e serializar só no `flush`. O estado da fila fica igual.
- Esforço: M. Agente: frontend.

### 13. A árvore lê cada arquivo de página inteiro só para pegar título e status

- Onde: `src/core/pages.ts:54-76` (`readPageTree` chama `readPageFile`, que usa `readText` completo); `GET /api/manuals/:slug` roda após cada ação (`refreshManual` em `useStudio.ts:66-70`: criar, mover, status, restaurar, tema, logo).
- O que acontece: 300 páginas de 20 KB = 6 MB lidos e interpretados (YAML) para cada ação, com `Promise.all` abrindo 300 arquivos de uma vez.
- Cenário (hipótese, medir): mover uma página numa árvore grande leva perceptível mais de 200 ms.
- Correção mínima: ler só os primeiros 2 KB (o frontmatter) em `readPageTree`; manter `readPageFile` completo para abrir a página. Não mexer no formato em disco (mudar o formato para guardar o título em `manual.json` seria risco alto e não é necessário).
- Esforço: P. Agente: frontend.

### 14. Código arriscado sem teste

- `web/src/hooks/useStudio.ts` (317 linhas): nenhum teste. Concentra abrir manual, trocar de página, remover e desfazer, restaurar versão, exportar. Os e2e passam por ele, mas não cobrem erro de rede no meio, nem respostas fora de ordem (achado 15).
- Concorrência no núcleo (achados 2, 4, 10): só existe o teste de cinco envios simultâneos de imagem (`test/image-assets.test.ts:42`).
- Rota de arquivos: não há teste de cabeçalho (`nosniff` está lá, CSP não), nem de arquivo grande, nem de diretório (`EISDIR` hoje vira 400 com caminho absoluto, achado 18).
- Fluxo de imagem no editor: `imageUpload.ts` sem teste unitário (colar durante digitação, falha de rede no segundo arquivo de vários).
- `TrashPanel` e a limpeza de imagens: sem teste de interface (achado 5).
- Correção mínima: um teste por achado 2, 4, 5 e 10 ao corrigi-los; mais um `useStudio.test.tsx` com `fetch` simulado cobrindo troca de página rápida e servidor fora.
- Esforço: M. Agente: qa.

---

## Baixas

### 15. Resposta de página fora de ordem ao clicar rápido

`web/src/hooks/useStudio.ts:60-64`: `showPage` faz `setPage(await api.getPage(...))` sem identificar a chamada. Dois cliques seguidos (A e depois B) podem terminar com a página A na tela e o endereço apontando para B. Gravar não corrompe nada (o autosave usa o id da página mostrada), mas confunde. Correção: contador de chamada e descartar resposta antiga. P, frontend.

### 16. Imagem colada vai para a posição antiga se a pessoa digitar durante o envio

`web/src/features/editor/imageUpload.ts:16-26`: `pos` é capturado antes do `await`. Se o texto muda durante o envio (20 MB em rede lenta), a imagem entra no lugar errado; se o documento encolheu, `insertContentAt` lança, o arquivo já está em `assets/` e o aviso diz "não foi possível enviar" (órfão que o item 5 depois limpa). Correção: mapear a posição pelas transações (`tr.mapping`) ou inserir um marcador antes do envio. M, frontend.

### 17. Link simbólico dentro do manual escapa da pasta

`src/core/fs.ts:261-266`: `resolveInside` compara o caminho em texto, sem `realpath`. Um `assets/x.png` que é link para fora do manual é servido por `/files/` (e copiado na exportação). Só importa para manual recebido de fora; a pessoa precisa abrir o arquivo. Correção: `realpath` no `file()` do servidor e em `copyImages`, comparando com a pasta do manual. P, frontend.

### 18. Mensagens de erro com caminho absoluto; diretório vira 400

`src/server/http.ts:78,88-95`: o corpo de erro repassa `err.message` do Node, que inclui `ENOENT: no such file ... 'C:\Users\PC\...'`. Pedir `/files/m/assets` (diretório) dá `EISDIR` com status 400. O navegador mostra isso em aviso. Correção: mapear `ENOENT`/`EISDIR`/`EACCES` para frases fixas (e 404 para diretório). P, frontend.

### 19. Um `entry.json` quebrado esconde toda a lixeira

`src/core/trash.ts:301-309`: `JSON.parse` sem proteção dentro do laço; um item ruim falha a listagem inteira. `listManuals` já trata isso (`manuals.ts:205-209`); a lixeira deve fazer o mesmo e pular o item. P, frontend.

### 20. `addPage` grava a árvore antes do arquivo

`src/core/pages.ts:25-29`: se `writePageFile` falhar (disco cheio, permissão), a árvore aponta para um arquivo que não existe e a página aparece com aviso. Inverter a ordem (arquivo primeiro, como `updatePage` já faz). P, frontend.

### 21. Arquivos grandes e lugares para dividir

- `src/core/export/html.ts` (254 linhas): 70 delas são a constante `CSS`. Mover para `export/htmlCss.ts` junto de `annotationCss.ts`. P.
- `web/src/hooks/useStudio.ts` (317): separar as ações de versão/exportação/tema (que só chamam `api` e `refreshManual`) em `useManualActions.ts`. M.
- `web/src/components/ui/dropdown-menu.tsx` (254) e `dialog.tsx`: código do shadcn; não mexer.
- `web/src/lib/i18n.en.ts` (390): tabela de dados; deixa como está.
- Agente: frontend. Só vale fazer junto com outro ticket que já toque o arquivo.

### 22. Duplicações que são de propósito: não juntar

`web/src/lib/annotationShapes.ts` e `src/core/export/annotationShapes.ts` (testadas contra divergência em `test/annotation-shapes.test.ts`), e os nomes de cor em `textColor.ts`, `export/textColors.ts` e `tokens.css`. A regra é "o web não importa de `src/`". Juntar exigiria uma pasta compartilhada e mudar o build; custo maior que o ganho. O teste que compara as duas cópias é suficiente.

### 23. Lixo e inconsistências no repositório

- `.baseline/` e `.depois/` (1,9 MB cada, restos de comparação com `serve.mjs`) estão no `.gitignore` e podem ser apagados.
- `docs/tickets/README.md` tem linhas repetidas na tabela "Abertos": T-064 e T-065 aparecem duas vezes, e T-070, T-071, T-074 constam como "feito" e "aberto" ao mesmo tempo. Como o supervisor está mexendo nesse arquivo, só aviso.
- T-021 e T-080 (já abertos) cobrem temporários do e2e e `.env`.

### 24. Hipóteses sobre o PDF (verificar antes de qualquer correção)

- `<img loading="lazy">` (`src/core/export/html.ts:182`) com `--print-to-pdf` do Chrome headless: se imagens fora da tela inicial saírem em branco num manual com 100 prints, tirar o `lazy` só no PDF. Teste: exportar um manual de exemplo com 100 imagens.
- `execFile` promisificado tem `maxBuffer` de 1 MB (`pdf.ts:248`). Se o Chrome escrever mais que isso no stderr, o processo é morto e o PDF falha com mensagem confusa. Passar `maxBuffer: 10 * 1024 * 1024` custa uma linha.
- Esforço: P cada. Agente: qa para verificar, frontend para corrigir.

### 25. Árvore sem virtualização; numeração recalculada em cada digitação do título

`web/src/features/pages/PageTree.tsx:44` (`numberPages(pages)` a cada render) e `useStudio.ts:276-278` (`renameItem` reconstrói a árvore em cada tecla do título). Com 500 páginas visíveis, cada tecla re-renderiza 500 linhas. Hipótese: perceptível só acima de umas centenas de páginas. Correção possível: `useMemo` na numeração; recolher ramos por padrão. P, frontend. Medir antes.

---

## O que a auditoria confirmou como sólido

- Caminhos: `resolveInside` + `manualDir` + lista fechada de fontes (`fonts.ts:238`) barram `..`, barras e caminho absoluto. Testes em `test/security.test.ts` e `server.test.ts:62`.
- HTML exportado: HTML solto no texto vira texto; só link `http(s)`/`mailto`/`#`; `href` de área clicável validado ao gravar (`annotations.ts:335`) e de novo ao exportar (`safeHref`). Coberto por `test/export-xss.test.ts`.
- Servidor só em `127.0.0.1`; Host e Origin checados; UTF-8 estrito; `%` malformado vira 400.
- Gravação atômica (`atomicWrite`) em páginas, `manual.json` e marcações; lixeira e "Antes de restaurar" evitam perda por clique errado.

---

## Tickets propostos (não criados)

| # | Título curto | Prioridade | Agente | Achado |
|---|--------------|------------|--------|--------|
| 1 | CSP e sandbox nas respostas de `/files/` (SVG na origem do Studio) | P1 | frontend | 1 |
| 2 | Fila por pasta em `updateManual` (perda de mudança na árvore) | P1 | frontend | 2 |
| 3 | Imagens com ETag/304, streaming e `loading="lazy"` | P1 | frontend | 3 |
| 4 | Autosave: um `PUT` por vez por página | P2 | frontend | 4 |
| 5 | Limpar imagens sem uso: gravar a fila antes e poupar arquivo novo | P2 | frontend | 5 |
| 6 | Aceitar Origin só da mesma porta do Host | P2 | frontend | 6 |
| 7 | Contagem de imagens sem uso só sob demanda | P2 | frontend | 7 |
| 8 | `imageSize` lê só o cabeçalho do arquivo | P2 | frontend | 8 |
| 9 | Marcação com JSON quebrado vira aviso na exportação | P2 | frontend | 9 |
| 10 | Exportar em pasta temporária e trocar no fim | P2 | frontend | 10 |
| 11 | Renomear arquivo da página só ao parar de digitar o título | P2 | frontend | 11 |
| 12 | Serializar o Markdown só no flush do autosave | P3 | frontend | 12 |
| 13 | `readPageTree` lê só o frontmatter | P3 | frontend | 13 |
| 14 | Testes de concorrência, `useStudio` e fluxo de imagem | P2 | qa | 14 |
| 15 | Descartar resposta antiga ao trocar de página | P3 | frontend | 15 |
| 16 | Posição da imagem colada acompanha edição durante o envio | P3 | frontend | 16 |
| 17 | `realpath` ao servir e copiar arquivos do manual | P3 | frontend | 17 |
| 18 | Erros de arquivo sem caminho absoluto; diretório vira 404 | P3 | frontend | 18 |
| 19 | Lixeira pula item com `entry.json` quebrado | P3 | frontend | 19 |
| 20 | `addPage` grava o arquivo antes da árvore | P3 | frontend | 20 |
| 21 | Separar CSS de `html.ts` e ações de `useStudio` | P3 | frontend | 21 |
| 22 | Verificar PDF com 100 imagens (`lazy`, `maxBuffer`) | P3 | qa | 24 |
| 23 | Medir árvore com 500 páginas e memoizar numeração | P3 | qa | 25 |

Sugestão de ordem: 1, 2 e 3 primeiro (cada um é pequeno e muda comportamento visível ou protege dado); 4, 5, 6 e 14 em seguida; o resto entra por prioridade.

## Fora do que foi olhado

- Telas, CSS, acessibilidade e responsivo (cobertos por T-076 a T-081 e pelo `/impeccable audit`).
- `dependencies` e vulnerabilidades de pacote (`npm audit` não foi rodado); `marked` e `yaml` são as únicas em runtime.
- Comportamento real com 500 páginas e 200 imagens: os itens 7, 12, 13, 24 e 25 são hipóteses até alguém medir.

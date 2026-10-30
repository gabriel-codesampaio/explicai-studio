# T-047: Telas de erro: servidor fora, rota inexistente, erro inesperado

- Prioridade: P1
- Tamanho: G
- Status: em andamento
- Agente: frontend
- Origem: Relato da pessoa (2026-10-30): tela escura só com "Error 502" em `npm run dev:web`

## Problema
Quando algo falha, a pessoa vê texto cru ("Error 502") ou nada. Sem dizer o que houve, sem ação, sem reconexão.

## Causa do "Error 502" (confirmada)
O texto vem do próprio Studio, não do navegador. `vite.config.ts` repassa `/api` para `127.0.0.1:4321`. Sem servidor ali (ou com o `tsx watch` do `dev:server` reiniciando), o proxy do Vite responde `502 Bad Gateway`, `text/plain`, corpo vazio (reproduzido com proxy para porta morta). `api.ts` não acha JSON, monta `t("Erro {status}")` ("Error 502" com a interface em inglês) e `Shell` mostra `bootError` solto no centro do fundo escuro. Não é encaminhamento de porta do VS Code. Em produção (`node dist/cli.js`) o servidor cai junto com a página, então o navegador mostra a tela de "site inacessível" dele; a reconexão só vale para a aba que já estava aberta.

## Discovery: estados de erro, antes e depois
Ver tabela no Registro (preenchida ao fechar).

### Como outros produtos tratam
- Linear: mudança que não sai fica guardada no aparelho e é reenviada quando a conexão volta; indicador "Syncing" com a contagem na barra lateral. Offline é "failsafe", sem tela bloqueante. https://linear.app/docs/get-the-app e https://linear.app/now/rebuilding-delta-sync-read-path
- Notion: edições offline ficam salvas e sincronizam sozinhas na volta; um indicador mostra o estado. https://www.notion.com/help/guides/working-offline-in-notion-everything-you-need-to-know
- Figma: ícone na barra e aviso no rodapé dizendo que há mudanças sem salvar; edições ficam no navegador e vão sozinhas ao reconectar. https://help.figma.com/hc/en-us/articles/360040328553-Work-offline-in-Figma
- web.dev: dizer o que o app consegue fazer agora, de quem é o problema, mostrar se a edição está salva, sincronizar sozinho ao voltar, nada de modal que prende. https://web.dev/articles/offline-ux-design-guidelines
- GitHub Pages e Vercel: a página 404 é da própria aplicação (conteúdo livre) e códigos de erro têm página de explicação própria. https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site e https://vercel.com/docs/errors/error-list
- Não verificado: as telas de 404 e de erro inesperado desses produtos não têm página de documentação para citar; o padrão acima vem das fontes que acessei, não de capturas das telas.

### Decisões
- Mensagem em duas partes: o que aconteceu, o que fazer. Código técnico pequeno, em mono, com botão "Copiar".
- Uma ação principal por tela (cobalto); a secundária é texto.
- Servidor fora: tela cheia só na abertura (não há o que mostrar). Com o Studio já aberto, aviso fixo no topo e o texto fica no editor; o salvamento tenta de novo sozinho quando o servidor volta.
- Reconexão com espera crescente (1 s, 2 s, 4 s, 8 s, teto de 15 s), mais um botão "Tentar agora".
- Sem ilustração; só a marca, o título em Archivo e o texto.

## Critérios de aceite
- [ ] Servidor fora (fetch falhou ou 502/503/504) na abertura: tela com título, texto, "Tentar agora" e reconexão automática; ao voltar, o Studio abre sem recarregar.
- [ ] Servidor cai com o Studio aberto: aviso no topo, texto preservado, salvamento retomado sozinho na volta.
- [ ] Hash com manual ou página inexistente: tela 404 com caminho para a primeira página/lista de manuais.
- [ ] Erro de renderização: ErrorBoundary com "Recarregar" e código copiável.
- [ ] Falha de salvamento: aviso diz que o texto continua na tela.
- [ ] 403, 400 (UTF-8) e PDF sem navegador com mensagem traduzida (pt e en).
- [ ] Servidor de produção sem o editor compilado responde página HTML curta.
- [ ] pt/en, claro/escuro, 375 px, foco no título, role alert/status, alvos de 44 px.

## Registro
(preenchido ao fechar)

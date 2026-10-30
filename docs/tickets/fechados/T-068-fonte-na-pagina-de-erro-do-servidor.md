# T-068: Página HTML de erro do servidor sem a fonte Archivo

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-30

## Problema
A página estática de erro (src/server/errorPage.ts) cai em Arial Narrow ou fonte do sistema, e existe justamente quando o editor não carrega.

## Critérios de aceite
- [x] Título com a fonte da marca quando possível (servir a fonte local do pacote, sem CDN) ou fallback bem escolhido e medido.
- [x] Sem dependência nova; claro e escuro; teste em test/error-page.test.ts.

## Onde
`src/server/errorPage.ts`, pasta `fonts/` do pacote.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
Commit 9838432.

A página declara `@font-face` de Archivo e Atkinson apontando para `/api/fonts/` (rota que já serve as fontes do pacote, sem CDN) e usa `Archivo` no título e no wordmark, com o fallback anterior. Teste novo em `test/error-page.test.ts` (declaração, sem URL externa, arquivos respondem 200). Medido no Chrome: fontes carregadas em claro e escuro, 1280 e 375 px, sem rolagem lateral.

Ficou de fora: página de acesso recusado (`forbidden-host`) não carrega a fonte, porque a rota de fontes também recusa o host.

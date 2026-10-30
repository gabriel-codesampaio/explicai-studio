# T-068: Página HTML de erro do servidor sem a fonte Archivo

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-30

## Problema
A página estática de erro (src/server/errorPage.ts) cai em Arial Narrow ou fonte do sistema, e existe justamente quando o editor não carrega.

## Critérios de aceite
- [ ] Título com a fonte da marca quando possível (servir a fonte local do pacote, sem CDN) ou fallback bem escolhido e medido.
- [ ] Sem dependência nova; claro e escuro; teste em test/error-page.test.ts.

## Onde
`src/server/errorPage.ts`, pasta `fonts/` do pacote.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

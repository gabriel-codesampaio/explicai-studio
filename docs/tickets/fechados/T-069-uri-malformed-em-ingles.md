# T-069: Mensagem "URI malformed" em inglês no 400 do servidor

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-30

## Problema
Um % malformado na URL vira 400 com a mensagem "URI malformed" em inglês, e a interface é em português e inglês.

## Critérios de aceite
- [ ] 400 com code estável (padrão do T-042, `ExplicaiError`) e mensagem em pt no servidor; tradução na UI em en.
- [ ] Teste em test/server-security.test.ts e web/test/apiErrors.test.ts.

## Onde
`src/server/index.ts`, `src/core/errors.ts`, `web/src/lib/api.ts`, `web/src/lib/i18n.en.ts`.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
- Commit: ef631c1.
- Feito: `decodeSegment` em `src/server/index.ts` lança `HttpError(400, msg pt, "malformed-url")`; texto en na UI (`api.ts` + `i18n.en.ts`) e na página de erro HTML (`errorPage.ts`). Testes em server-security e apiErrors; i18n.test garante a tradução en.
- Fora: medição no navegador. Usou HttpError (já com code, usado por invalid-utf8) em vez de ExplicaiError, que é do núcleo.

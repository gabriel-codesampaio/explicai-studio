# T-067: decodeURIComponent sem guarda no hash e nas anotações

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-30

## Problema
`web/src/lib/annotations.ts:48` e `web/src/lib/hashRoute.ts:9` chamam decodeURIComponent sem tratar URIError. Um hash como `#/%` pode derrubar a tela.

## Critérios de aceite
- [ ] Teste primeiro: hash com `%` solto, `%E0%A4%A` e similares não lançam; viram a tela 404 (T-051) ou o texto sem decodificar.
- [ ] Mesma conferência para outros decodeURIComponent/decodeURI em web/src (grep) e correção pela causa (um helper só, como `decodeUri` em src/core/text.ts).

## Onde
`web/src/lib/annotations.ts`, `web/src/lib/hashRoute.ts`, `web/test/`.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
- Commit: 82a28b5.
- Feito: helper `decodeComponent` em `web/src/lib/text.ts` (devolve o texto cru se o `%` for malformado), usado em `hashRoute.ts` e `annotations.ts`. Grep em web/src: não há outro decodeURI. Testes em text, hashRoute e annotations.
- Fora: medição no navegador (claro/escuro, 1280/375); o hash malformado vira slug cru e cai na tela de manual não encontrado já existente.

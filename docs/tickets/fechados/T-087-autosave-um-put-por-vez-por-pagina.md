# T-087: Autosave: um `PUT` por vez por página

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 4 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
`flush` esvazia a fila e dispara o `PUT`. Se esse `PUT` demora (troca de título renomeia o arquivo e relê todas as outras páginas, achado 11), o próximo `flush` sai em paralelo. No servidor as duas gravações se intercalam e o texto mais antigo pode chegar por último.

## Critérios de aceite
- [x] encadear os `flush` numa promessa (`inFlight = inFlight.then(...)`), ou recusar disparar enquanto houver um em curso.
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
`web/src/hooks/useAutosave.ts:26-45` e `:52` (o timer de 600 ms chama `flush` mesmo com um `PUT` em andamento); lado servidor em `src/core/pages.ts:100-135` (ler, montar e gravar, sem comparar versão).

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 4 da auditoria.

## Registro
Commit 84c43e9. `flush` encadeado em `inFlight` (começa já se ocioso, por causa do `beforeunload`); a gravação seguinte lê a fila só na sua vez. Teste novo em `web/test/useAutosave.test.ts`. Fora: versão no servidor (`pages.ts`).

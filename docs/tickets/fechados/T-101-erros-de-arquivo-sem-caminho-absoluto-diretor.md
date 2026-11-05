# T-101: Erros de arquivo sem caminho absoluto; diretório vira 404

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 18 (`docs/discovery/archives/2026-11-02-auditoria-ponytail.md`)

## Problema
Erros de arquivo sem caminho absoluto; diretório vira 404

## Critérios de aceite
- [ ] Erros de arquivo sem caminho absoluto; diretório vira 404
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
Ver a seção do achado na auditoria.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 18 da auditoria.

## Registro
Commit 61e1082. `publicMessage` em `src/server/http.ts` troca ENOENT/EISDIR/EACCES/EPERM por frases fixas na resposta de erro (`src/server/index.ts`); `statusOf` trata EISDIR como 404. Teste: `test/server-errors.test.ts`. Fora: `/files/` de diretório já dava 404 (`send` checa `isFile`); o teste só o trava.

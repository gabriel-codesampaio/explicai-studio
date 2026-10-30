# T-056: Testes de fs.ts, security.ts e caminho malformado

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: qa

## Critérios de aceite
- [x] atomicWrite, resolveInside (`..`, absoluto, barra invertida, `..%2f`, nomes reservados do Windows) e uniquePath com teste.
- [x] Host inválido (DNS rebinding), Origin `null` e `localhost.evil.com` recusados com 403.
- [x] `decodeURIComponent` malformado em src/server/index.ts responde 400.

## Registro
Nenhum bug achado. `%` inválido na URL lança URIError dentro do try e `statusOf` o devolve como 400 (a mensagem é "URI malformed", em inglês). Nomes reservados do Windows (CON, NUL, COM1) viram arquivo comum no Win10 19045 com Node; os slugs são sempre minúsculos. `..%2f` nunca é decodificado pelo core: é nome de arquivo comum e fica dentro. Testes: test/fs.test.ts, test/security.test.ts, test/server-security.test.ts.

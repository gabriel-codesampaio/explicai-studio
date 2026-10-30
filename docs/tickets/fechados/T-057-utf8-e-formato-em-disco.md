# T-057: UTF-8 e formato em disco

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: qa

## Critérios de aceite
- [x] Acento, emoji, BOM e CRLF de ida e volta em manual.json, frontmatter, página, nome de arquivo e exportação.
- [x] Teste de contrato do formato contra docs/manual-format.md (exemplos lidos do documento).
- [x] Regressão do T-046: corpo não UTF-8 volta 400 em várias rotas e não grava nada.

## Registro
Bug achado e corrigido (ac1ea97): BOM UTF-8 no começo do `manual.json` derrubava a abertura do manual ("não é um JSON válido"), e no começo de uma página fazia o frontmatter virar corpo (título vazio; o próximo salvamento duplicava o cabeçalho). Correção na causa: `readText` em `src/core/fs.ts`, usado por todas as leituras de texto do núcleo.
Sem bug: CRLF em página e manual.json abre, salva e exporta igual ao LF; o corpo mantém o CRLF que veio. Nome de arquivo sai em ASCII (acento removido, emoji ou CJK puro vira `sem-titulo`). Testes: test/encoding.test.ts, test/format-contract.test.ts, test/server-utf8.test.ts.

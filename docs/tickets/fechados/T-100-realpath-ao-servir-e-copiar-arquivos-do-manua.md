# T-100: `realpath` ao servir e copiar arquivos do manual

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 17 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
`realpath` ao servir e copiar arquivos do manual

## Critérios de aceite
- [ ] `realpath` ao servir e copiar arquivos do manual
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
Ver a seção do achado na auditoria.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 17 da auditoria.

## Registro
Commit 03f0511. Novo `resolveInsideReal` em `src/core/fs.ts` (`realpath` + comparação com a pasta do manual); usado em `/files/` (`src/server/routes/assets.ts`) e em `copyImages`/`copyLogo` da exportação. Teste: `test/symlink.test.ts`, com junction (roda no Windows sem permissão). Fora: `loadImages` ainda lê o cabeçalho da imagem antes da recusa (não vaza conteúdo).

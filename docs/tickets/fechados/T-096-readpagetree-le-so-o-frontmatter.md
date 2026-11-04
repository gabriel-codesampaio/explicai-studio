# T-096: `readPageTree` lê só o frontmatter

- Prioridade: P3
- Tamanho: P
- Status: descartado
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 13 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
300 páginas de 20 KB = 6 MB lidos e interpretados (YAML) para cada ação, com `Promise.all` abrindo 300 arquivos de uma vez.

## Critérios de aceite
- [x] ler só os primeiros 2 KB (o frontmatter) em `readPageTree`; manter `readPageFile` completo para abrir a página. Não mexer no formato em disco (mudar o formato para guardar o título em `manual.json` seria risco alto e não é necessário).
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
`src/core/pages.ts:54-76` (`readPageTree` chama `readPageFile`, que usa `readText` completo); `GET /api/manuals/:slug` roda após cada ação (`refreshManual` em `useStudio.ts:66-70`: criar, mover, status, restaurar, tema, logo).

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 13 da auditoria.

## Registro
Descartado sem implementar. Medido: `readPageTree` com 300 páginas de ~20 KB, disco quente, mediana de 52 ms (46 a 67 ms em 10 rodadas), abaixo dos 200 ms do cenário do ticket. Ler só 2 KB ainda exigiria plano B quando o frontmatter passa disso. Reabrir se uma árvore grande em disco lento passar de 200 ms.

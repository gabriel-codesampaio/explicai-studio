# T-096: `readPageTree` lê só o frontmatter

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 13 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
300 páginas de 20 KB = 6 MB lidos e interpretados (YAML) para cada ação, com `Promise.all` abrindo 300 arquivos de uma vez.

## Critérios de aceite
- [ ] ler só os primeiros 2 KB (o frontmatter) em `readPageTree`; manter `readPageFile` completo para abrir a página. Não mexer no formato em disco (mudar o formato para guardar o título em `manual.json` seria risco alto e não é necessário).
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
`src/core/pages.ts:54-76` (`readPageTree` chama `readPageFile`, que usa `readText` completo); `GET /api/manuals/:slug` roda após cada ação (`refreshManual` em `useStudio.ts:66-70`: criar, mover, status, restaurar, tema, logo).

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 13 da auditoria.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# Passagem (03/11/2026)

Histórico anterior: `docs/passagem-2026-10-30.md` (juntar neste arquivo no próximo lote).

## Lote de bugs 1 (03/11/2026, na main local, sem push)
- Feitos: T-107 (foco/seletor de tema, Idioma alinhado), T-088 (flush + carência de 60 s + aborta se a fila não gravou), T-092 (JSON de marcação quebrado vira aviso). Check 445 testes; e2e completo 130/131 (a falha, "barra da seleção" studio.e2e.ts:187, é o flaky conhecido: 3/3 na repetição). code-reviewer e seguranca: sem bloqueio.
- Classificação: bugs em `docs/tickets/README.md` (seção "Lote de bugs"); sugestões ficam em espera.
- Próximo lote (nesta ordem): T-093, T-094, T-098 (P2/P3 de dado), depois T-099, T-100, T-101, T-102, T-103, e as telas P3 (T-024, T-076, T-077, T-078, T-081), T-080.
- Cuidado: T-099 e T-064/T-097 cruzam com `docs/discovery/marcacao-de-imagem.md`: só corrigir o bug.
- Em aberto da revisão: `stat` sequencial em `findUnusedAssets` (assets.ts) sem tratar ENOENT; `parseAnnotations` com JSON válido de forma errada ainda derruba o export; foco do Aparência sem fallback se nenhum botão marcado. Viram ticket só se a pessoa quiser.
- Worktrees do lote removidos; branches fix/t-107, fix/t-088, fix/t-092 locais.

## Estado
- Na main (enviada): lotes 6 e 7, T-083, T-084, T-082+T-089 (CSP em /files/, Origin, 415), T-085 (fila por pasta em `updateManual`), T-086 (ETag/304, streaming, cache de imagens, lazy) e T-087 (autosave um PUT por vez).
- Verificação final na main: `npm run check` 433 testes; e2e completo 131/131 (E2E_PORT=4490); `studio.imagem.e2e.ts` x8 com 4 workers = 312/312, sem flake. Revisão de código dos três tickets: sem bloqueio. seguranca: sem achado.
- Flake de imagem visto no T-086 (copiar/colar, Backspace/desfazer): não reproduz na main; sem sinal de regressão do T-086, segue como o T-074 antigo (carga em paralelo). Reabrir T-074 só se voltar.
- Tickets: índice em `docs/tickets/README.md`. Abertos: T-076 a T-081, T-088 a T-107 (auditoria ponytail em `docs/discovery/2026-11-02-auditoria-ponytail.md`, já está na origin).

## Worktrees
- Removidas: t-082, t-085, t-086.
- `<tmp>/equipe/t-087` ficou: tinha mudança sem commit em `web/test/useAutosave.test.ts` (hoje o status aparece limpo; conferir antes de remover). Outras ativas de outra sessão: landing, t-088, t-092, t-107.
- Remover worktree: `cmd //c rmdir` na junção `node_modules` antes de `git worktree remove`.

## Próximo lote
1. Triagem da fila: P1/P2 de dados e segurança antes da landing; hipóteses de desempenho da auditoria viram 1 ticket de medição; P3 de manutenção vão para backlog.
2. Migrar o índice: fechados em `docs/tickets/fechados/README.md`.
3. Juntar `docs/passagem-2026-10-30.md` aqui e apagar o antigo.
4. T-037 e T-038 parados. Landing só depois.

## Achados da revisão (sem ticket ainda)
- `src/server/routes/assets.ts:55`: cache de 1h sem revalidação; `cleanUnusedAssets` pode liberar o nome e o navegador mostra a imagem antiga. Trocar por `no-cache` (ETag já barra o download).
- `src/core/manuals.ts:61`: fila só no processo; MCP e Studio em processos separados ainda correm. Anotar `shortcut:`.
- Faltam testes: `/files/` apontando para diretório (404), `If-None-Match` com lista, falha de leitura depois do `writeHead`.
- Chunk JS do build passa de 1 MB.
- Não mexer: `docs/discovery/landing-page.md`, `marcacao-de-imagem.md`, `mcp.md` (sem commit, outra sessão).

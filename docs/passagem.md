# Passagem (03/11/2026)

Histórico das sessões anteriores: `docs/passagem-2026-10-30.md` (a unificar num arquivo só, ver Próximo passo).

## Estado
- Na origin/main (141ad99): lotes 6 e 7 e T-083 (código no texto aceita negrito e link) e T-084 (ícones de linha e coluna). Check 423 testes, e2e completo 131/131. Contraste do ícone de linha no escuro: o valor medido (88,95,121) é o grafite do tema CLARO (#575e78) pego no meio da troca de tema; o escuro usa #9ca3bd sobre #0e1120 (cerca de 7,5:1, coberto por `web/test/tokensContrast.test.ts`). Sem correção.
- Tickets: índice em `docs/tickets/README.md`. Abertos novos: T-076 a T-081, T-087 a T-106 (auditoria ponytail, `docs/discovery/2026-11-02-auditoria-ponytail.md`, não mexer até a pessoa decidir se fica no repo público).

## Trabalho feito por engano ANTES da mudança de plano (nada enviado)
O pedido de parar chegou depois destes passos. Estão em branches locais, sem push, sem suíte e2e completa e sem revisão de código:
- `fix/t-082-t-089-seguranca-do-servidor` (0b27143, 69831a9): CSP em /files/ para o que não é imagem raster; Origin só igual a `http://${host}`; 415 sem application/json. check 427 testes, e2e imagem/logo/exportação 52 ok. MESCLADA na main LOCAL (a main local está à frente da origin); o `git reset --hard` para desfazer foi negado, então NÃO dê push na main sem decidir: ou aceita (rodar e2e completo, revisão, seguranca) ou `git revert -m 1` do merge.
- `fix/t-085-fila-por-pasta` (ca2f2b0, 51fa224): fila por pasta em `updateManual`; 10 `addPage` em paralelo deixam 10 nós. check 430.
- `perf/t-086-imagens-cache-e-lazy` (7d7dfe7, faa488c, 00a830f): ETag/304, streaming, cache de imagens de assets/, `loading="lazy"`. check 429. e2e "imagem" teve flakes (copiar/colar na rodada 1, Backspace/desfazer na 2; passou na 3); não rodado na main para provar que são antigos.
- Worktrees (com junção de `node_modules`; remover com `cmd //c rmdir` do Windows antes de `git worktree remove`): `<tmp>/equipe/t-082`, `t-085`, `t-086`.

## Próximo passo
1. Decidir o destino dos 3 itens acima.
2. Triagem da fila: P1/P2 de dados e segurança antes da landing; hipóteses de desempenho da auditoria viram 1 ticket de medição; P3 de manutenção vão para backlog.
3. Migrar o índice: fechados em `docs/tickets/fechados/README.md`; passagem num arquivo só.
4. T-037 e T-038 parados. Landing page só depois.

## Achados
- Flaky do e2e (T-074 reabrir com diagnosticar): copiar/colar imagem; seleção no `studio.texto.e2e.ts` (1 em 5 rodadas); Backspace/desfazer da imagem.
- Chunk JS do build passa de 1 MB.

# Passagem

Estado do trabalho para a próxima sessão. Só o que importa agora; o histórico fica no git.

## Agora (2026-11-04)
- MCP: fases 1 a 3 mergeadas e prova real feita no CodeLab (T-125). Falta publicar `explicai` 0.3.0 e depois `explicai-mcp` no npm, com o ok da pessoa e passando antes pelo agente `seguranca`.
- Fila: [tickets/README.md](tickets/README.md).

## Cuidados
- `node_modules` do `explicai-mcp` aponta para uma worktree local do Studio: antes de removê-la, refaça o link.
- Worktree com junção de `node_modules`: apague a junção pelo PowerShell com `(Get-Item <wt>\node_modules -Force).Delete()`, confira que sumiu e só então rode `git worktree remove`, sem `--force`.
- Teste instável conhecido: `e2e/studio.reduzir.e2e.ts:78` (T-129). Rode de novo só o job que falhou.

# Passagem

Estado do trabalho para a próxima sessão. Só o que importa agora; o histórico fica no git.

## Agora (2026-11-05)
- `explicai` 1.0.0 publicado. Fila do Studio: só o [T-426](tickets/T-426-tirar-tolerancia-dos-e2e.md). A próxima versão só sai com a fila vazia ([release.md](release.md)).
- MCP pausado: os tickets T-150, T-178, T-197, T-202, T-220 e T-402 esperam. Retomar só quando a pessoa pedir.
- Fila: [tickets/README.md](tickets/README.md). Mapa do código: [arquitetura/README.md](arquitetura/README.md).

## Cuidados
- Worktree com junção de `node_modules`: remova só com `remover-worktree.ps1` (pasta Manual). Nunca rode `npm ci` ou `npm install` dentro dela.
- `node_modules` do `explicai-mcp` pode apontar para uma worktree local do Studio: antes de removê-la, refaça o link.

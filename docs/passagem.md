# Passagem: fila P1, lote 2 (2026-10-30)

Uma branch por ticket, todas no GitHub, nenhuma na main:
- `feature/t-004-numeracao-na-arvore` (sai de `feat/p1-cara-de-ia`)
- `feature/t-005-manual-como-cabecalho` (sai de `feat/p1-cara-de-ia`)
- `feature/t-006-exportar-no-topo` (sai da do T-005 e já a contém; tem os tickets fechados e esta passagem)

Ordem de merge sugerida: `feat/p1-cara-de-ia` → T-005 → T-006 → T-004. O T-004 não conflita com os outros (a integração local `integra/lote-p1-2` juntou tudo com 99 testes verdes).

## Feito
- T-003, T-004, T-005 e T-006 fechados (ver Registro em `docs/tickets/fechados/`). Design e revisão de código do lote passaram; as correções de ambos entraram.
- T-007 segue `em andamento`.

## Falta
- T-007: ver a exportação com a coluna `w-14` e o PinnedNotice sem ícone (claro, 1440). Depois, fechar.
- Escuro a 1440 das telas do lote 2 não foi visto.
- Discovery de customização do manual: `docs/discovery/` na branch `docs/discovery`. Aguardam decisões da pessoa (5 de logo/cor, 4 de cor na seleção).

## Próximo lote
T-008 (menu "/" com prévia, M) e T-010 (colar print com Ctrl+V na barra, M). Se a pessoa decidir o discovery, o bloco de aviso pode entrar junto do T-008 (mesmo menu "/").

## Achados
- `VersionsPanel.tsx` ainda tem ícones decorativos (ArrowLeft, RotateCcw, Eye, BookCheck); o seletor de tema tem sol/lua/monitor.
- Em 375 px os botões da árvore têm alvo de 32 px.
- A seleção de texto do Studio é amarela (`--marca-faixa`), contra a regra do amarelo (T-011).
- Chunk JS do build passa de 1 MB.
- O Chrome do MCP não encolhe abaixo de 500 px: para 375 use `emulate`.

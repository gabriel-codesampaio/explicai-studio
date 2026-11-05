# T-552: removePage move os arquivos antes de tirar o nó da árvore

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: supervisor
- Origem: audit ponytail 2026-11-05

## Problema
`removePage` (src/core/trash.ts) tira o nó da árvore antes de mover os arquivos. rename com EBUSY (Windows) deixa a página fora da árvore e sem entry.json: sem desfazer.

## Critérios de aceite
- [ ] Ordem: ler posição, mover arquivos, gravar entry.json, só então updateManual.
- [ ] Falha no rename deixa a página na árvore e os arquivos no lugar.
- [ ] Teste simulando falha no rename.

## Registro
- Fechado na branch fix/ponytail-core. removePage move arquivos e grava entry.json antes de tirar o nó; falha desfaz os movidos. Teste test/trash-fail.test.ts (EBUSY simulado).

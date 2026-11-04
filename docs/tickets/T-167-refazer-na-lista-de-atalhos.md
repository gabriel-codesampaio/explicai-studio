# T-167: Listar o Refazer na lista de atalhos

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A18 (avaliado no commit 60a0e3d)

## Problema
Achado A18. Refazer funciona com Ctrl+Shift+Z, mas a lista de atalhos só traz Ctrl+Z para desfazer e não mostra o refazer.

## Critérios de aceite
- [ ] A lista de atalhos mostra Refazer com os atalhos que funcionam de fato (Ctrl+Shift+Z e, se existir, Ctrl+Y).
- [ ] Nenhum atalho listado deixa de funcionar.

## Onde
- web/src/features/help/ShortcutsDialog.tsx

## Como verificar
Abrir a lista de atalhos e comparar cada linha com a tecla real no editor. Teste de componente com a lista.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

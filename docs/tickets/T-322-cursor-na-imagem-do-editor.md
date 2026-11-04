# T-322: Mostrar cursor de clique ao passar o mouse na imagem do editor

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa, 2026-11-04

## Problema
A imagem do editor abre o painel ao clicar, mas o cursor não muda ao passar o mouse: nada mostra que é clicável.

## Critérios de aceite
- [ ] `cursor: pointer` ao passar o mouse na imagem do editor, sem marcar também a legenda ou a área em volta.
- [ ] O editor somente leitura e o HTML exportado não ganham o cursor, salvo em área clicável.

## Onde
- web/src/styles/editor-content.css, web/src/features/editor/ImagePopover.tsx

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

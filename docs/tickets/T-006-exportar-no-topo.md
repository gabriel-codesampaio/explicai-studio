# T-006: Levar "Exportar manual" para o topo da página como botão principal

- Prioridade: P1
- Status: aberto
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Exportar é a entrega do produto, mas é um botão com contorno perdido na barra lateral. A barra lateral também tem sete pontos de decisão antes da árvore.

## Critérios de aceite
- [ ] "Exportar manual" é o único botão sólido na cor de destaque, no topo da área da página.
- [ ] A barra lateral fica com: manual, busca, árvore e um menu "⋯" no rodapé com Lixeira, Aparência e Atalhos.
- [ ] Funciona em 960 px e no celular.

## Onde
`web/src/layout/PageView.tsx`, `web/src/layout/Sidebar.tsx`, `features/export/ExportDialog.tsx`.

## Como verificar
Teste de ponta a ponta de exportação a partir do topo; prints em 375, 960 e 1440 px.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

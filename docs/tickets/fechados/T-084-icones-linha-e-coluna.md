# T-084: Ícones de adicionar linha e coluna da tabela

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: design
- Origem: pedido da pessoa em 2026-11-02

## Problema
Os ícones TableRowsSplit/TableColumnsSplit (Toolbar.tsx:84-85) não comunicam 'inserir depois'.

## Critérios de aceite
- [x] Trocar por BetweenHorizontalEnd (linha) e BetweenVerticalEnd (coluna) do lucide-react; TableToolbarMenu com ícones coerentes.

## Onde
web/src/features/editor/Toolbar.tsx, TableToolbarMenu

## Como verificar
Conferir visual em claro e escuro e o nome acessível.

## Registro
Commit 5f34c1c. Toolbar.tsx:84-85 usa BetweenHorizontalEnd (linha) e BetweenVerticalEnd (coluna); nomes acessíveis iguais. Medido no navegador: 16px, visíveis em claro e escuro; e2e da tabela passou (4/4). TableToolbarMenu usa Settings2 e as alças usam Grip/Plus, sem ícone de linha/coluna para alinhar: nada mudou ali.

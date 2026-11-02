# T-084: Ícones de adicionar linha e coluna da tabela

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: pedido da pessoa em 2026-11-02

## Problema
Os ícones TableRowsSplit/TableColumnsSplit (Toolbar.tsx:84-85) não comunicam 'inserir depois'.

## Critérios de aceite
- [ ] Trocar por BetweenHorizontalEnd (linha) e BetweenVerticalEnd (coluna) do lucide-react; TableToolbarMenu com ícones coerentes.

## Onde
web/src/features/editor/Toolbar.tsx, TableToolbarMenu

## Como verificar
Conferir visual em claro e escuro e o nome acessível.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

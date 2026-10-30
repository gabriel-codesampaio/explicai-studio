# T-005: Mostrar o nome do manual como cabeçalho, sem caixa

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
A barra lateral empilha três caixas iguais (escolher manual, Exportar manual, Buscar página), com borda, ícone e mesmo raio. É o layout padrão do shadcn.

## Critérios de aceite
- [ ] O nome do manual aparece como título tipográfico (Archivo), com um rótulo mono "MANUAL" acima; trocar de manual continua possível pelo mesmo elemento (seta aparece no foco e no hover).
- [ ] "Buscar página" vira uma linha leve com o atalho Ctrl+P, sem caixa.
- [ ] Teclado e leitor de tela continuam funcionando como hoje.

## Onde
`web/src/features/manuals/ManualSwitcher.tsx`, `web/src/layout/Sidebar.tsx`.

## Como verificar
Prints antes e depois; teste de ponta a ponta de troca de manual e de busca.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

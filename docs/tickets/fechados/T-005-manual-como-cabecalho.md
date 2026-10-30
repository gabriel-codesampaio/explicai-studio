# T-005: Mostrar o nome do manual como cabeçalho, sem caixa

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
A barra lateral empilha três caixas iguais (escolher manual, Exportar manual, Buscar página), com borda, ícone e mesmo raio. É o layout padrão do shadcn.

## Critérios de aceite
- [x] O nome do manual aparece como título tipográfico (Archivo), com um rótulo mono "MANUAL" acima; trocar de manual continua possível pelo mesmo elemento (seta aparece no foco e no hover).
- [x] "Buscar página" vira uma linha leve com o atalho Ctrl+P, sem caixa.
- [x] Teclado e leitor de tela continuam funcionando como hoje.

## Onde
`web/src/features/manuals/ManualSwitcher.tsx`, `web/src/layout/Sidebar.tsx`.

## Como verificar
Prints antes e depois; teste de ponta a ponta de troca de manual e de busca.

## Registro
Commits: d5f92a0 (style(sidebar): mostra o manual como cabeçalho, sem caixa), f20f2a9 (seta do seletor visível em tela de toque, achado da revisão).

O que foi feito: o gatilho do ManualSwitcher virou rótulo `rotulo` "Manual" + título em Archivo, sem borda nem fundo; a seta aparece no hover, no foco, com o menu aberto e sempre em tela sem hover. "Buscar página" virou linha leve com Ctrl+P em `kbd` mono.

Verificação: e2e troca de manual pelo cabeçalho (foco + Enter) e abre a busca pela linha, fecha com Esc; `npm run check` verde, e2e 14 verdes. Design aprovou no claro a 1440. Revisão sem achados que bloqueiem.

Ficou de fora: o nome acessível do seletor virou "Manual <título>" (repete se o título tiver "Manual").

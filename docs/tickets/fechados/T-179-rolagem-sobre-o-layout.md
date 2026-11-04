# T-179: Tirar a barra de rolagem de cima do layout

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: design
- Origem: pedido da pessoa, 2026-11-04 (lote 1.0)

## Problema
A barra de rolagem da sidebar cobre o conteúdo e encosta na borda do painel ao lado (print: rodapé "Ajustes" com a barra por cima). Revisar o layout de todas as áreas que rolam.

## Critérios de aceite
- [ ] Nenhuma barra de rolagem cobre texto, botão ou borda de outro painel (sidebar, página, sumário, diálogos).
- [ ] Espaço da barra reservado (`scrollbar-gutter: stable`) onde o conteúdo pularia ao aparecer a barra.
- [ ] Barra discreta, com a cor da marca, em claro e escuro.

## Onde
- web/src/layout/Sidebar.tsx:42 (`overflow-y-auto`), web/src/layout/PageView.tsx:116, diálogos com rolagem

## Como verificar
Manual com 30+ páginas, 1280 e 375, claro e escuro: print da sidebar rolada e do diálogo de exportação.

## Registro
Commit `2d9f6e0`. `base.css`: barra fina na cor da marca; `aside, main { scrollbar-gutter: stable }`. Medido 1280 claro/escuro e 375: sem estouro. Diálogos sem gutter de propósito (ficam assimétricos). Barra não aparece no Chrome headless: conferir a olho.

# T-041: Cor do texto com nome visível e pelo teclado

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: pendências do [T-039](fechados/T-039-barra-na-selecao.md).

## Problema
1. As cores da barra flutuante só mostram o nome no `title` nativo, e o botão "A" não tem dica.
2. A cor só existe na barra flutuante: quem usa só o teclado não consegue pintar.
3. O tema claro com cor aplicada e o HTML/PDF exportado com cor só tiveram o contraste testado, não o resultado no navegador.

## Critérios de aceite
- [x] Componente `TextColorMenu` (menu com "A" colorido e o nome de cada cor, mais "Cor padrão") usado na barra fixa e na flutuante; sai a linha inline de cores e o reposicionamento da barra.
- [x] O botão tem dica (Tooltip) e a lista mostra o nome de cada cor, em português e inglês.
- [x] Alcançável por Tab, setas, Enter e Esc (e2e só com teclado na barra fixa).
- [x] Tema claro conferido no navegador, com cores aplicadas.
- [x] HTML exportado com cor conferido (cor computada) e PDF, se o export gerar.

## Onde
`web/src/features/editor/` (TextColorMenu, SelectionMenu, Toolbar), `web/src/lib/i18n.en.ts`, `e2e/studio.e2e.ts`.

## Como verificar
Teste de unidade dos nomes, e2e da barra fixa pelo teclado, conferência no Chrome nos dois temas e no export.

## Registro
Commits f7a41d8 (E2E_PORT) e 74cb1e9. `TextColorMenu` (DropdownMenu + Tooltip) nas duas barras; sai a linha de cores e o reposicionamento. E2E novo só com teclado na barra fixa. Conferido no Chrome: tema claro (cores computadas iguais aos tokens, menu em inglês), HTML exportado (rgb de cada cor igual à paleta) e PDF (cores no conteúdo e vistas no visualizador). Nada a corrigir no export.

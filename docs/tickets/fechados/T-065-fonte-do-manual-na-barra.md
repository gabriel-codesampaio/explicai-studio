# T-065: Escolher a fonte do manual pela barra de ferramentas

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-30

## Problema
Hoje a fonte do manual só se muda no diálogo Exportar. A pessoa quer escolher na barra do editor, e o editor mostrar o texto nessa fonte.

## Critérios de aceite
- [x] A fonte vale para o MANUAL INTEIRO (não por trecho nem por página). Usa `theme.fonts` (text e headings) do T-030; formato em disco não muda.
- [x] Seletor compacto na barra, perto do seletor de bloco, com o nome da fonte atual; abre a lista com prévia (FontPicker/useFontPreview). Grava em manual.json pela mesma rota do Exportar; o diálogo mostra a mesma coisa.
- [x] O editor mostra o texto na fonte escolhida; o resto do Studio fica na fonte da marca. Fonte sem itálico não serve para o texto (regra `fontOf`).
- [x] Nome acessível "Fonte do manual: {fonte}", teclado e dica. pt e en. Claro e escuro, 375 px (a barra rola, T-025).
- [x] e2e: trocar pela barra, conferir editor e diálogo, recarregar.

## Onde
`web/src/features/editor/Toolbar.tsx`, `web/src/features/export/FontPicker.tsx`, `src/core/export/fonts.ts`.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
Commits aed3cbf e bb4acc8. Seletor "Fonte" (FontMenu) na barra, depois do botão Imagem: menu com prévia, só fontes com itálico, grava `theme.fonts.text` por `setManualTheme` (mesma rota do Exportar; o diálogo reflete). O editor aplica `theme.fonts` (texto e títulos) só no conteúdo (`manualFontStyle`). Lista de fontes carregada uma vez (`useFontPreview` com cache). Testes: `web/test/manualFont.test.ts` e e2e "fonte do manual pela barra".
Ficou de fora: a barra escolhe só a fonte do texto; a dos títulos continua no diálogo Exportar, mas o editor já mostra os títulos nela. 375 px conferido pelo e2e (a janela do DevTools não passa de 500 px).

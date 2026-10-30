# T-011: Dar ao amarelo um sentido só (conteúdo e página ativa)

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O mesmo bloco amarelo com faixa lateral é usado para Resultado do passo, aviso de versão fixada e sucesso da exportação. O detector acusou a faixa lateral (`side-tab`) em `ExportDialog.tsx:142` e `PinnedNotice.tsx:10`.

## Critérios de aceite
- [x] "Resultado:" vira marca-texto na linha (rótulo pequeno + texto com fundo de marca-texto), sem caixa; o Markdown salvo não muda.
- [x] O aviso de versão fixada vira uma linha discreta sob o caminho da página, com a ação "Usar o texto atual".
- [x] O sucesso da exportação vira texto simples na cor de destaque.
- [x] Detector do impeccable sem `side-tab` no código.

## Onde
`web/src/styles/editor-content.css`, `src/core/export/html.ts` (mesmo estilo no export), `features/versions/PinnedNotice.tsx`, `features/export/ExportDialog.tsx`.

## Como verificar
`impeccable detect` limpo; `web/test/markdown.test.ts` sem mudança; prints nos dois temas.

## Registro
Commit dd8b1b9. Seleção em cobalto translúcido (token `--selecao`), Resultado em marca-texto sem caixa no editor e no export, aviso de versão fixada em linha, sucesso do export em texto. Verificado: npm run check verde e estilos medidos no Chrome (borda 0, p inline com marca-texto, seleção rgba(43,79,224,.2)). Fora: detector do impeccable (não instalado), print no tema escuro, usos restantes do amarelo (status Em revisão, selo de versão fixada, destaque das imagens, que seguem como conteúdo ou estado).

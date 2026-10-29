# T-011: Dar ao amarelo um sentido só (conteúdo e página ativa)

- Prioridade: P2
- Status: aberto
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O mesmo bloco amarelo com faixa lateral é usado para Resultado do passo, aviso de versão fixada e sucesso da exportação. O detector acusou a faixa lateral (`side-tab`) em `ExportDialog.tsx:142` e `PinnedNotice.tsx:10`.

## Critérios de aceite
- [ ] "Resultado:" vira marca-texto na linha (rótulo pequeno + texto com fundo de marca-texto), sem caixa; o Markdown salvo não muda.
- [ ] O aviso de versão fixada vira uma linha discreta sob o caminho da página, com a ação "Usar o texto atual".
- [ ] O sucesso da exportação vira texto simples na cor de destaque.
- [ ] Detector do impeccable sem `side-tab` no código.

## Onde
`web/src/styles/editor-content.css`, `src/core/export/html.ts` (mesmo estilo no export), `features/versions/PinnedNotice.tsx`, `features/export/ExportDialog.tsx`.

## Como verificar
`impeccable detect` limpo; `web/test/markdown.test.ts` sem mudança; prints nos dois temas.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

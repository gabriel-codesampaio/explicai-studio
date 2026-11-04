# T-032: Logo do cliente na capa do manual exportado

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: [Discovery de customização](../../discovery/archives/2026-10-30-customizacao-marca.md) (2026-10-30)

## Problema
Quem entrega o manual a um cliente quer a marca dele na capa. Hoje a capa do HTML e do PDF só tem o título.

## Critérios de aceite
- [x] `theme.logo` guarda o caminho do logo em `assets/`; PNG, JPG ou SVG até 1 MB.
- [x] O logo aparece na capa e no topo do sumário do HTML e do PDF, e abre offline.
- [x] SVG entra só por `<img>`, sem script rodando; arquivo fora do limite é recusado com o motivo.
- [x] Logo grande não estoura a capa do PDF.
- [x] Remover o logo não apaga as cores e fontes do `theme`, e o contrário também.
- [x] Upload e remoção no ExportDialog, textos em pt e en. `docs/manual-format.md` atualizado.

## Onde
`src/core/types.ts`, `src/core/export/theme.ts`, `src/core/export/html.ts` (capa), `src/core/assets.ts`, `web/src/features/export/ExportDialog.tsx`, `docs/manual-format.md`.

## Como verificar
Testes em `test/` (validação, cópia para o export, SVG); exportar com logo PNG e SVG e abrir HTML e PDF offline.

## Registro
Commits 6798aef..77723fd. `theme.logo` (`assets/<arquivo>`) validado em `src/core/export/logo.ts`: sem pasta, `..` ou barra invertida; só PNG, JPG, SVG; até 1 MB; arquivo precisa existir. `setManualLogo` grava em assets/ e põe no tema; recusa com código (`logo-type`, `logo-size`) e motivo, traduzido no Studio. Rota `POST /api/manuals/:slug/logo`; tirar o logo usa `PUT /theme` com `logo: null`. O HTML copia o logo e o põe por `<img alt="">` na capa e no topo do sumário (SVG nunca inline, sem script); teto de 96 px na capa e 48 px no sumário. Logo sumido: aviso e export sem ele. Tema: mudar logo não mexe em cores e fontes e vice-versa. UI: `LogoField.tsx`, fora do bloco "Cores do manual". Testes: `test/logo.test.ts` (17), server.test, apiErrors, e2e do export; `npm run check` 394 verdes. Fica de fora: o PDF só é coberto pelo teste com navegador de mentira, então o teto do logo no PDF real não foi medido no Chrome; o arquivo do logo continua em assets/ depois de tirar (a limpeza de imagens sem uso o move para a lixeira).

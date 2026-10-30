# T-030: Deixar a pessoa escolher as fontes do manual exportado

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: [Discovery de customização](../../discovery/archives/2026-10-30-customizacao-marca.md) (2026-10-30)

## Problema
O manual exportado sempre usa Atkinson Hyperlegible Next no texto e Archivo nos títulos. Quem entrega o manual a um cliente quer a tipografia do cliente.

## Critérios de aceite
- [x] `theme` aceita `fonts.text` e `fonts.headings`, cada uma escolhida de um leque de fontes empacotadas (OFL, `@fontsource` ou `@fontsource-variable`, como as atuais).
- [x] O leque tem fontes sem serifa, serifadas e de título; a lista final entra na spec.
- [x] O export copia só as fontes escolhidas e abre offline, no HTML e no PDF.
- [x] Nome de fonte fora da lista é recusado no core.
- [x] Sem escolha, o manual sai como hoje (Atkinson e Archivo).
- [x] ExportDialog com os dois seletores e a prévia de cada fonte no próprio nome; textos em pt e en.
- [x] Licenças das fontes novas conferidas (nada fora de OFL ou equivalente). `docs/manual-format.md` atualizado.

## Onde
`src/core/types.ts`, `src/core/export/index.ts` (`copyFonts`), `src/core/export/html.ts` (`@font-face`, `--texto`, `--display`), `web/src/features/export/ExportDialog.tsx`, `package.json`, `docs/manual-format.md`.

## Como verificar
Teste em `test/` para a validação e a cópia só das fontes escolhidas; exportar com outra fonte, desligar a rede e abrir HTML e PDF.

## Riscos
Cada fonte aumenta o pacote npm (~30–100 KB por família latina). Medir o tamanho antes de fechar a lista.

## Registro
Commit 4d091d1. Oito fontes OFL: Atkinson Hyperlegible Next (padrão do texto), Inter, Source Sans 3, Source Serif 4, Lora, Archivo (padrão dos títulos), Montserrat e Playfair Display; lista na spec e no manual-format.md. Pacote npm de 862 kB para 1,3 MB (descompactado 1,8 para 2,3 MB; +~0,5 MB de woff2 latin). `theme.fonts.text`/`headings`, recusa de nome fora da lista (texto só com itálico), export copia só as escolhidas e a de código. Seletores com prévia no próprio nome via GET /api/fonts. `npm run fonts:sync` regenera fonts/. Verificado: npm run check verde; HTML exportado com Lora e Playfair aberto no Chrome sem rede, fontes carregadas. Fora: PDF impresso com as fontes novas não conferido; só subconjunto latin; fonte livre (upload) segue fora; após clonar, rodar npm install para trazer os @fontsource novos.

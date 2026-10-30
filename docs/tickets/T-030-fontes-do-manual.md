# T-030: Deixar a pessoa escolher as fontes do manual exportado

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [Discovery de customização](../discovery/2026-10-30-customizacao-marca.md) (2026-10-30)

## Problema
O manual exportado sempre usa Atkinson Hyperlegible Next no texto e Archivo nos títulos. Quem entrega o manual a um cliente quer a tipografia do cliente.

## Critérios de aceite
- [ ] `theme` aceita `fonts.text` e `fonts.headings`, cada uma escolhida de um leque de fontes empacotadas (OFL, `@fontsource` ou `@fontsource-variable`, como as atuais).
- [ ] O leque tem fontes sem serifa, serifadas e de título; a lista final entra na spec.
- [ ] O export copia só as fontes escolhidas e abre offline, no HTML e no PDF.
- [ ] Nome de fonte fora da lista é recusado no core.
- [ ] Sem escolha, o manual sai como hoje (Atkinson e Archivo).
- [ ] ExportDialog com os dois seletores e a prévia de cada fonte no próprio nome; textos em pt e en.
- [ ] Licenças das fontes novas conferidas (nada fora de OFL ou equivalente). `docs/manual-format.md` atualizado.

## Onde
`src/core/types.ts`, `src/core/export/index.ts` (`copyFonts`), `src/core/export/html.ts` (`@font-face`, `--texto`, `--display`), `web/src/features/export/ExportDialog.tsx`, `package.json`, `docs/manual-format.md`.

## Como verificar
Teste em `test/` para a validação e a cópia só das fontes escolhidas; exportar com outra fonte, desligar a rede e abrir HTML e PDF.

## Riscos
Cada fonte aumenta o pacote npm (~30–100 KB por família latina). Medir o tamanho antes de fechar a lista.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

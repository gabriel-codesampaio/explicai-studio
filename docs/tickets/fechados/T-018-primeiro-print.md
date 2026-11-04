# T-018: Página vazia que ensina o primeiro passo e onde exportar

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Os estados vazios são neutros ("Sem título", "Nenhuma página ainda"). Não há a voz do professor em lugar nenhum, e o momento-chave da marca (colar o primeiro print) não é ensinado.

## Critérios de aceite
- [x] Página vazia sugere o caminho: colar um print (Ctrl+V) e numerar o que a pessoa precisa clicar.
- [x] Texto no tom da marca, sem humor, em pt-BR e en.
- [x] Desaparece assim que a página tem conteúdo.
- [x] Uma linha aponta onde exportar e leva ao botão (ampliado pelo [discovery de tutorial](../discovery/2026-10-30-tutorial-guiado.md), 2026-10-30).
- [x] O mesmo texto aparece na ajuda. Usável só com teclado; nenhuma dependência nova.
- [x] Público: quem monta o manual no Studio, não quem lê o manual exportado.

## Onde
`features/editor/extensions.ts` (placeholder), `components/EmptyState.tsx`, `lib/i18n.en.ts`.

## Como verificar
Prints; teste de i18n.

## Registro
FirstStepHint na página sem texto (3 passos + botão que abre o Exportar), some ao digitar; mesmo texto na ajuda (firstStep.ts); pt/en; e2e studio.lote6. Visto a 1280, tema claro. Sem /impeccable audit. Commit f7cf737.

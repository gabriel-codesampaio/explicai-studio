# T-095: Serializar o Markdown só no flush do autosave

- Prioridade: P3
- Tamanho: M
- Status: descartado
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 12 (`docs/discovery/archives/2026-11-02-auditoria-ponytail.md`)

## Problema
o custo cresce com o tamanho da página, e o resultado só é usado 600 ms depois da última tecla.

## Critérios de aceite
- [x] `useAutosave` aceitar uma função (`() => string`) em vez do texto pronto, e serializar só no `flush`. O estado da fila fica igual.
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
`web/src/features/editor/Editor.tsx:81` (`onUpdate` chama `ed.getMarkdown()` e `toDiskMarkdown`, duas regex sobre o texto todo, a cada transação).

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 12 da auditoria.

## Registro
Descartado sem implementar. Medido em happy-dom, página de 300 blocos (104 KB de Markdown): `getMarkdown()` 13,7 ms por transação, `toDiskMarkdown` 0,09 ms. Páginas reais (5 a 20 KB) ficam em 1 a 3 ms por tecla, abaixo de um quadro. Trocar por serialização no `flush` muda a API do `useAutosave` e arrisca perder texto se o editor já foi desmontado ao trocar de página. Reabrir se aparecer relato de digitação lenta em página longa.

# T-095: Serializar o Markdown só no flush do autosave

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 12 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
o custo cresce com o tamanho da página, e o resultado só é usado 600 ms depois da última tecla.

## Critérios de aceite
- [ ] `useAutosave` aceitar uma função (`() => string`) em vez do texto pronto, e serializar só no `flush`. O estado da fila fica igual.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
`web/src/features/editor/Editor.tsx:81` (`onUpdate` chama `ed.getMarkdown()` e `toDiskMarkdown`, duas regex sobre o texto todo, a cada transação).

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 12 da auditoria.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

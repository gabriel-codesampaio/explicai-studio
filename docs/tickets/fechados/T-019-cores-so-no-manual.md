# T-019: Tirar as cores extras do Studio e manter só no manual exportado

- Prioridade: P1
- Status: feito
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Esmeralda, ameixa e grafite não estão no brand book e diluem o cobalto. Decisão da pessoa (2026-10-29): o Studio fica sempre no cobalto; a cor continua escolhível só para o manual exportado.

## Critérios de aceite
- [x] Aparência mostra só tema e idioma; o Studio usa sempre o cobalto.
- [x] Quem já tinha escolhido outra cor volta ao cobalto sem erro.
- [x] A cor do manual exportado continua na exportação, com o nome de cada cor visível.

## Onde
`features/settings/AppearancePanel.tsx`, `lib/theme.ts`, `styles/tokens.css`, `web/index.html`, `features/export/ExportDialog.tsx`.

## Como verificar
Teste de ponta a ponta da Aparência; prints; teste de exportação com cor.

## Registro
Commits: b74bd03 (feat(ui): deixa o Studio sempre no cobalto), e35af86 (feat(export): escreve o nome de cada cor do manual) e o commit que fecha este ticket.

O que foi feito: `Appearance` guarda só o tema; saíram `data-accent` do `theme.ts`, do script do `index.html` e os seis seletores de `tokens.css`. Uma cor antiga gravada é ignorada na leitura e some do localStorage na próxima troca de tema. A lista de cores foi para o `ExportDialog.tsx`, o único lugar que a usa, e cada cor virou um botão com bolinha e nome em texto. O rodapé da Aparência diz onde a cor do manual ficou ("A cor do manual fica em Exportar manual").

Decisões tomadas sem a pessoa: lista de cores dentro do `ExportDialog.tsx` em vez de um módulo em `lib/` (um uso só); anel fino na bolinha, porque o grafite some no escuro (1,94:1); cópia invisível em negrito para os botões não andarem ao trocar a cor.

Verificação: testes de unidade em `web/test/theme.test.ts` (cor antiga gravada, no `theme.ts` e no script do `index.html`); e2e "Aparência mostra só Tema e Idioma..." e "exportação mostra o nome de cada cor do manual" (o HTML baixado sai com `--accent:#7a3fc4`). `npm run check` (94 testes) e `npm run test:e2e` (12 testes) verdes. Prints antes em `C:/Users/PC/explicai-prints/p1/antes/` e depois em `C:/Users/PC/explicai-prints/p1/T-019/` (aparencia e exportar, 375/960/1440, claro e escuro).

Ficou de fora: esmeralda, ameixa e grafite continuam fora da paleta no manual exportado (decisão da pessoa). Painel Aparência cortado em 375 px e opção marcada pouco visível no escuro (T-026); tokens do tema escuro diferentes do brand book (T-027).

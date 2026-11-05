# T-570: Achados explicados no diálogo Exportar

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: conversa 2026-11-05 (o número no botão "Exportar manual" não diz o que é)

## Problema
O botão "Exportar manual" mostra um número (achados do checkManual) sem dizer o que ele conta. Só o leitor de tela ouve a descrição.

## Critérios de aceite
- [x] O número tem texto claro ("2 achados na checagem do manual", pt/en): tooltip no botão e, em toque, a seção do diálogo.
- [x] O diálogo Exportar tem a seção "Checagem do manual": uma frase (problemas que podem deixar o manual incompleto; não impedem exportar), cada achado em linguagem simples, a página afetada com botão "Abrir página" e como resolver por tipo.
- [x] Sem achados: "Nenhum achado.".
- [x] Tipo `not-reviewed` (T-545) diz "Página sem conferência" e tem dica; tipo desconhecido não quebra a lista.

## Onde
`web/src/features/export/ExportDialog.tsx`, `ExportFindings.tsx`, `web/src/features/check/findingText.ts` (`kindFix`), `web/src/lib/i18n.en.ts`.

## Como verificar
`web/test/exportFindings.test.tsx`; e2e `studio.checar.e2e.ts`.

## Registro
Feito em `feat/export-achados`.
- 2026-11-05: O tipo `not-reviewed` saiu com a remoção da feature "conferida" (T-545).

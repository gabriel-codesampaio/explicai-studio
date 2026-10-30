# T-016: Um nome só para a versão do manual final

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
A mesma ideia aparece como "versão fixada" (topo da página), "No manual" (lista de versões) e "versão marcada 'No manual'" (exportação).

## Critérios de aceite
- [x] Um termo único em todo o Studio, em pt-BR e en, e no glossário do produto.
- [x] Docs (`docs/manual-format.md`) e textos de ajuda atualizados.

## Onde
`features/versions/*`, `features/export/ExportDialog.tsx`, `lib/i18n.en.ts`, `docs/`.

## Como verificar
Busca no código pelos termos antigos sem resultado; teste de i18n.

## Registro
Commit: 94ee9a3.

Feito: termo "Versão do manual" (en: "Manual version") no selo da página, na lista de versões, no diálogo de exportação, nos avisos, no i18n, nos comentários e em docs/manual-format.md. Busca pelos termos antigos sem resultado. Fora: os botões "Usar no manual" e "Tirar do manual" ficam, são verbos da mesma ideia.

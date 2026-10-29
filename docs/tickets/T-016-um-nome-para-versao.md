# T-016: Um nome só para a versão do manual final

- Prioridade: P2
- Status: aberto
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
A mesma ideia aparece como "versão fixada" (topo da página), "No manual" (lista de versões) e "versão marcada 'No manual'" (exportação).

## Critérios de aceite
- [ ] Um termo único em todo o Studio, em pt-BR e en, e no glossário do produto.
- [ ] Docs (`docs/manual-format.md`) e textos de ajuda atualizados.

## Onde
`features/versions/*`, `features/export/ExportDialog.tsx`, `lib/i18n.en.ts`, `docs/`.

## Como verificar
Busca no código pelos termos antigos sem resultado; teste de i18n.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

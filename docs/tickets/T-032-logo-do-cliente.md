# T-032: Logo do cliente na capa do manual exportado

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [Discovery de customização](../discovery/2026-10-30-customizacao-marca.md) (2026-10-30)

## Problema
Quem entrega o manual a um cliente quer a marca dele na capa. Hoje a capa do HTML e do PDF só tem o título.

## Critérios de aceite
- [ ] `theme.logo` guarda o caminho do logo em `assets/`; PNG, JPG ou SVG até 1 MB.
- [ ] O logo aparece na capa e no topo do sumário do HTML e do PDF, e abre offline.
- [ ] SVG entra só por `<img>`, sem script rodando; arquivo fora do limite é recusado com o motivo.
- [ ] Logo grande não estoura a capa do PDF.
- [ ] Remover o logo não apaga as cores e fontes do `theme`, e o contrário também.
- [ ] Upload e remoção no ExportDialog, textos em pt e en. `docs/manual-format.md` atualizado.

## Onde
`src/core/types.ts`, `src/core/export/theme.ts`, `src/core/export/html.ts` (capa), `src/core/assets.ts`, `web/src/features/export/ExportDialog.tsx`, `docs/manual-format.md`.

## Como verificar
Testes em `test/` (validação, cópia para o export, SVG); exportar com logo PNG e SVG e abrir HTML e PDF offline.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

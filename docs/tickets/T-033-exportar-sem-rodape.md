# T-033: Exportar o manual sem o rodapé do Explicaí

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: [Discovery de customização](../discovery/2026-10-30-customizacao-marca.md) (2026-10-30)

## Problema
O rodapé do Explicaí continua por padrão, mas quem entrega o manual ao cliente precisa poder tirá-lo.

## Critérios de aceite
- [ ] Opção no ExportDialog para exportar sem o rodapé; por padrão o rodapé aparece.
- [ ] A escolha fica salva no manual e vale para HTML e PDF.
- [ ] Manual antigo exporta igual a hoje. Texto da opção em pt e en. `docs/manual-format.md` atualizado.

## Onde
`src/core/export/html.ts` (`.colophon`), `src/core/types.ts`, `web/src/features/export/ExportDialog.tsx`, `docs/manual-format.md`.

## Como verificar
Teste do HTML gerado com e sem rodapé.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

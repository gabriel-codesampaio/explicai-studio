# T-550: Exportar Word (.docx)

- Prioridade: P3
- Tamanho: G
- Status: fechado (adiado)
- Agente: core (+ qa)
- Origem: [relatório de features 2026-11-05](../../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 11 (esforço G, risco M)

## Problema
Cliente de software house pede "manda em Word" para editar. O Confluence exporta Word, e há apps pagos que melhoram esse export: indício de demanda, não evidência para o nosso público (nenhuma fonte em `PRODUCT.md`).

## Riscos
- Biblioteca nova: licença a verificar antes (regra de não ter GPL/AGPL).
- Marcações do print têm de virar imagem (a exportação já faz isso para PDF e HTML? conferir).
- Fidelidade de fonte e de tabela.
- Formato em disco não muda.

## Corte mínimo
Nenhum que valha: Word ruim é pior que não ter.

## Critérios de aceite
- [ ] Antes de codar: licença da lib aprovada e peso medido, anotados no Registro.
- [ ] Export `.docx` com texto, títulos, listas, tabelas, imagens com marcações e legenda; fonte da marca ou fallback declarado.
- [ ] Respeita o público e deixa de fora as páginas da lixeira.
- [ ] Teste de fidelidade com `docs/exemplo/financeiro`, com revisão manual no Word.

## Onde
`src/core/export/` (novo exportador), dependência nova (licença verificada).

## Como verificar
Abrir o `.docx` gerado do exemplo no Word e no LibreOffice; comparar com o HTML.

## Decisão
Decidido em 2026-11-05: não por enquanto. Espera dois pedidos reais. Fechado como adiado; ideia no caderno.

## Registro
- 2026-11-05: Decidido em 2026-11-05: não por enquanto. Espera dois pedidos reais. Fechado como adiado; ideia no caderno.
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

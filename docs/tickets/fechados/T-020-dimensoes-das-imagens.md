# T-020: Dimensões das imagens no HTML exportado

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: core
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O Chrome avisa que imagem com carregamento adiado precisa de largura e altura; sem elas a página pula enquanto carrega.

## Critérios de aceite
- [x] As imagens do HTML exportado têm `width` e `height` do arquivo (já lidos para as marcações).

## Onde
`src/core/export/html.ts` (`renderShot`).

## Como verificar
Teste de exportação conferindo os atributos.

## Registro
`img` do HTML exportado leva `width` e `height` do arquivo (só quando o tamanho é conhecido). Teste em export.test.ts. Commit a8f670b.

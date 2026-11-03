# T-109: Marcação com JSON válido de forma errada derruba a exportação

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: preparação da versão de produção (2026-11-03)

## Problema
`parseAnnotations` aceita JSON válido mas de forma errada (não-array, itens sem tipo/coordenadas) e a exportação cai. T-092 só cobriu JSON quebrado.

## Critérios de aceite
- [ ] Forma errada vira o mesmo aviso do T-092 e a exportação segue.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
src/core/annotations.ts e quem a chama na exportação

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-110: findUnusedAssets: stat em paralelo e ENOENT tolerado

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: preparação da versão de produção (2026-11-03)

## Problema
`findUnusedAssets` faz `stat` em sequência e sem tratar ENOENT: imagem apagada entre a listagem e o stat derruba a contagem/limpeza.

## Critérios de aceite
- [ ] ENOENT ignora o arquivo; stats em paralelo (Promise.all).
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
src/core/assets.ts

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

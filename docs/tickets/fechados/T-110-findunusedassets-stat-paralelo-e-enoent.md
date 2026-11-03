# T-110: findUnusedAssets: stat em paralelo e ENOENT tolerado

- Prioridade: P2
- Tamanho: P
- Status: feito
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
Commit e7623cb. Stats via Promise.all; ENOENT tira o arquivo da lista, outro erro continua subindo. Teste com mock de stat em test/unused-assets-race.test.ts.

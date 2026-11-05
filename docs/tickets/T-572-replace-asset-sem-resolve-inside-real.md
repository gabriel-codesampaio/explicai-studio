# T-572: `replaceAsset` não confere symlink

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: backend
- Origem: achado de revisão dos PRs de 2026-11-05

## Problema
`src/core/replaceAsset.ts` grava o arquivo sem passar por `resolveInsideReal`. Um symlink dentro de `assets/` pode levar a escrita para fora da pasta do manual.

## Critérios de aceite
- [ ] `replaceAsset` resolve o destino com `resolveInsideReal` (como as outras escritas de asset) e recusa caminho que sai da pasta.

## Onde
`src/core/replaceAsset.ts`.

## Como verificar
Teste em `test/replace-asset.test.ts` com symlink apontando para fora.

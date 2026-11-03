# T-088: Limpar imagens sem uso: gravar a fila antes e poupar arquivo novo

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 5 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
uma imagem colada há menos de 600 ms, ou presa numa fila de autosave que falhou, ainda não está em nenhuma página no disco. O painel a conta como sem uso e a move para `.lixeira/imagens-<data>/`.

## Critérios de aceite
- [ ] `await studio.flush()` antes de `cleanUnusedAssets`, e ignorar arquivos com menos de 1 minuto no servidor.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
`web/src/features/pages/TrashPanel.tsx:32-39` (não chama `flush` antes); `src/core/assets.ts:152-185` (decide só pelo que está em disco).

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 5 da auditoria.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

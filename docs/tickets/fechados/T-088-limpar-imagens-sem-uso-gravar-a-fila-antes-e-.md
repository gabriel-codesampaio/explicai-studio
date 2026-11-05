# T-088: Limpar imagens sem uso: gravar a fila antes e poupar arquivo novo

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 5 (`docs/discovery/archives/2026-11-02-auditoria-ponytail.md`)

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
Feito na branch fix/t-088-limpar-imagens-sem-uso:
- `findUnusedAssets` poupa arquivo com menos de 1 min (mtime); `EXPLICAI_ASSET_GRACE_MS` zera a carência só no e2e (`e2e/serve.mjs`).
- `TrashPanel` recebe `flush` (exposto por `useStudio`) e o chama antes de `cleanUnusedAssets`.
- Testes: `test/unused-assets.test.ts` (novo poupado, antigo movido), `web/test/trashPanel.test.tsx` (ordem flush -> limpar). Alias `@` no `vitest.config.ts`.
- Fora: se o flush falhar (autosave em erro), a limpeza segue; só a carência de 1 min protege. Contagem do painel agora também ignora arquivos novos.
- Commits: ver `git log` da branch.

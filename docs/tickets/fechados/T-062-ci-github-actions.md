# T-062: CI no GitHub Actions

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: qa

## Feito
`.github/workflows/ci.yml`: job `check` (Node 20 e 22: `npm run lint`, `npm run typecheck`, `npm run test:cov`) e job `e2e` separado (Chromium via `npx playwright install --with-deps chromium`, `E2E_PORT=4400`, `test-results/` com o trace enviado como artefato quando falha). `permissions: contents: read`. `actions/checkout`, `setup-node` e `upload-artifact` em `v7`, a maior tag existente (conferida com `git ls-remote`).

`playwright.config.ts` usa o Chrome instalado só fora do CI (`CI` é definido pelo Actions).

## Pendências
- Depende do `test:cov` do T-060: mesclar T-060 antes.
- Não foi rodado no GitHub; só o YAML foi validado localmente.

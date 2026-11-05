# T-573: Menu Nova página: Esc perde o foco

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: achado de revisão dos PRs de 2026-11-05

## Problema
No `NewPageMenu` o `preventDefault` do fechamento vale também para Esc, e o foco some em vez de voltar ao gatilho.

## Critérios de aceite
- [ ] Esc fecha o menu e devolve o foco ao botão que abriu; escolher um modelo continua levando o foco ao título da página criada.

## Onde
`web/src/features/pages/NewPageMenu.tsx`.

## Como verificar
E2E `studio.modelos.e2e.ts`: abrir, Esc, conferir `document.activeElement`.

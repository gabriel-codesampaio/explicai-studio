# T-574: ReviewedControl sem aria-live

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: achado de revisão dos PRs de 2026-11-05

## Problema
Ao marcar a página como conferida, a data muda na tela e o leitor de tela não anuncia.

## Critérios de aceite
- [ ] Mudança de estado e data é anunciada (região `aria-live="polite"` ou `role="status"`).

## Onde
`web/src/features/pages/ReviewedControl.tsx`.

## Como verificar
Teste de unidade: a região existe e muda de texto depois do clique.

# T-576: Passeio cita "Criar a primeira página" em texto fixo

- Prioridade: P3
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: achado de revisão dos PRs de 2026-11-05

## Problema
O passo do passeio diz "Clique em Criar a primeira página" no corpo. Se o rótulo do botão mudar, ou com manual que já tem página, o texto fica errado.

## Critérios de aceite
- [ ] O texto do passo não depende do rótulo do botão (ou usa o mesmo `t()` do botão).

## Onde
`web/src/features/help/tourSteps.ts`, `web/src/App.tsx`.

## Como verificar
Teste de unidade do passo; e2e do passeio segue verde.

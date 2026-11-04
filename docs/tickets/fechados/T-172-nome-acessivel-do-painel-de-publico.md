# T-172: Dar nome acessível ao painel de público da página

- Prioridade: P2
- Tamanho: P
- Status: descartado
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado B2 (avaliado no commit 60a0e3d)

## Problema
Achado B2, axe sério, critério 4.1.2. O painel de público da página é um diálogo sem nome acessível.

## Critérios de aceite
- [ ] O diálogo tem nome acessível (`aria-labelledby` ou `aria-label`).
- [ ] Axe sem violação de nome nesse painel.

## Onde
- web/src/features/pages/AudienceMenu.tsx

## Como verificar
Abrir o painel de público e rodar axe. Conferir o nome do diálogo no snapshot de acessibilidade.

## Registro
2026-11-04: absorvido pelo critério do T-187 (nome acessível do popover e do diálogo).

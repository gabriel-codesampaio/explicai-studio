# T-261: Levar o foco à faixa de conflito quando ela aparece

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: relatório do supervisor do marco 0.4, 2026-11-04 (achado do T-153/T-163)

## Problema
A faixa de conflito aparece por cima da página, mas o foco fica no editor. Quem usa só teclado continua digitando sem notar.

## Critérios de aceite
- [x] Ao aparecer, a faixa é anunciada (role=alert ou status) e o foco vai para a primeira ação, sem perder o texto não gravado.
- [x] Esc volta o foco ao editor no mesmo ponto.

## Como verificar
Teste de unidade do componente da faixa; uma conferência com teclado.

## Registro
- Commit: 4beabf4
- Feito: DiskConflictBanner (já role=alert) foca a primeira ação ao montar; Esc devolve o foco ao elemento que o tinha (editor). Teste web/test/diskConflictFocus.test.tsx.
- Fora: conferência manual com teclado (sem navegador); o ponto exato do cursor depende de o editor manter a seleção ao receber foco.

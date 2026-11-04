# T-261: Levar o foco à faixa de conflito quando ela aparece

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório do supervisor do marco 0.4, 2026-11-04 (achado do T-153/T-163)

## Problema
A faixa de conflito aparece por cima da página, mas o foco fica no editor. Quem usa só teclado continua digitando sem notar.

## Critérios de aceite
- [ ] Ao aparecer, a faixa é anunciada (role=alert ou status) e o foco vai para a primeira ação, sem perder o texto não gravado.
- [ ] Esc volta o foco ao editor no mesmo ponto.

## Como verificar
Teste de unidade do componente da faixa; uma conferência com teclado.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

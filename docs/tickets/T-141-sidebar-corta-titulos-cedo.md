# T-141: Sidebar corta títulos e o seletor do manual cedo demais

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
Títulos da árvore ("Entrar na platafor...") e o seletor do manual cortam com espaço livre na linha.

## Critérios de aceite
- [ ] A árvore usa a largura disponível: o corte só vem quando o texto não cabe de fato. Mesmo para o seletor do manual.
- [ ] Título cortado continua com tooltip (T-076). Medido por script em 1280 e 375, antes e depois.

## Onde
`web/src/features/pages/`, árvore e seletor do manual.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

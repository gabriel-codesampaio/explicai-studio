# T-141: Sidebar corta títulos e o seletor do manual cedo demais

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
Títulos da árvore ("Entrar na platafor...") e o seletor do manual cortam com espaço livre na linha.

## Critérios de aceite
- [x] A árvore usa a largura disponível: o corte só vem quando o texto não cabe de fato. Mesmo para o seletor do manual.
- [x] Título cortado continua com tooltip (T-076). Medido por script em 1280 e 375, antes e depois.

## Onde
`web/src/features/pages/`, árvore e seletor do manual.

## Registro
Medido no Studio de teste em 1280 (manual com título longo, 3 páginas publicadas): largura do título antes/depois 100/158, 100/124 e 100/214 px (a 3ª ainda corta, precisa de 227). Ações da página (+ e ⋯) agora ficam por cima do fim da linha e só aparecem no hover/foco (no toque, seguem na linha). Nome do manual e itens da lista do seletor quebram em até 2 linhas. 375 não medido (a sidebar vira gaveta com a mesma largura). Feito junto com o T-142.

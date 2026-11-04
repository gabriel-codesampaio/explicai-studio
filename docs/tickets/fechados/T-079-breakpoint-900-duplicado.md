# T-079: Breakpoint de 900 px duplicado em COLUMN_MIN_REM e Navigation.tsx

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: revisão de design e de código do lote 6 (2026-11-02)

## Problema
A largura de 900 px está em `COLUMN_MIN_REM` (useSidebar.ts) e em cinco classes `min-[56.25rem]:` de Navigation.tsx; mudar um lado sem o outro faz hook e CSS divergirem.

## Critérios de aceite
- [x] Um breakpoint nomeado no tema (ex. `--breakpoint-split`) usado nas classes; o hook lê o mesmo valor ou o teste trava os dois.

## Onde
web/src/hooks/useSidebar.ts, web/src/layout/Navigation.tsx

## Como verificar
Teste da área e medida por script no navegador.

## Registro
Fechado na branch fix/lote-4-tecnico. `--breakpoint-split: 56.25rem` em tokens.css; Navigation.tsx usa `split:`; teste trava o valor do tema contra COLUMN_MIN_REM.

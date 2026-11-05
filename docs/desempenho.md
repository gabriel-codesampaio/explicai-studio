# Metas de desempenho

Só entra meta com número medido (T-105, T-106, 2026-11-04; Windows 10, Chrome real, máquina com carga). O teto é um guarda contra regressão grande, não promessa de velocidade: folga de 4x a 1000x sobre o medido.

| Operação | Medido | Teto (teste) |
|---|---|---|
| Exportar PDF com 100 imagens PNG | 4,7 a 7,5 s, RSS 86 MB, 1,2 MB de PDF | 30 s (`test/export-pdf-images.test.ts`, pula sem Chrome) |
| Numerar a árvore de 500 páginas | 0,035 ms | 200 ms (`web/test/numberPagesBudget.test.ts`) |

## Sem meta ainda (não medido)
- Abrir manual de 500 páginas e salvar: falta medida de ponta a ponta.
- Digitar título com 500 páginas: o re-render da árvore leva ~400 ms (happy-dom, ruidoso); ver T-422.

# Metas de desempenho

Só entra meta com número medido (T-105, T-106, 2026-11-04; Windows 10, Chrome real, máquina com carga). O teto é um guarda contra regressão grande, não promessa de velocidade: folga de 4x a 1000x sobre o medido.

| Operação | Medido | Teto (teste) |
|---|---|---|
| Exportar PDF com 100 imagens PNG | 4,7 a 7,5 s, RSS 86 MB, 1,2 MB de PDF | 30 s (`test/export-pdf-images.test.ts`, pula sem Chrome) |
| Numerar a árvore de 500 páginas | 0,035 ms | 200 ms (`web/test/numberPagesBudget.test.ts`) |
| Abrir: ler a árvore com 500 páginas (disco) | 61 ms (máx 90) | 500 ms (`test/budget-500.test.ts`) |
| Salvar o corpo de uma página (manual de 500) | 3,8 ms (máx 5) | 100 ms (`test/budget-500.test.ts`) |
| Salvar com título novo, renomeando o arquivo | 118 ms (máx 132) | 1 s (`test/budget-500.test.ts`) |
| Abrir o manual de 500 páginas no Chrome (até a 500ª linha na tela) | 1,3 s (2 rodadas: 1350, 1353 ms) | 5 s (sem teste automático: depende de navegador) |
| Digitar no título com 500 páginas (tecla até pintar) | 44 ms; antes do T-422, 137 ms | 150 ms por tecla (sem teste automático; o T-422 guarda por contagem de renders em `web/test/pageTreeMemo.test.tsx`) |
| Digitar no corpo com 500 páginas (tecla até pintar) | 28 a 41 ms (3 páginas: 28 ms) | 100 ms (sem teste automático) |

## Como foi medido (T-422, T-423, 2026-11-05)
- Máquina: Windows 10, Node 22.17, Chrome real sem janela, com outras sessões rodando (carga). Manual de 500 páginas, 50 raízes com 9 filhas, ~2 KB de corpo cada.
- Disco: script `tsx` sobre `src/core` (`readPageTree`, `updatePage`), mediana de 15 rodadas.
- Navegador: Playwright headless (`channel: "chrome"`), servidor do `dist/server` e web compilado à parte. Abrir = `goto` até a 500ª linha existir. Digitar = 40 teclas com `keyboard.press` e dois `requestAnimationFrame`, mediana; o piso de ~28 ms é o vai e vem do Playwright (manual de 3 páginas). Duas rodadas por tamanho.
- Árvore (happy-dom, T-422): um título digitado com 500 páginas re-renderizava 500 linhas em ~370 ms (366, 390); com a linha memoizada, 2 linhas em ~11 ms. `dragOver`: 359 a 585 ms para 500 linhas, agora ~11 ms para 2.
- O teto é o medido com folga de 4x a 100x. Os de disco têm teste e rodam na suíte; os de navegador ficam só como meta de referência, porque dependem de Chrome e oscilam com a carga.

## Instável
- `web/test/pageTreeNumbers.test.tsx` ("500 páginas") chegou a 9,4 s sob carga porque cada `dragOver` re-renderizava as 500 linhas. Com a linha memoizada ficou em ~2,3 s; sem timeout próprio, segue sujeito a carga.

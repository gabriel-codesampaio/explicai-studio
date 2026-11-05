# T-423: Medir abrir e salvar um manual de 500 páginas

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: lote de medição, 2026-11-04

## Problema
T-205 deixou sem meta abrir e salvar porque não há medida de ponta a ponta.

## Critérios de aceite
- [x] Medida (mediana de N rodadas) e teto em `docs/desempenho.md` com teste de orçamento.

## Registro
Fechado em 2026-11-05 (sem hash; falta commit).
- Medido e metas em `docs/desempenho.md`: abrir (árvore) 61 ms, salvar corpo 3,8 ms, salvar com renomeio 118 ms, abrir no Chrome 1,3 s, tecla no título 44 ms e no corpo 28 a 41 ms (500 páginas).
- Teste de orçamento: `test/budget-500.test.ts` (500 ms, 100 ms, 1 s; mediana de 5). Navegador fica como meta sem teste (depende de Chrome e de carga).
- Anotado: `pageTreeNumbers` chegou a 9,4 s sob carga; agora ~2,3 s.
- Fora: salvar com renomeio é o mais lento (118 ms); não investigado.

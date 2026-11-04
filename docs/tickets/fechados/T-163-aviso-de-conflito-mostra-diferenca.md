# T-163: Mostrar o que mudou no aviso de conflito, sem empurrar o texto

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A13 (avaliado no commit 60a0e3d)

## Problema
Achado A13. O aviso de conflito não mostra o que mudou e empurra a página 57 px ao aparecer. Relacionado ao T-114 e ao T-120 (fechados, conflito de disco) e ao T-153 (mudança externa).

## Critérios de aceite
- [ ] O aviso mostra a diferença (trecho antes e depois, ou resumo) antes de a pessoa escolher.
- [ ] Ao aparecer, o aviso não move o texto da página (deslocamento 0 px).
- [ ] As escolhas do aviso continuam as mesmas.

## Onde
- web/src/features/errors/DiskConflictBanner.tsx

## Como verificar
Forçar um conflito de disco e medir com evaluate_script a posição do texto antes e depois do aviso. Conferir a diferença exibida com uma alteração conhecida.

## Registro
Feito: faixa por cima da página (h-0 sticky + absolute, deslocamento 0 px medido em 1280 e 375) com o trecho que difere no disco e no texto da pessoa (`lib/conflictDiff.ts`). Botões iguais. Observação: a faixa cobre o topo da página enquanto a pessoa escolhe.

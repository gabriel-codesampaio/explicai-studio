# T-154: Reabrir a imagem no primeiro clique depois de fechar a marcação

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A4 (avaliado no commit 60a0e3d)

## Problema
Achado A4. Depois de fechar a marcação, a imagem não reabre no primeiro clique. Só reabre depois de clicar em outro lugar e voltar. Causa provável: `setDismissedAt` em `ImagePopover.tsx`.

Reproduzido pela pessoa em 2026-11-04 (lote 1.0): clicar na imagem (abre o painel da descrição) > "Editar imagem" > fechar o diálogo de marcação > clicar na imagem de novo: o painel da descrição não aparece.

## Critérios de aceite
- [ ] Um clique na imagem reabre a marcação logo depois de fechá-la.
- [ ] Fechar por Esc e por clique fora têm o mesmo comportamento.
- [ ] Vale também saindo pelo "Editar imagem" e fechando o diálogo de marcação.

## Onde
- web/src/features/editor/ImagePopover.tsx (`setDismissedAt`)

## Como verificar
Clicar na imagem, fechar com Esc, clicar de novo na imagem: abre na primeira vez. Repetir fechando por clique fora. Teste e2e do fluxo de imagem.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-156: Levar o foco à legenda depois de marcar, sem quebrar os atalhos

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A6 (avaliado no commit 60a0e3d)

## Problema
Achado A6. Depois de marcar, o foco fica na janela e cada marcador pede um clique na legenda. Os atalhos de letra das ferramentas (T-014) dependem de o foco não estar em campo de texto.

## Critérios de aceite
- [ ] Depois de criar um marcador, a legenda recebe o foco sem a pessoa clicar.
- [ ] Sair da legenda com Esc ou Tab devolve o teclado às ferramentas, e as letras de atalho voltam a funcionar.

## Onde
- web/src/features/annotations/AnnotationEditor.tsx

## Como verificar
Criar um marcador e digitar na legenda. Apertar Esc e a letra de uma ferramenta: a ferramenta muda. Teste de teclado no e2e da marcação.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

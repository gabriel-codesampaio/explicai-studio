# T-162: Dar à lixeira e à ajuda um lugar próprio no menu

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: design
- Origem: relatório UX 2026-11-04, achado A12 (avaliado no commit 60a0e3d)

## Problema
Achado A12. A lixeira fica dentro de Ajustes. A única ajuda é a lista de atalhos. Quem procura lixeira ou ajuda não acha.

## Critérios de aceite
- [ ] A lixeira abre direto do menu principal, sem passar por Ajustes.
- [ ] Há um item de ajuda com conteúdo além da lista de atalhos (ou link para ela).
- [ ] Se o passeio guiado (T-148) entrar, o item de ajuda aponta para ele.

## Onde
- web/src/layout/MoreMenu.tsx

## Como verificar
Abrir o menu principal em 1280 e 375 px: lixeira e ajuda aparecem sem subir de Ajustes. Conferir o teclado no menu.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

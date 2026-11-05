# T-162: Dar à lixeira e à ajuda um lugar próprio no menu

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: design
- Origem: relatório UX 2026-11-04, achado A12 (avaliado no commit 60a0e3d)

## Problema
Achado A12. A lixeira fica dentro de Ajustes. A única ajuda é a lista de atalhos. Quem procura lixeira ou ajuda não acha.

## Critérios de aceite
- [x] A lixeira abre direto do menu principal, sem passar por Ajustes.
- [x] Há um item de ajuda com conteúdo além da lista de atalhos (ou link para ela).
- [x] Se o passeio guiado (T-148) entrar, o item de ajuda aponta para ele.

## Onde
- web/src/layout/MoreMenu.tsx

## Como verificar
Abrir o menu principal em 1280 e 375 px: lixeira e ajuda aparecem sem subir de Ajustes. Conferir o teclado no menu.

## Registro
Feito (branch feat/t-206-paridade-pt-en):
- Rodapé da barra lateral: "Ajustes" (Públicos, Aparência, Tema, Idioma) mais dois botões de ícone, Lixeira e Ajuda, que abrem o painel direto. 44 px em tela de toque, foco volta ao botão ao fechar.
- Ajuda: o painel "Atalhos de teclado" virou "Ajuda"; já trazia o passo a passo do primeiro print, a exportação e o corretor, além das teclas.
- e2e ajustados (`barra enxuta`, `tela estreita`, `lixeira: restaurar`, `alvos de toque`); rodados esses e os de rodapé alinhado, verdes.
- Fora: link do passeio guiado (T-148 não entrou); sem texto visível nos dois botões (nome acessível e title).

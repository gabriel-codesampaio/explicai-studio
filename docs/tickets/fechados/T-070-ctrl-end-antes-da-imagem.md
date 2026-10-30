# T-070: Ctrl+End nem sempre leva o cursor para depois da imagem

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: QA do T-064 em 2026-10-30

## Problema
Numa página que termina na imagem ("Texto." e depois a imagem), clicar no texto, apertar Ctrl+End, Enter e digitar põe o texto entre "Texto." e a imagem em cerca de 1 a cada 5 tentativas (2 de 10 e 1 de 6 no e2e). Nas outras, o cursor vai para depois da imagem. Quem escreve abaixo do print por teclado perde a posição sem aviso.

## Critérios de aceite
- [x] Ctrl+End leva o cursor para depois da imagem final, sempre (repetir o e2e 20 vezes sem falha).
- [x] Tirar o `test.fixme` de "Ctrl+End numa página que termina na imagem" em `e2e/studio.imagem.e2e.ts`.

## Onde
`web/src/features/editor/` (extensão da imagem, `ProseMirror-separator`), `e2e/studio.imagem.e2e.ts`.

## Como verificar
`E2E_PORT=4493 npx playwright test e2e/studio.imagem.e2e.ts -g "Ctrl\+End" --repeat-each=20`.

## Registro
- Commit: 6ead6cd.
- Causa: o Ctrl+End nativo move só o cursor do DOM; o ProseMirror o lê no selectionchange, depois. Medido com log de keydown/selectionchange: nas falhas o Enter chegava sem selectionchange no meio, com o estado ainda no fim de "Texto.".
- Feito: atalho `Mod-End` (`focus("end")`) em `Editor.tsx`. Tentativa anterior, sincronizar a seleção do DOM em todo keydown, baixou a falha para 5 em 100 e foi descartada. Prova: 100 repetições sem falha (antes 3 em 20). Fixme removido.
- Fora: mesma corrida em outras teclas de navegação (Shift+Home, Ctrl+Home).

# T-070: Ctrl+End nem sempre leva o cursor para depois da imagem

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: QA do T-064 em 2026-10-30

## Problema
Numa página que termina na imagem ("Texto." e depois a imagem), clicar no texto, apertar Ctrl+End, Enter e digitar põe o texto entre "Texto." e a imagem em cerca de 1 a cada 5 tentativas (2 de 10 e 1 de 6 no e2e). Nas outras, o cursor vai para depois da imagem. Quem escreve abaixo do print por teclado perde a posição sem aviso.

## Critérios de aceite
- [ ] Ctrl+End leva o cursor para depois da imagem final, sempre (repetir o e2e 20 vezes sem falha).
- [ ] Tirar o `test.fixme` de "Ctrl+End numa página que termina na imagem" em `e2e/imagem.e2e.ts`.

## Onde
`web/src/features/editor/` (extensão da imagem, `ProseMirror-separator`), `e2e/imagem.e2e.ts`.

## Como verificar
`E2E_PORT=4493 npx playwright test e2e/imagem.e2e.ts -g "Ctrl\+End" --repeat-each=20`.

## Registro
<!-- preenchido ao fechar -->

# T-071: Esc no balão da descrição da imagem joga o foco para o body

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: QA do T-064 em 2026-10-30

## Problema
Clique na imagem, o balão "Descrição da imagem" abre com o foco no campo. Esc fecha o balão, mas o foco vai para o `body` (`document.activeElement` = BODY) e a imagem continua selecionada. Backspace, Ctrl+C e as setas não fazem nada, e quem usa teclado ou leitor de tela perde o lugar. O Enter no campo já devolve o foco ao editor; o Esc não.

## Critérios de aceite
- [ ] Esc no balão fecha e devolve o foco ao editor (a imagem continua selecionada, então Backspace a apaga e Ctrl+C a copia).
- [ ] Tirar o `test.fixme` de "teclado: o balão da descrição..." em `e2e/imagem.e2e.ts`.

## Onde
`web/src/features/editor/AnchoredPopover.tsx`, `web/src/features/editor/ImagePopover.tsx`.

## Como verificar
`E2E_PORT=4493 npx playwright test e2e/imagem.e2e.ts -g "teclado"`.

## Registro
<!-- preenchido ao fechar -->

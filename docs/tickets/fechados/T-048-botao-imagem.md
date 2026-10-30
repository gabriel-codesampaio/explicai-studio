# T-048: Botão "Imagem" na barra fixa, sem o atalho ao lado

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: Pedido da pessoa (2026-10-30); Lighthouse `label-content-name-mismatch`

## Problema
O botão "Colar print Ctrl+V" tinha nome acessível "Colar print" e texto visível "Colar print Ctrl+V". O nome não continha o texto visível inteiro (Lighthouse `label-content-name-mismatch`). A pessoa também achou o botão carregado.

## Decisão
Revê o rótulo de T-010 (que pedia "Colar print" com Ctrl+V em mono no botão): o botão mostra só "Imagem" (en "Image"), com o ícone. O nome acessível é igual ao texto visível. O atalho vai para a dica: "Colar print Ctrl+V". Comportamento e posição (logo após o seletor de bloco, T-044) não mudam; o Ctrl+V no editor segue valendo.

## Critérios de aceite
- [x] Botão com texto "Imagem" e ícone, sem `kbd`.
- [x] Dica ao passar o mouse com "Colar print" e "Ctrl+V".
- [x] Clique abre o seletor de arquivo; mesma posição.
- [x] i18n: "Imagem"/"Image" já existia; "Colar print" segue em uso na dica, nenhuma chave ficou sem uso.

## Onde
`web/src/features/editor/Toolbar.tsx`, `ToolbarButton.tsx` (prop `hint`), `e2e/studio.e2e.ts`.

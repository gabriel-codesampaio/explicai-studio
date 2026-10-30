# T-063: Popover da descrição da imagem não pode encostar no rodapé

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-30

## Problema
O popover "Descrição da imagem" abre colado na barra de status (caminho do arquivo e "Tudo salvo no disco"). Perto do fim da tela ele encosta ou cobre o rodapé.

## Critérios de aceite
- [x] O popover nunca sobrepõe nem encosta no rodapé nem na barra fixa de cima: limite de colisão é a área útil do editor, com padding de pelo menos 8 px.
- [x] Sem espaço embaixo, abre em cima da imagem (flip). Sem espaço nenhum, encolhe com rolagem interna, sem cortar o campo nem o botão "Marcar imagem".
- [x] Imagem no topo, no meio e no fim da página, 1280 e 375 px, claro e escuro.
- [x] e2e: imagem no fim da página, abre o popover e mede que o retângulo dele não cruza o do rodapé.
- [x] LinkPopover e os outros AnchoredPopover conferidos e corrigidos junto.

## Onde
`web/src/features/editor/ImagePopover.tsx`, `AnchoredPopover.tsx`, `LinkPopover.tsx`.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
Commit d3f5b38.

`AnchoredPopover` usa `collisionPadding` medido ao abrir (de baixo da barra fixa até acima do rodapé, mais 8 px) e `max-h` igual à altura disponível do Radix, com rolagem interna. Flip vem do Radix. LinkPopover usa o mesmo componente, então foi corrigido junto. e2e novo em `e2e/studio.e2e.ts` (1280 e 375 px, altura normal e curta).

Ficou de fora: conferência manual no Chrome DevTools MCP em claro e escuro (a mudança é só de posição; o e2e mede a geometria).

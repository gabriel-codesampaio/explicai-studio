# T-063: Popover da descrição da imagem não pode encostar no rodapé

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa em 2026-10-30

## Problema
O popover "Descrição da imagem" abre colado na barra de status (caminho do arquivo e "Tudo salvo no disco"). Perto do fim da tela ele encosta ou cobre o rodapé.

## Critérios de aceite
- [ ] O popover nunca sobrepõe nem encosta no rodapé nem na barra fixa de cima: limite de colisão é a área útil do editor, com padding de pelo menos 8 px.
- [ ] Sem espaço embaixo, abre em cima da imagem (flip). Sem espaço nenhum, encolhe com rolagem interna, sem cortar o campo nem o botão "Marcar imagem".
- [ ] Imagem no topo, no meio e no fim da página, 1280 e 375 px, claro e escuro.
- [ ] e2e: imagem no fim da página, abre o popover e mede que o retângulo dele não cruza o do rodapé.
- [ ] LinkPopover e os outros AnchoredPopover conferidos e corrigidos junto.

## Onde
`web/src/features/editor/ImagePopover.tsx`, `AnchoredPopover.tsx`, `LinkPopover.tsx`.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

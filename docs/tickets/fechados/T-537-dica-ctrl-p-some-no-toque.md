# T-537: Esconder a dica Ctrl+P em tela de toque

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B7 (Baixo)

## Problema
A dica "Ctrl+P" aparece ao lado de "Buscar" também em 375 px, na gaveta. Sem teclado físico, a dica não serve para nada.

## Critérios de aceite
- [x] Em `(pointer: coarse)` a dica de atalho some ao lado de "Buscar".
- [x] No desktop a dica continua.
- [x] O atalho Ctrl+P segue funcionando com a dica oculta.

## Onde
Botão Buscar na gaveta/barra (componente que mostra a dica de atalho). Esforço do relatório: P.

## Como verificar
`evaluate_script` com `pointer: coarse` emulado e sem emulação; e2e do atalho.

## Registro
- Fechado na branch feat/ui-lote2-a. `pointer-coarse:hidden` no Kbd da busca (Sidebar). Conferido por e2e com contexto de toque (375 px): dica some; no desktop continua. Ctrl+P não mudou.

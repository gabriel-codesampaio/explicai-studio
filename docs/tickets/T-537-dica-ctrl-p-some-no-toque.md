# T-537: Esconder a dica Ctrl+P em tela de toque

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B7 (Baixo)

## Problema
A dica "Ctrl+P" aparece ao lado de "Buscar" também em 375 px, na gaveta. Sem teclado físico, a dica não serve para nada.

## Critérios de aceite
- [ ] Em `(pointer: coarse)` a dica de atalho some ao lado de "Buscar".
- [ ] No desktop a dica continua.
- [ ] O atalho Ctrl+P segue funcionando com a dica oculta.

## Onde
Botão Buscar na gaveta/barra (componente que mostra a dica de atalho). Esforço do relatório: P.

## Como verificar
`evaluate_script` com `pointer: coarse` emulado e sem emulação; e2e do atalho.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

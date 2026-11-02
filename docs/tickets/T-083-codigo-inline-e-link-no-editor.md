# T-083: Botão de código inline e fluxo de link: investigar e corrigir

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa em 2026-11-02 (acha que o código inline e o link não funcionam)

## Problema
A pessoa relata que o botão de código inline (Toolbar.tsx:73, SelectionMenu.tsx:70, toggleCode) e a parte de link (Link2/Ctrl+K, onEditLink, LinkPopover.tsx) não funcionam.

## Critérios de aceite
- [ ] Causa achada e medida; código inline aplica e remove (com e sem seleção, barra, menu de seleção e atalho); link cria, edita, remove, recusa URL inválida, Ctrl+K, persiste após salvar/recarregar e sai no export; e2e cobrindo cada caso.

## Onde
web/src/features/editor/Toolbar.tsx, SelectionMenu.tsx, LinkPopover.tsx

## Como verificar
Skill diagnosticar no navegador real e e2e.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

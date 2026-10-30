# T-014: Atalhos de letra nas ferramentas de marcação

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
As cinco ferramentas do diálogo de marcação só funcionam no clique, e os itens da lista se chamam "Destaque 1", "Seta 1".

## Critérios de aceite
- [ ] Atalhos V (selecionar), M (marcador), D (destaque), S (seta) e A (área clicável), mostrados ao lado de cada ferramenta e na lista de Atalhos.
- [ ] Os atalhos não disparam enquanto se digita num campo.
- [ ] Barra de ferramentas mais compacta (ícone + letra), com nome acessível.

## Onde
`features/annotations/AnnotationEditor.tsx`, `features/help/ShortcutsDialog.tsx`, `lib/i18n.en.ts`.

## Como verificar
Teste de ponta a ponta trocando de ferramenta pelo teclado.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

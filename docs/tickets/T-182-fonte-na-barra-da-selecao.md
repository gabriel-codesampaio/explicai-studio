# T-182: Pôr a troca de fonte na barra da seleção, discreta

- Prioridade: P2
- Tamanho: P
- Status: aberto (decisão pendente: ver abaixo)
- Agente: frontend
- Origem: pedido da pessoa, 2026-11-04 (lote 1.0)

## Problema
A barra que aparece ao selecionar texto (Texto, B, I, código, link, limpar, cor) não tem atalho nem opção de fonte. A pessoa quer a opção ali, discreta e diferente da barra principal.

Decisão pendente: hoje a fonte vale para o manual inteiro (FontMenu, T-160). Na barra da seleção ela trocaria só o trecho (exige campo novo no formato) ou abriria a fonte do manual?

## Critérios de aceite
- [ ] Controle de fonte na barra da seleção, compacto (ícone ou rótulo curto), com dica e atalho listados em ShortcutsDialog.
- [ ] Visual da barra da seleção diferente da barra fixa (mais leve), sem cobrir a linha seguinte (T-165).
- [ ] Comportamento conforme a decisão acima, com teste.

## Onde
- web/src/features/editor/SelectionMenu.tsx, web/src/features/editor/FontMenu.tsx
- Relacionados: T-160, T-165, discovery aparencia-sidebar-e-perfis

## Como verificar
Selecionar texto, trocar a fonte, conferir no editor e no export.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

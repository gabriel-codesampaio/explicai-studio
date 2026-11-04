# T-182: Pôr a troca de fonte na barra da seleção, discreta

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa, 2026-11-04 (lote 1.0)

## Problema
A barra que aparece ao selecionar texto (Texto, B, I, código, link, limpar, cor) não tem atalho nem opção de fonte. A pessoa quer a opção ali, discreta e diferente da barra principal.

Decidido (pessoa, 2026-11-04): troca a fonte **só do trecho selecionado**. A fonte do manual inteiro continua na tela de Aparência (discovery aparencia-sidebar-e-perfis). Exige marca nova no formato: Markdown com a fonte do trecho, lida e gravada sem perda, aceita só fontes da lista do manual, renderizada no HTML e no PDF.

## Critérios de aceite
- [ ] Controle de fonte na barra da seleção, compacto (ícone ou rótulo curto), com dica e atalho listados em ShortcutsDialog.
- [ ] Visual da barra da seleção diferente da barra fixa (mais leve), sem cobrir a linha seguinte (T-165).
- [ ] Fonte aplicada só ao trecho; "limpar formatação" remove; ida e volta Markdown sem perda (teste no core); export HTML e PDF com a fonte do trecho.
- [ ] Fonte fora da lista é ignorada ao ler (validação no parser).
- [ ] Documentado em manual-format.md.

## Onde
- web/src/features/editor/SelectionMenu.tsx, web/src/features/editor/FontMenu.tsx
- Relacionados: T-160, T-165, discovery aparencia-sidebar-e-perfis

## Como verificar
Selecionar texto, trocar a fonte, conferir no editor e no export.

## Registro
- Commits: f900972, 2964f59, abd1ff3 (+ correção da revisão)
- Feito: marca `<span data-font>` no Markdown (só ids da lista), menu de fonte na barra da seleção, export HTML/PDF, atalho Ctrl+Shift+F (só com o editor em foco).
- Fora: botão "limpar formatação" não existe na main (unsetAllMarks já remove a fonte); sem e2e, sem conferência em 375 nem no escuro.

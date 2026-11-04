# T-184: Mostrar os atalhos da marcação como tecla

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa, 2026-11-04 (lote 1.0)

## Problema
Na barra da marcação (Selecionar V, Marcador M...) a letra do atalho é texto solto ao lado do rótulo. A pessoa quer o padrão de tecla: caixinha cinza com borda e cantos arredondados, como "⌘ K".

## Critérios de aceite
- [ ] Componente `Kbd` único (borda, fundo muted, mono 11 px, raio pequeno), usado na barra da marcação, na busca (Ctrl+P), no ToolbarButton e no ShortcutsDialog.
- [ ] Tecla discreta: não compete com o rótulo; legível no botão ativo e em escuro.
- [ ] `aria-keyshortcuts` mantido; o Kbd segue aria-hidden.

## Onde
- web/src/features/annotations/AnnotationEditor.tsx:152, web/src/layout/Sidebar.tsx:77, web/src/features/editor/ToolbarButton.tsx:47, web/src/features/help/ShortcutsDialog.tsx:64

## Como verificar
Print da barra da marcação e da sidebar, 1280 claro e escuro.

## Registro
Commit `122fe06`. `components/ui/kbd.tsx` (borda, muted, mono 11 px, aria-hidden) usado na busca da sidebar, ToolbarButton (variante clara no tooltip escuro) e ShortcutsDialog (visível ao leitor, é o conteúdo). Conferido 1280 claro. Fica: AnnotationEditor.tsx:152 (arquivo do outro supervisor, T-196 cuida) e escuro sem print.

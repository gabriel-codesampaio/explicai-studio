# T-007: Tirar os ícones que só decoram e usar a extensão do arquivo na exportação

- Prioridade: P1
- Tamanho: P
- Status: fechado
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Ícones lucide aparecem em quase tudo (livro no manual, download, arquivo no rodapé, livro no aviso, globo/arquivo/robô na exportação). O robô em "Markdown para IA" é o clichê "IA = robozinho".

## Critérios de aceite
- [x] Saem os ícones que não ajudam a reconhecer a ação: BookOpen (manual), FileText (rodapé), BookCheck (aviso), Globe/FileText/Bot (exportação).
- [x] Os formatos de exportação mostram `.html`, `.pdf` e `.md` em mono grande no lugar do ícone.
- [x] Ícones que identificam ação sem texto (negrito, itálico, link) continuam, com nome acessível.

## Onde
`features/manuals/ManualSwitcher.tsx`, `layout/StatusBar.tsx`, `features/versions/PinnedNotice.tsx`, `features/export/ExportDialog.tsx`.

## Como verificar
Prints antes e depois; checagem do projeto; snapshot de acessibilidade sem botão sem nome.

## Registro
Commits: 205d9c4 (style(ui): tira ícones decorativos e mostra a extensão na exportação), 9beb364 (style(export): alarga a coluna da extensão para o .html caber).

O que foi feito: saíram BookOpen (ManualSwitcher), FileText (StatusBar), BookCheck (PinnedNotice) e Globe/FileText/Bot (formatos). Os formatos mostram `.html`, `.pdf` e `.md` em mono `text-lg`, `aria-hidden` (o nome do radio vem do rótulo e da dica). Coluna `w-14` porque o `.html` media 54 px e estourava `w-12`. Snapshot de acessibilidade sem botão sem nome. Revisão sem achados.

Lote 2: 41f51f8/9e78b09 alinhou a coluna de descrição do ShortcutsDialog; 25453de tirou os ícones do botão Exportar, de Versões e do ⋯. Atalhos aprovado no escuro (print em `C:/Users/PC/explicai-prints/p1/T-007/`).

Verificado no navegador (claro e escuro, 1280 e 375 px): `.html`, `.pdf` e `.md` cabem sem corte nem rolagem lateral na exportação; PinnedNotice só com texto. Fechado.

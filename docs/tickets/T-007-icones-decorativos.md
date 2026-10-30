# T-007: Tirar os ícones que só decoram e usar a extensão do arquivo na exportação

- Prioridade: P1
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Ícones lucide aparecem em quase tudo (livro no manual, download, arquivo no rodapé, livro no aviso, globo/arquivo/robô na exportação). O robô em "Markdown para IA" é o clichê "IA = robozinho".

## Critérios de aceite
- [ ] Saem os ícones que não ajudam a reconhecer a ação: BookOpen (manual), FileText (rodapé), BookCheck (aviso), Globe/FileText/Bot (exportação).
- [ ] Os formatos de exportação mostram `.html`, `.pdf` e `.md` em mono grande no lugar do ícone.
- [ ] Ícones que identificam ação sem texto (negrito, itálico, link) continuam, com nome acessível.

## Onde
`features/manuals/ManualSwitcher.tsx`, `layout/StatusBar.tsx`, `features/versions/PinnedNotice.tsx`, `features/export/ExportDialog.tsx`.

## Como verificar
Prints antes e depois; checagem do projeto; snapshot de acessibilidade sem botão sem nome.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

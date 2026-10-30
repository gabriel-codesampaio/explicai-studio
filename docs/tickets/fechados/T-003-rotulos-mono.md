# T-003: Usar rótulos de seção em mono maiúsculo, como no brand book

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Os rótulos de seção são texto cinza em frase comum ("Páginas", "Nesta página", "Formato"), o que soa genérico. O brand book usa rótulos em JetBrains Mono, maiúsculos e espaçados ("CORES", "LOGO").

## Critérios de aceite
- [x] Uma classe ou componente único de rótulo (mono, ~11px, maiúsculo, espaçado, cor de apoio) usado em todos os rótulos de seção.
- [x] Aplicado na barra lateral (Páginas), no índice (Nesta página), na exportação (Formato, Cor do manual), na marcação de imagem (Legenda, Áreas clicáveis, Destaques e setas) e na Aparência (Tema, Idioma).
- [x] Contraste do rótulo de pelo menos 4,5:1 nos dois temas.
- [x] Leitor de tela continua lendo o texto normal (o maiúsculo é só visual).

## Onde
`web/src/styles/` (classe), `layout/Sidebar.tsx`, `features/editor/PageOutline.tsx`, `features/export/ExportDialog.tsx`, `features/annotations/AnnotationList.tsx`, `features/settings/AppearancePanel.tsx`.

## Como verificar
Prints antes e depois em 1440 px nos dois temas; checagem do projeto.

## Registro
Commit: 77a41f9 (style(ui): usa rótulo mono maiúsculo nas seções, como no brand book).

O que foi feito: utilitário `rotulo` em `web/src/styles/base.css` (mono 11px, maiúsculo só no CSS, `--muted-foreground`), aplicado em Sidebar, PageOutline, ExportDialog, AnnotationList, AppearancePanel e ShortcutsDialog. Contraste medido: 5,53:1 a 6,41:1 no claro, 6,99:1 a 8,13:1 no escuro.

Verificação: design aprovou o escuro a 1440 (lote 1) e o claro a 1440 (lote 2: JetBrains Mono 11px, maiúsculo, rgb(87,94,120) em "Manual", "Páginas", Aparência e Atalhos). Prints em `C:/Users/PC/explicai-prints/p1/T-003/`. Revisão sem achados.

Ficou de fora: "Nesta página", exportação e legendas não foram vistos no claro (mesmo utilitário).

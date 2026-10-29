# T-003: Usar rótulos de seção em mono maiúsculo, como no brand book

- Prioridade: P1
- Status: aberto
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Os rótulos de seção são texto cinza em frase comum ("Páginas", "Nesta página", "Formato"), o que soa genérico. O brand book usa rótulos em JetBrains Mono, maiúsculos e espaçados ("CORES", "LOGO").

## Critérios de aceite
- [ ] Uma classe ou componente único de rótulo (mono, ~11px, maiúsculo, espaçado, cor de apoio) usado em todos os rótulos de seção.
- [ ] Aplicado na barra lateral (Páginas), no índice (Nesta página), na exportação (Formato, Cor do manual), na marcação de imagem (Legenda, Áreas clicáveis, Destaques e setas) e na Aparência (Tema, Idioma).
- [ ] Contraste do rótulo de pelo menos 4,5:1 nos dois temas.
- [ ] Leitor de tela continua lendo o texto normal (o maiúsculo é só visual).

## Onde
`web/src/styles/` (classe), `layout/Sidebar.tsx`, `features/editor/PageOutline.tsx`, `features/export/ExportDialog.tsx`, `features/annotations/AnnotationList.tsx`, `features/settings/AppearancePanel.tsx`.

## Como verificar
Prints antes e depois em 1440 px nos dois temas; checagem do projeto.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

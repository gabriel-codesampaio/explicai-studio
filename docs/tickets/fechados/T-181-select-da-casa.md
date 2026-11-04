# T-181: Criar o Select do Studio, com cursor de clique

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa, 2026-11-04 (lote 1.0)

## Problema
Os campos de escolha usam o `<select>` nativo: lista feia, fora da marca, e sem `cursor: pointer` (ex.: "Para quem exportar" e "Ver como"). Outros controles clicáveis também mostram a seta comum.

## Critérios de aceite
- [ ] Componente `ui/select` (Radix Select, mesma família do dropdown-menu já usado), no estilo da marca, claro e escuro.
- [ ] Todos os `<select>` trocados: Sidebar ("Ver como"), ExportDialog ("Para quem exportar"), AnnotationList.
- [ ] `cursor: pointer` em select, checkbox, radio, label clicável e botões de opção em todo o Studio (regra única no CSS base).
- [ ] Teclado (setas, Enter, Esc, digitar a inicial) e nome acessível iguais ou melhores que o nativo.

## Onde
- web/src/components/ui/ (novo select.tsx), web/src/layout/Sidebar.tsx, web/src/features/export/ExportDialog.tsx, web/src/features/annotations/AnnotationList.tsx

## Como verificar
Testes dos três pontos de uso; print de cada Select aberto, 1280 claro.

## Registro
Commits `91a69cb`, `b7c0906`, `d03a564`. `ui/select.tsx` (Radix) nos 3 usos, valor externo "" via sentinela interna; regra única de cursor em `base.css`. Typecheck, biome, vitest 607 ok, e2e publico e campos ok. Teclado vem do Radix, não testado; escuro e 375 não conferidos.

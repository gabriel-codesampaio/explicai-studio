# T-012: Marcações como no brand book

- Prioridade: P2
- Tamanho: G
- Status: aberto
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
No brand book o alvo ganha contorno tracejado com o número no canto; no Studio o tracejado é a área clicável e o marcador é um círculo cheio que some sobre print azul. O destaque vira um cinza-roxo sobre fundos escuros. No tema escuro, a anotação não usa o #7088FF do brand book.

## Critérios de aceite
- [ ] Marcador com o desenho do brand book (contorno tracejado e número no canto) e contraste não textual de pelo menos 3:1 sobre print claro e escuro.
- [ ] Destaque com cara de marca-texto de verdade (amarelo com multiply) sobre prints claros, e legível sobre prints escuros.
- [ ] Área clicável continua diferente do marcador.
- [ ] O mesmo desenho no editor e no HTML exportado; no tema escuro do Studio, a cor de anotação do brand book.
- [ ] Coordenadas e formato dos JSONs de marcação não mudam.

## Onde
`features/annotations/AnnotationOverlay.tsx`, `features/annotations/AnnotationLegend.tsx`, `styles/tokens.css`, `src/core/export/html.ts`.

## Como verificar
Teste de exportação do HTML das marcações; prints sobre print claro e escuro.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

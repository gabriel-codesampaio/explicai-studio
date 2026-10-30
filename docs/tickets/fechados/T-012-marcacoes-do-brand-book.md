# T-012: Marcações como no brand book

- Prioridade: P2
- Tamanho: G
- Status: feito
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
No brand book o alvo ganha contorno tracejado com o número no canto; no Studio o tracejado é a área clicável e o marcador é um círculo cheio que some sobre print azul. O destaque vira um cinza-roxo sobre fundos escuros. No tema escuro, a anotação não usa o #7088FF do brand book.

## Critérios de aceite
- [x] Marcador com o desenho do brand book (contorno tracejado e número no canto) e contraste não textual de pelo menos 3:1 sobre print claro e escuro.
- [x] Destaque com cara de marca-texto de verdade (amarelo com multiply) sobre prints claros, e legível sobre prints escuros.
- [x] Área clicável continua diferente do marcador.
- [x] O mesmo desenho no editor e no HTML exportado; no tema escuro do Studio, a cor de anotação do brand book.
- [x] Coordenadas e formato dos JSONs de marcação não mudam.
- [x] Seta (AnnotationOverlay e `.arrows line/polygon` do export em `src/core/export/html.ts`): ponta fechada (triângulo preenchido), centrada no fim da haste e girada no ângulo dela, proporcional à espessura, igual no editor e no HTML/PDF, em qualquer ângulo e em setas curtas (hoje a ponta aparece como traço solto em diagonal).
- [x] Legenda das marcações (AnnotationLegend, `.legend` no export): respiro entre o print e a legenda; espaço vertical uniforme e mais compacto entre itens; número e texto na mesma linha de base; igual no editor e no export, claro e escuro. Itens "Sem descrição" em série com tratamento menos repetitivo (o design decide).

## Onde
`features/annotations/AnnotationOverlay.tsx`, `features/annotations/AnnotationLegend.tsx`, `styles/tokens.css`, `src/core/export/html.ts`.

## Como verificar
Teste de exportação do HTML das marcações; prints sobre print claro e escuro.

## Registro
Commits: f142e55 (export, geometria pura e testes) e 6be64a9 (editor e tokens).

O que foi feito: `arrowShape` e `legendRows` são funções puras (`src/core/export/annotationShapes.ts`, cópia em `web/src/lib/annotationShapes.ts`; `test/annotation-shapes.test.ts` confere ângulos, seta curta, comprimento zero e que as duas cópias dão o mesmo resultado). Seta: haste que termina dentro de uma ponta triangular fechada (4,5 x espessura, no máximo 70% do comprimento), com contorno branco para ler sobre print escuro. Marcador: anel tracejado com o número num selo no canto, com filete branco dos dois lados (3:1 sobre print claro e escuro). Destaque: borda amarela mais preenchimento amarelo com `multiply`. Legenda: 12 px de respiro, 2 px entre linhas, `align-items: baseline`, marcadores sem descrição em sequência dividem uma linha ("2 3 4 Sem descrição"). Tema escuro do Studio: `--anotacao` #7088ff e `--sobre-anotacao` (número em nanquim). CSS do export em `annotationCss.ts`. O JSON de marcação não mudou.

Verificação: `npm run check` (331 testes) verde; Chrome nos temas claro e escuro, print claro e escuro, e no HTML exportado.

Ficou de fora: no export a seta escala com a imagem (espessura 0,5% do lado maior), então sai mais fina que no editor (3,5 px fixos) quando o print aparece reduzido; o export não tem tema escuro. Janela do Chrome DevTools não passou de 500 px de largura, então 375 não foi medido.

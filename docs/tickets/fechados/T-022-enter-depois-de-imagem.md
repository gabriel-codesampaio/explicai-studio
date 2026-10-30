# T-022: Corrigir o Enter que não cria parágrafo em página com imagem vinda do Markdown

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: Prints de referência do P1 (design, 2026-10-29)

## Problema
Numa página salva como Markdown com `texto + ![Tela](../assets/tela.png) + texto` (o formato documentado, o mesmo que o explicai-mcp grava), o Enter não faz nada: nem pelo teclado nem por `splitBlock`, e o console fica limpo. A imagem aparece no DOM como `span.react-renderer.node-image` direto na raiz do documento. Numa página sem imagem o Enter funciona. Suspeita: nó de imagem inline no topo do schema.

## Critérios de aceite
- [x] Numa página criada pela API com texto, imagem e texto, o Enter no texto cria um parágrafo novo.
- [x] Abrir e salvar essa página não perde a imagem nem a legenda (`web/test/markdown.test.ts`).

## Onde
`web/src/features/editor/extensions.ts`, nó de imagem.

## Como verificar
Teste de ida e volta do Markdown; e2e que cria a página pela API e tecla Enter.

## Registro
Commit: 3c3d2b3 (fix(editor): manter imagem solta dentro de parágrafo para o Enter funcionar).

Causa: o `Paragraph.parseMarkdown` do Tiptap desembrulha o parágrafo que só tem uma imagem; como a imagem é inline, ela ficava solta na raiz do documento, onde o `splitBlock` não age. O que foi feito: `ImageSafeParagraph` em `extensions.ts` embrulha de volta em parágrafo a imagem que o parse original devolve; o StarterKit usa `paragraph: false`. Formato salvo não muda. `@tiptap/extension-paragraph` declarado no package.json (3.32.0, MIT, já vinha pelo starter-kit).

Verificação: `web/test/enterAfterImage.test.ts` (splitBlock cria parágrafo), caso de ida e volta em `web/test/markdown.test.ts`, e2e em `e2e/studio.e2e.ts` (página criada pela API, Enter passa de 3 para 4 parágrafos). `npm run check` 96 testes e `npm run test:e2e` 13 testes verdes. Revisão sem achados que bloqueiem.

Ficou de fora: ida e volta de imagem solta dentro de item de lista e de citação não tem teste próprio (sugestão da revisão).

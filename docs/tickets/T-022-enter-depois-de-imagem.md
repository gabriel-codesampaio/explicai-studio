# T-022: Corrigir o Enter que não cria parágrafo em página com imagem vinda do Markdown

- Prioridade: P1
- Status: aberto
- Agente: frontend
- Origem: Prints de referência do P1 (design, 2026-10-29)

## Problema
Numa página salva como Markdown com `texto + ![Tela](../assets/tela.png) + texto` (o formato documentado, o mesmo que o explicai-mcp grava), o Enter não faz nada: nem pelo teclado nem por `splitBlock`, e o console fica limpo. A imagem aparece no DOM como `span.react-renderer.node-image` direto na raiz do documento. Numa página sem imagem o Enter funciona. Suspeita: nó de imagem inline no topo do schema.

## Critérios de aceite
- [ ] Numa página criada pela API com texto, imagem e texto, o Enter no texto cria um parágrafo novo.
- [ ] Abrir e salvar essa página não perde a imagem nem a legenda (`web/test/markdown.test.ts`).

## Onde
`web/src/features/editor/extensions.ts`, nó de imagem.

## Como verificar
Teste de ida e volta do Markdown; e2e que cria a página pela API e tecla Enter.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

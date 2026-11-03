# T-117: Tamanho de exibição da imagem (Pequena, Média, Larga)

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend (+ design, qa)
- Origem: `docs/discovery/dimensionar-imagens.md`, opção A e rascunho de spec. Decisões da pessoa em 2026-11-03.

## Decisões
- Opção fixa, sem arrastar a borda.
- O tamanho vale para a imagem em todo lugar. Fica em `assets/<imagem>.json` como `display: "s"|"m"|"full"` e não é guardado por página.
- Pequena com 4 ou mais marcadores: avisa e não bloqueia.

## Critérios de aceite
- [ ] Ao selecionar a imagem no editor, aparecem 3 botões com texto em pt-BR e en, com o ativo indicado. Sem escolha, o comportamento é o atual.
- [ ] A escolha grava `display` em `assets/<imagem>.json` de forma atômica (cria o arquivo se não existir) e `version` fica em 1.
- [ ] `parseAnnotations` preserva `display` e ignora valor fora de `s|m|full`. Arquivo antigo abre e exporta igual, e abrir não regrava.
- [ ] O MCP `annotate_image` não apaga `display` ao regravar (teste).
- [ ] Editor e HTML exportado mostram o mesmo tamanho relativo. As marcações ficam sobre o mesmo pixel em todos os tamanhos.
- [ ] Nenhum tamanho amplia a imagem acima do natural.
- [ ] PDF: Média e Pequena respeitam a coluna, e Larga cabe na página.
- [ ] O Markdown exportado e a página `.md` não mudam.
- [ ] Imagem sem uso que vai para `.lixeira/` leva o JSON junto.
- [ ] Aviso no editor quando a imagem está em Pequena e tem 4 ou mais marcadores.
- [ ] Item novo em `docs/manual-format.md`.

## Riscos
Largura em percentual no `.frame` (`fit-content`) fica circular, então ela vai no `.shot`. Os marcadores de 24 px são fixos.

## Como verificar
`npm run check`. Vitest com `--maxWorkers=2`, Playwright com `--workers=2` só nos specs da área, com uma largura e um tema.

## Registro
<!-- preenchido ao fechar -->

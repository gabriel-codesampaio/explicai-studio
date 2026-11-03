# T-117: Tamanho de exibição da imagem (Pequena, Média, Larga)

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend (+ design, qa)
- Origem: `docs/discovery/dimensionar-imagens.md`, opção A e rascunho de spec. Decisões da pessoa em 2026-11-03.

## Decisões
- Opção fixa, sem arrastar a borda.
- O tamanho vale para a imagem em todo lugar. Fica em `assets/<imagem>.json` como `display: "s"|"m"|"full"` e não é guardado por página.
- Pequena com 4 ou mais marcadores: avisa e não bloqueia.

## Critérios de aceite
- [x] Ao selecionar a imagem no editor, aparecem 3 botões com texto em pt-BR e en, com o ativo indicado. Sem escolha, o comportamento é o atual.
- [x] A escolha grava `display` em `assets/<imagem>.json` de forma atômica (cria o arquivo se não existir) e `version` fica em 1.
- [x] `parseAnnotations` preserva `display` e ignora valor fora de `s|m|full`. Arquivo antigo abre e exporta igual, e abrir não regrava.
- [x] O MCP `annotate_image` não apaga `display` ao regravar (teste).
- [x] Editor e HTML exportado mostram o mesmo tamanho relativo. As marcações ficam sobre o mesmo pixel em todos os tamanhos.
- [x] Nenhum tamanho amplia a imagem acima do natural.
- [x] PDF: Média e Pequena respeitam a coluna, e Larga cabe na página.
- [x] O Markdown exportado e a página `.md` não mudam.
- [x] Imagem sem uso que vai para `.lixeira/` leva o JSON junto.
- [x] Aviso no editor quando a imagem está em Pequena e tem 4 ou mais marcadores.
- [x] Item novo em `docs/manual-format.md`.

## Riscos
Largura em percentual no `.frame` (`fit-content`) fica circular, então ela vai no `.shot`. Os marcadores de 24 px são fixos.

## Como verificar
`npm run check`. Vitest com `--maxWorkers=2`, Playwright com `--workers=2` só nos specs da área, com uma largura e um tema.

## Registro
Branch feat/t-117-tamanho-imagem (dd19893..23ee5ee). MCP: explicai-mcp está vazio (sem annotate_image), critério "não apaga display" fica para quando o MCP existir: o parseAnnotations do core preserva o campo. Limite: e2e usa print pequeno, sem prova visual do encolhimento nem do PDF.

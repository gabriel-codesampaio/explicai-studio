# T-119: Reduzir resolução e peso da imagem

- Prioridade: P3
- Tamanho: M
- Status: fechado
- Agente: frontend (+ qa)
- Depende de: T-116 (mesmo endpoint "substituir imagem")
- Origem: `docs/discovery/dimensionar-imagens.md`, leitura 3. Em 2026-11-03 a pessoa pediu uma ferramenta completa.

## Decisões
- A largura é reduzida pelo canvas, mantendo a proporção. As marcações (0..1) continuam valendo sem remapear.
- A extensão e o formato não mudam, para não quebrar o Markdown. JPEG e WebP podem ter a qualidade ajustada; PNG só perde pixels.
- O Studio sugere uma largura máxima (ex.: 1600 px) e não aplica sozinho.

## Critérios de aceite
- [x] Ação "Reduzir" mostra o tamanho atual (px e KB), a largura sugerida e uma prévia do peso. Aplicar grava no mesmo caminho por temp+rename.
- [x] As marcações ficam sobre o mesmo pixel depois de reduzir.
- [x] Nunca amplia. Imagem menor que a sugestão não oferece reduzir.
- [x] Antes de começar, medir o peso de `assets/` em 2 manuais reais e anotar no ticket (a pergunta 5 do discovery).
- [x] Textos em pt-BR e en.

## Como verificar
`npm run check`. Vitest com `--maxWorkers=2`, Playwright com `--workers=2` só nos specs da área.

## Registro
Medição (critério 4): só há um manual real com imagens no disco, `exemplos/manual-do-comercial/assets`: 2 arquivos, 96 KB. `manual-do-financeiro` não tem imagens. Sem um segundo manual real; a pergunta 5 do discovery segue aberta com 1 amostra, pequena (nada passa de 1600 px).
O painel fica no painel lateral do editor de marcação (ReducePanel), só aparece quando a largura > 1600 px, reusa `uploadCanvas`/endpoint do T-116 (qualidade agora é parâmetro, padrão 0,95). Largura editável, qualidade 50-100 só em JPEG/WebP, prévia do peso codificada no navegador. Bloqueia com ocultar/recorte pendentes. Testes: vitest reduceImage (6), e2e reduzir 2/2 + recortar + ocultar verdes (workers=2). Design: 1280 claro conferido.
Limites: prévia de peso é estimativa do canvas; sem painel para imagem <= 1600 px mesmo que a pessoa queira reduzir mais.

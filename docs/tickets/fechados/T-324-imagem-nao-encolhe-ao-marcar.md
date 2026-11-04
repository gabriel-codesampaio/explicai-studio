# T-324: Imagem do diálogo de marcação não muda de tamanho enquanto se marca

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: regressão do E2E `studio.imagem.e2e.ts:385`, 2026-11-04 (depois de T-194/T-323)

## Problema
No diálogo Editar imagem, a imagem encolhe quando a lista de legendas e o painel Estilo crescem. O ponto em que a pessoa vai clicar se mexe entre um marcador e outro.

## Critérios de aceite
- [x] Largura da imagem fixa enquanto o diálogo está aberto: a coluna do painel rola por dentro, sem empurrar a imagem.
- [x] Medido por script: a caixa da imagem não muda ao criar 5 marcadores, em 1280 e 375 px.
- [x] Sem rolagem lateral (T-323 continua valendo).

## Registro
Sem mudança de código: não reproduz no HEAD. A queixa vinha de `dist/` desatualizado (o e2e roda o build; antes do `npm run build` o diálogo ainda era o antigo, com timeout no 375). Já corrigido por T-264/3770781 (layout `minmax(0,1fr)_20rem`, painel em coluna própria).
Medido (Playwright headless, 7 marcadores, `getBoundingClientRect` da imagem antes/depois, caixa idêntica a cada clique):
- 1280x800: x=213 w=514 h=514 antes e depois; 1280x520: x=288 w=364 h=364.
- 375x812 e 375x500: x=24.5 w=326 h=326.
- `documentElement.scrollWidth == clientWidth` em todos (sem rolagem lateral, T-323 ok).
E2E `studio.imagem.e2e.ts:385` passa. Script descartável, fora do repo.

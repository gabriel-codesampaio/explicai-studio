# T-324: Imagem do diálogo de marcação não muda de tamanho enquanto se marca

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: regressão do E2E `studio.imagem.e2e.ts:385`, 2026-11-04 (depois de T-194/T-323)

## Problema
No diálogo Editar imagem, a imagem encolhe quando a lista de legendas e o painel Estilo crescem. O ponto em que a pessoa vai clicar se mexe entre um marcador e outro.

## Critérios de aceite
- [ ] Largura da imagem fixa enquanto o diálogo está aberto: a coluna do painel rola por dentro, sem empurrar a imagem.
- [ ] Medido por script: a caixa da imagem não muda ao criar 5 marcadores, em 1280 e 375 px.
- [ ] Sem rolagem lateral (T-323 continua valendo).

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

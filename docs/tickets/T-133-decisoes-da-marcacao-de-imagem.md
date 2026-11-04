# T-133: Decisões da marcação de imagem

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: design
- Origem: [Discovery de marcação de imagem](../discovery/marcacao-de-imagem.md), perguntas para a pessoa

## Decisão da pessoa (2026-11-04)
"Sem preferências": valem as recomendações do discovery.

1. Marcador ao lado do alvo, com cauda, porque o disco cobre o botão que o passo explica.
2. A linha "Sem descrição" sai do export, e a checagem do Studio passa a avisar.
3. Ocultar dado sensível: já feito (T-116).
4. Retângulo só de contorno: espera o uso real. Fora deste ticket.
5. Fixar o disco em 24 px só depois de medir num print real.

## Critérios de aceite
- [ ] Marcador com cauda no Studio e no export, em HTML e PDF. A posição gravada continua sendo o alvo. Manual antigo exibe igual ou melhor, sem perder marcador.
- [ ] Marcador sem descrição não gera linha na legenda em HTML, PDF e Markdown (`noDescription`, `legendRows`). `checkManual` e o Studio avisam.
- [ ] Medida do disco em print real registrada aqui, em 1280 e 375, com a decisão de tamanho.
- [ ] Sem cauda fora da imagem nem sobre outro marcador nos exemplos do repositório.

## Como verificar
Print em 375 e 1280, claro e escuro. `/impeccable audit`. E2e de marcação.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

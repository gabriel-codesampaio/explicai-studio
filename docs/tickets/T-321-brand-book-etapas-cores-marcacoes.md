# T-321: Atualizar o brand book com etapas, cores e marcações novas

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: design
- Marco: 0.9 (depois de T-193, T-194 e T-195)
- Origem: conferência do brand book, 2026-11-04

## Problema
O brand book não documenta as etapas da página (Rascunho, Em revisão, Aprovado, Publicado) nem as cores semânticas do Studio. Também descreve a marcação só em cobalto e marca-texto; com estilo por marcador, cada item pode ter cor e borda próprias, e o destaque ganha paleta própria.

## Critérios de aceite
- [ ] `explicai-brandbook/index.html` documenta etapas, cores semânticas e opções de marcação, com os valores de `web/src/styles/tokens.css`.
- [ ] `docs/marca-resumo.md` diz o padrão (cobalto, marca-texto) e o que dá para personalizar.
- [ ] Contraste de cada cor nova medido por script nos temas claro e escuro.

## Como verificar
Comparar os valores do brand book com `tokens.css` e a paleta do T-195; página publicada igual ao repositório.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

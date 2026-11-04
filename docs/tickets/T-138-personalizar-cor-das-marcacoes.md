# T-138: Personalizar a aparência das marcações de imagem

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04) e [discovery](../discovery/personalizar-marcacoes.md)

## Problema
Marcador e seta saem azuis com borda branca, destaque com borda amarela, e a pessoa não vê como mudar. A cor por manual já existe (`theme.accent` e `theme.highlight`, com trava `MIN_CONTRAST`), mas está escondida em "Cores do manual".

## Corte recomendado
- **Fase A (P, sem formato):** controle "cor das marcações" com prévia (marcador, seta, destaque) no diálogo de cores do manual, avisando que `accent` também muda links e passos. Sem campo novo, sem mexer no MCP nem no export.
- **Fase B (M, depois do T-133):** `style` opcional na raiz de `assets/<imagem>.json`, como `display`. Cor por chave de paleta fechada (5 a 6), tamanho do marcador e espessura em 3 degraus. `version` continua 1. HTML e PDF usam variáveis CSS no `.frame`.

## Critérios de aceite
- [ ] A: o diálogo mostra prévia das marcações com a cor escolhida e o aviso sobre links e passos. Trava de contraste mantida.
- [ ] B: manual antigo, sem `style`, exibe idêntico ao de hoje (teste de formato em `docs/manual-format.md`).
- [ ] B: `style` aparece igual no Studio, no HTML e no PDF; contraste das chaves da paleta medido por script, todas acima de `MIN_CONTRAST`.
- [ ] B: `annotate_image` aceita e preserva `style`, sem apagá-lo ao regravar.
- [ ] Cor nunca é o único sinal: número, ponta cheia e tracejado seguem legíveis em preto e branco.
- [ ] `/impeccable audit` e e2e de marcação.

## Decisões em aberto (da pessoa; recomendação entre parênteses)
1. Separar a cor das marcações da cor de destaque do manual? (Só na B; na A, avisar na tela.)
2. Escopo: manual, imagem ou marcação? (Manual agora, imagem depois, marcação não.)
3. Cor livre ou paleta fechada? (Paleta fechada nas marcações; hex livre só no tema.)
4. Tamanho e espessura junto? (Esperar o T-133 medir o disco, depois 3 degraus.)
5. O MCP escolhe estilo? (Só lê e preserva.)
6. Numeração em letras, estilo de seta e contorno ficam fora? (Sim.)

## Como verificar
Print em 375 e 1280, claro e escuro. Exportar HTML e PDF de manual antigo e novo.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

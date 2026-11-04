# T-138: Personalizar a aparência das marcações de imagem

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04) e [discovery](../discovery/personalizar-marcacoes.md)
- Depende de: T-133

## Problema
Marcador e seta saem azuis com borda branca, destaque com borda amarela, e a pessoa não vê como mudar. A cor por manual já existe (`theme.accent` e `theme.highlight`, com trava `MIN_CONTRAST`), mas está escondida em "Cores do manual".

## Decisão da pessoa (2026-11-04)
"Fase B": personalização por imagem. A fase A do discovery (prévia no diálogo de cores do manual) sai deste ticket. Nos pontos que a pessoa não comentou, valem as recomendações do discovery.

## Escopo
Depende do T-133, que mede o disco do marcador.

`style` opcional na raiz de `assets/<imagem>.json`, como `display`. Cor por chave de paleta fechada (5 a 6), separada da cor de destaque do manual; tamanho do marcador e espessura em 3 degraus. `version` continua 1. HTML e PDF usam variáveis CSS no `.frame`.

Fora: estilo por marcação individual, cor livre por imagem, estilos de seta e contorno, numeração em letras, padrão global. O MCP não escolhe estilo: só lê e preserva.

## Critérios de aceite
- [ ] Manual antigo, sem `style`, exibe idêntico ao de hoje (teste de formato em `docs/manual-format.md`).
- [ ] `style` aparece igual no Studio, no HTML e no PDF; contraste das chaves da paleta medido por script, todas acima de `MIN_CONTRAST`.
- [ ] `annotate_image` preserva `style`, sem apagá-lo ao regravar.
- [ ] Cor nunca é o único sinal: número, ponta cheia e tracejado seguem legíveis em preto e branco.
- [ ] `/impeccable audit` e e2e de marcação.

## Como verificar
Print em 375 e 1280, claro e escuro. Exportar HTML e PDF de manual antigo e novo.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-192: Número centrado no marcador e na legenda

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: discovery [personalizar-marcacoes](../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 3

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Corrige N1.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [ ] Um só estilo do número para disco, chip da legenda (Studio e export) e passos, com `text-box: trim-both cap alphabetic` sob `@supports` e `line-height:1` como piso.
- [ ] Medida: desvio do glifo ao centro do disco ≤ 0,5 px a 20, 24 e 32 px, com JetBrains Mono e com o fallback (fonte forçada), em Chrome; registrar Safari/Firefox se disponível.
- [ ] Número de dois dígitos continua centrado; três dígitos documentado (N2).

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

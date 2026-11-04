# T-192: Número centrado no marcador e na legenda

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: discovery [personalizar-marcacoes](../../discovery/personalizar-marcacoes.md), pedido da pessoa 2026-11-04 (lote 1.0), item 3

## Problema
Achados e medidas na discovery (seções "Problemas achados" e "Modelo de dados por marcador"). Corrige N1.

Decisões da pessoa (2026-11-04): estilo **por marcador**, com o estilo da imagem (T-138) como padrão; marcação nova nasce com o padrão da imagem; "nenhuma borda" vale para os 4 tipos (marcador, seta, destaque, área), mas destaque sem preenchimento e sem borda é recusado; setas: corrigir os quatro defeitos achados; destaque com paleta própria de marca-texto.

## Critérios de aceite
- [x] Um só estilo do número para disco, chip da legenda (Studio e export) e passos, com `text-box: trim-both cap alphabetic` sob `@supports` e `line-height:1` como piso.
- [ ] Medida: desvio do glifo ao centro do disco ≤ 0,5 px a 20, 24 e 32 px, com JetBrains Mono e com o fallback (fonte forçada), em Chrome; registrar Safari/Firefox se disponível. (Chip da legenda, lista e passos: 0 px. Disco: até 1 px por posição fracionária, ver T-221.)
- [x] Número de dois dígitos continua centrado; três dígitos documentado (N2).

## Como verificar
Os critérios acima, com medida por script Playwright (export HTML e editor), uma largura na fatia; matriz no fecho do lote.

## Registro
Commit `feat(annotations): número centrado pela altura das maiúsculas`.
- Chip da legenda (export e Studio), chip da lista e passos: `text-box: trim-both cap alphabetic` sob `@supports` com padding `(d - 1cap)/2`; fallback grid + `line-height:1`. Classe `num-chip` no Studio.
- Disco: `text-box` no `::before` e `line-height:1`.
- Medido (Chrome 156 headless, DSF 4, 1280, claro; ink do glifo contra o centro; JetBrains Mono e Consolas forçada): legenda export/Studio e chip da lista 0 px; passos ~0 px (clip aproximado); disco 20/24/32 entre -1,0 e +0,9 px no editor e no export. O desvio do disco vem da posição fracionária (translate), não do CSS: com a mesma regra, discos em frações .95 e .16 dão +0,3 e -0,7. Não atinge 0,5 px; aberto o T-221. Safari/Firefox não medidos.
- N2 (três dígitos no disco) segue só registrado.

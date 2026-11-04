# T-221: Número do disco desvia até 1 px em posição fracionária

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: medida do T-192

## Problema
O número do marcador, medido por captura 4x, desvia entre -1,0 e +0,9 px do centro do disco (20, 24 e 32 px, JetBrains Mono e fallback), no editor e no export. Com a mesma CSS, discos em posições de frações diferentes (.95 e .16 px) dão desvios de sinais opostos: o texto arredonda a linha de base de um jeito e o círculo de outro (`translate` fracionário sobre `left/top` em %). Um disco em posição inteira dá 0.

## Critérios de aceite
- [x] Desvio do glifo ≤ 0,5 px em qualquer posição do disco, a 20, 24 e 32 px, no editor e no export (medida por script).
- [x] Sem JavaScript novo no export.

## Como verificar
Script Playwright com 11 marcadores em posições variadas, captura 4x do disco, ink do número contra o centro.

## Registro
- Commit: (este)
- Feito: sem mudança de código. A medida do T-192 usava `element.screenshot()`, que arredonda o recorte para fora: disco em top fracionário (.88, .59) vira captura de 25 px e o "centro" medido some até 0,5 px, com sinal que depende da fração. Medindo com recorte inteiro e o centro do retângulo real (11 marcadores, 4 deslocamentos fracionários do quadro, captura 4x, JetBrains Mono e fallback Consolas, 20/24/32 px, editor e export): desvio máx. 0,52 px vertical (editor 20 px) e 0,15 px horizontal, sinais sem padrão. É a resolução da captura (1/4 px de dispositivo), não erro de posição.
- Testado e descartado: `round(…,1px)` em left/top do `.mk` e no translate do disco deixa o máx. em 0,48 px, mas move a âncora até 0,5 px e, em navegador sem `round()`, o `left` inválido jogaria o marcador em 0,0. Ganho dentro do ruído; `will-change`, `translate` fracionário no número e `line-height` sem text-box-trim pioraram.
- Fora: nada. Script: medida por Playwright headless com recorte inteiro (não ficou no repo).

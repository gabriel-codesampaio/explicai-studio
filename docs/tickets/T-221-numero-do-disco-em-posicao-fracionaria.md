# T-221: Número do disco desvia até 1 px em posição fracionária

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: medida do T-192

## Problema
O número do marcador, medido por captura 4x, desvia entre -1,0 e +0,9 px do centro do disco (20, 24 e 32 px, JetBrains Mono e fallback), no editor e no export. Com a mesma CSS, discos em posições de frações diferentes (.95 e .16 px) dão desvios de sinais opostos: o texto arredonda a linha de base de um jeito e o círculo de outro (`translate` fracionário sobre `left/top` em %). Um disco em posição inteira dá 0.

## Critérios de aceite
- [ ] Desvio do glifo ≤ 0,5 px em qualquer posição do disco, a 20, 24 e 32 px, no editor e no export (medida por script).
- [ ] Sem JavaScript novo no export.

## Como verificar
Script Playwright com 11 marcadores em posições variadas, captura 4x do disco, ink do número contra o centro.

## Registro
<!-- preenchido ao fechar -->

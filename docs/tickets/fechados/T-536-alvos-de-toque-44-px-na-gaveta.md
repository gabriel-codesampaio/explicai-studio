# T-536: Alvos de toque de 44 px na gaveta de páginas do celular

- Prioridade: P3
- Tamanho: M
- Status: fechado
- Agente: frontend (+ qa)
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B6 (Baixo, melhoria e não defeito)
- Relacionado: T-050, T-077 e T-174, fechados (alvos de toque).

## Problema
Na gaveta de páginas a 375 px, 15 de 36 controles têm menos de 44 px ("Nova subpágina" e "Mais ações" com 28x28; linhas de 35 px). Nada quebra (overflow 0), e o mínimo de WCAG 2.2 (24 px) já passa. Os 44 px são a recomendação de iOS, então é melhoria. Decisão da pessoa: subir a prioridade ou deixar P3.

## Critérios de aceite
- [x] Em `(pointer: coarse)`, os controles da gaveta de páginas têm alvo de 44 px, como o select já tem.
- [x] Sem overflow horizontal em 375 px.
- [x] Em ponteiro fino (desktop) o visual não muda.

## Onde
Gaveta de páginas (árvore) e o CSS de `pointer: coarse` que o select já usa. Esforço do relatório: M.

## Como verificar
`evaluate_script` medindo os alvos em 375 px com `pointer: coarse` emulado; axe na gaveta.

## Registro
- Fechado em feat/ui-lote3. pointer-coarse:size-11 / min-h-11 em Esconder, Buscar página, Nova página, linha da árvore e ícones + e ⋯ (PageActions). Desktop igual. e2e novo (375 px, toque): todos os botões visíveis da gaveta >= 44 px, sem overflow. Axe não rodado.

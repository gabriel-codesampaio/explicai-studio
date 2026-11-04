# T-168: Decidir a ordem dos controles acima do título no celular

- Prioridade: P3
- Tamanho: P
- Status: descartado
- Agente: design
- Origem: relatório UX 2026-11-04, achado A19 (avaliado no commit 60a0e3d)

## Problema
Achado A19. A 375 px, quatro linhas de controles ficam antes do título da página. PRODUCT.md pede só que o celular não quebre, então a equipe precisa decidir se o título deve aparecer na primeira tela.

## Critérios de aceite
- [x] Decisão registrada no Registro. Se a decisão for título visível sem rolar: o título aparece inteiro a 375x667 sem rolar.
- [x] Se a decisão for manter como está: fechar como descartado, com o motivo, citando o PRODUCT.md.

## Onde
- web/src/layout/PageView.tsx

## Como verificar
Abrir uma página em 375x667 e medir com evaluate_script a posição do título (`getBoundingClientRect().top`) antes e depois da mudança.

## Registro
Descartado por decisão da pessoa (2026-11-04), sem mudança de código. Medido a 375x667 numa página com título de duas linhas: o título vai de 178 a 269 px com mouse e de 201 a 292 px com toque, inteiro e sem rolar. O PRODUCT.md define uso em computador e pede só que o celular não quebre. Reabrir se o celular virar uso real.

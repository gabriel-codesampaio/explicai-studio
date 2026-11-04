# T-168: Decidir a ordem dos controles acima do título no celular

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: relatório UX 2026-11-04, achado A19 (avaliado no commit 60a0e3d)

## Problema
Achado A19. A 375 px, quatro linhas de controles ficam antes do título da página. PRODUCT.md pede só que o celular não quebre, então a equipe precisa decidir se o título deve aparecer na primeira tela.

## Critérios de aceite
- [ ] Decisão registrada no Registro. Se a decisão for título visível sem rolar: o título aparece inteiro a 375x667 sem rolar.
- [ ] Se a decisão for manter como está: fechar como descartado, com o motivo, citando o PRODUCT.md.

## Onde
- web/src/layout/PageView.tsx

## Como verificar
Abrir uma página em 375x667 e medir com evaluate_script a posição do título (`getBoundingClientRect().top`) antes e depois da mudança.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

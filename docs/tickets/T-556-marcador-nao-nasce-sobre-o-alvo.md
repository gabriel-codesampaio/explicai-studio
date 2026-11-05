# T-556: Marcador não nasce em cima do alvo; refazer anotações do exemplo financeiro

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [critique 2026-11-05 (27/40)](../../.impeccable/critique/2026-11-05T12-50-20Z__web-src-app-tsx.md)

## Problema
No editor de imagem o marcador nasce sobre o alvo e o tapa. No exemplo `docs/exemplo/financeiro`: marcador 1 tapa "Novo cliente", a seta termina no texto, o destaque cobre a lateral. Junta T-535 (mojibake "CobranÃ§as").

## Critérios de aceite
- [ ] Marcador novo nasce encostado fora do alvo (ou número+seta juntos), sem cobrir o alvo.
- [ ] Print e anotações de `docs/exemplo/financeiro` refeitos: marcador não tapa texto, seta termina no alvo, destaque não cobre a lateral.
- [ ] Cobre T-535 (sem mojibake nas imagens do exemplo); fechar T-535 como coberto.
- [ ] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Como verificar
Teste de unidade do que for lógica; conferir a tela com script Playwright (uma largura, um tema) e medir com `evaluate_script`/script.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

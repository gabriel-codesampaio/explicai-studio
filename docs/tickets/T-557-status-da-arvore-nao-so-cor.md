# T-557: Status da árvore não depende só de cor

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: [critique 2026-11-05 (27/40)](../../.impeccable/critique/2026-11-05T12-50-20Z__web-src-app-tsx.md)

## Problema
O status das páginas na árvore é só cor; "Publicado" (cobalto) se confunde com número/link.

## Critérios de aceite
- [ ] Legenda de uma linha no cabeçalho PÁGINAS e `title` no hover.
- [ ] "Publicado" com forma diferente (bolinha cheia x anel), além da cor.
- [ ] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Como verificar
Teste de unidade do que for lógica; conferir a tela com script Playwright (uma largura, um tema) e medir com `evaluate_script`/script.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

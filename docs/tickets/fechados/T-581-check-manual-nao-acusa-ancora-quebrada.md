# T-581: check_manual não acusa âncora interna quebrada

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: prova do T-178 (2026-11-06)

## Problema
Na importação do MD de prova, `[relatório diário](#relatorio)` não tem destino na página e o `check_manual` não acusou (só o link `guia-antigo.md` apareceu como `dead-link`). Link `#âncora` quebrado chega ao leitor sem aviso.

## Critérios de aceite
- [x] `check_manual` (core, `explicai`) acusa `#âncora` sem título correspondente na página, com teste.

## Como verificar
Página com `[x](#nao-existe)` e `check_manual` listando o achado.

## Registro
2026-11-06. `checkManual` (src/core/check.ts) compara cada `#âncora` com os títulos da página (mesmo `slugify` do export; fora de bloco de código) e acusa `dead-link` "Âncora sem título na página: #x". Sem mudar o formato nem os tipos. Teste em test/check-manual.test.ts (vermelho antes, verde depois); vitest completo 900/900. Limite: `arquivo.md#x` não confere o título da outra página (comentário `shortcut` no código).

# T-581: check_manual não acusa âncora interna quebrada

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: prova do T-178 (2026-11-06)

## Problema
Na importação do MD de prova, `[relatório diário](#relatorio)` não tem destino na página e o `check_manual` não acusou (só o link `guia-antigo.md` apareceu como `dead-link`). Link `#âncora` quebrado chega ao leitor sem aviso.

## Critérios de aceite
- [ ] `check_manual` (core, `explicai`) acusa `#âncora` sem título correspondente na página, com teste.

## Como verificar
Página com `[x](#nao-existe)` e `check_manual` listando o achado.

## Registro
<!-- preenchido ao fechar -->

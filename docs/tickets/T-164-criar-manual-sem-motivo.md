# T-164: Explicar por que o botão Criar manual está desabilitado

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A15 (avaliado no commit 60a0e3d)

## Problema
Achado A15. O botão Criar manual fica desabilitado sem explicar por quê. A pessoa não sabe o que falta preencher.

## Critérios de aceite
- [ ] Com o botão desabilitado, um texto ao lado diz o que falta (ex.: "Dê um nome ao manual").
- [ ] O texto fica ligado ao botão (`aria-describedby`), para leitor de tela.
- [ ] Com o campo preenchido, o botão habilita e o texto some.

## Onde
- web/src/features/manuals/CreateManual.tsx

## Como verificar
Abrir a tela de criar manual com o campo vazio: o motivo aparece. Preencher: o botão habilita. Conferir o nome acessível do botão no axe.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

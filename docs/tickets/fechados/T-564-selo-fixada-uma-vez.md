# T-564: Selo "Fixada no manual" aparece uma vez na página

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: design do lote 1 (PR #127/#128), achado fora do escopo

## Problema
Com versão fixada o selo aparece 3 vezes: botão Versões, junto ao título e na linha da versão. Decisão proposta: manter só o selo junto ao título (com 'Usar texto atual'); o botão Versões fica sem selo; a linha no diálogo mantém o estado (precisa para Desafixar).

## Critérios de aceite
- [x] Botão Versões sem o selo.
- [x] Selo junto ao título e estado na linha do diálogo continuam.
- [x] Textos em pt e en; sem regressão nos testes da área.

## Registro
Feito em `feat/ui-aparencia` (fc4f25a). Selo removido do botão Versões (prop `pinned` saiu); fica junto ao título e na linha do diálogo. Teste em `versionsPanel.test.tsx`.

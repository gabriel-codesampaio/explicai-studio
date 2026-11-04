# T-126: Piloto do MCP no CodeLab

- Prioridade: P1
- Tamanho: P
- Status: aberto
- Agente: supervisor
- Origem: decisão da pessoa (2026-11-03)
- Depende de: correção dos achados da revisão do T-122
- Bloqueia: T-123, T-124, T-125

## Problema
O MCP só passou por testes com dados de exemplo. Antes de gastar nas fases 2 e 3, é preciso saber se o manual sai inteligente. A inteligência vem do modelo e dos prompts, então um resultado fraco muda os prompts e os modelos, não o código.

## Critérios de aceite
- [ ] Em sessão nova, com o MCP registrado no Claude Code e a versão local do core, o modo guiado gera de 3 a 5 páginas de um manual de [codelab](https://github.com/gabriel-codesampaio/codelab), gravadas só pelas tools.
- [ ] Avaliação registrada por pergunta:
  - Organiza pelas tarefas de quem usa, ou pelas pastas do código?
  - Cada botão e tela têm origem no código, ou há invenção?
  - Lista o que não conseguiu confirmar, ou preenche com texto genérico?
  - Escreve para quem usa, sem jargão técnico?
  - Quanto do texto precisaria ser reescrito? Mais da metade reprova.
- [ ] Defeito nos prompts é corrigido antes do T-123. Defeito no código vira ticket.
- [ ] Sem banco e chaves, as páginas ficam com "Print pendente". O piloto não avalia marcadores.

## Como verificar
Abrir o resultado no Studio. A avaliação da equipe conhece o projeto e não substitui a de um usuário de fora.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

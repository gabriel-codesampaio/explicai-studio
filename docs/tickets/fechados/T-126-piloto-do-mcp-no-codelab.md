# T-126: Piloto do MCP no CodeLab

- Prioridade: P1
- Tamanho: P
- Status: feito
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
Aprovado, em 2026-11-04. Sessão separada (`claude -p`, Sonnet, só Read, Grep, Glob e as tools do MCP), prompt guiado vindo do servidor, 5 páginas e export HTML e Markdown. Abre no Studio sem erro. Gasto das duas etapas: 148 mil tokens novos, 1,6 milhão lidos de cache, 19,5 mil de saída.

- Organização: pelas tarefas do aluno (entrar, comprar, assistir, comentar, ranking). Passou.
- Fidelidade: 30 textos de tela conferidos por busca, todos no código (um com erro de digitação lá: "asssitido"). Os passos não foram conferidos rodando o sistema. Passou.
- Honestidade: parou antes de gravar, percebeu que 3 dos 4 prints são só de administrador, e avisou que o formulário de depoimento não existe no código. Passou.
- Público: linguagem de aluno, com um deslize (rota `/platform`). Passou.
- Reescrita: estimativa da equipe, bem abaixo de metade. Falta a opinião de quem usa.

Defeitos corrigidos nos prompts (explicai-mcp #4): importou print de administrador com nomes reais e sem avisar; "A confirmar" dentro da página; rota no texto; marcação estimada fora do relatório; rótulo dado como incerto, embora estivesse no código. Vários passos saíram sem "Resultado:": entra no `check_manual` do T-123. Não avaliado: marcadores vindos da tela real (T-123) e o modo autônomo.

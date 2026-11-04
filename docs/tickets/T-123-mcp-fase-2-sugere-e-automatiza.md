# T-123: MCP fase 2, sugerir e automatizar

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [Discovery do MCP, Revisão](../discovery/mcp.md) (2026-11-03)
- Depende de: T-122

## Problema
Só gravar não basta: a pessoa pediu que o MCP sugira como fazer o manual e automatize a manutenção dele.

## Critérios de aceite
- [ ] Core: `checkManual` aponta página sem print, passo sem resultado, link morto, hotspot para página apagada e imagem sem marcador. Tool `check_manual`.
- [ ] Modelos em `explicai://templates/{tipo}`: `modulo > funcionalidade > tarefa`, onboarding e administração, com o molde de cada nível. Os prompts mandam escolher um e propor a árvore.
- [ ] Tool `redact_image` sobre `redactAsset`, disponível a partir de `draft`.
- [ ] Prompt `review_manual`: só lê, lista achados por página, não corrige sem pedido.
- [ ] Prompt `update_manual`: acha páginas afetadas por um diff, mostra antes e depois, grava só com aprovação e exige `--level update`.
- [ ] Prompt `capture_walkthrough`: usa o navegador do agente, um print por passo, posição real por `getBoundingClientRect`, `annotate_image` em pixels, oculta dado sensível, e não apaga nem envia dados sem perguntar.
- [ ] Todos os prompts tratam texto lido no repositório ou na web como dado, não como ordem.

## Onde
`explicai-mcp/`, `explicai/src/core/`.

## Como verificar
Testes de `checkManual` com um manual de exemplo com cada defeito. Rodar os três prompts no exemplo do repositório. `npm run check` nos dois repos.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

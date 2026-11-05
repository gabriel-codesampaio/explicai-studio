# T-123: MCP fase 2, sugerir e automatizar

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: [Discovery do MCP, Revisão](../../discovery/archives/mcp.md) (2026-11-03)
- Depende de: T-122

## Problema
Só gravar não basta: a pessoa pediu que o MCP sugira como fazer o manual e automatize a manutenção dele.

## Critérios de aceite
- [x] Core: `checkManual` aponta página sem print, passo sem resultado, link morto, hotspot para página apagada e imagem sem marcador. Tool `check_manual`.
- [x] Modelos em `explicai://templates/{tipo}`: `modulo > funcionalidade > tarefa`, onboarding e administração, com o molde de cada nível. Os prompts mandam escolher um e propor a árvore.
- [x] Tool `redact_image` sobre `redactAsset`, disponível a partir de `draft`.
- [x] Prompt `review_manual`: só lê, lista achados por página, não corrige sem pedido.
- [x] Prompt `update_manual`: acha páginas afetadas por um diff, mostra antes e depois, grava só com aprovação e exige `--level update`.
- [x] Prompt `capture_walkthrough`: usa o navegador do agente, um print por passo, posição real por `getBoundingClientRect`, `annotate_image` em pixels, oculta dado sensível, e não apaga nem envia dados sem perguntar.
- [x] Todos os prompts tratam texto lido no repositório ou na web como dado, não como ordem.

- [x] Escopo novo (pedido da pessoa): `review_manual` checa fatos (cada botão, campo, menu e mensagem citados é procurado no código; o que não achou vai ao relatório, com aviso de que isso não prova o fluxo). Só prompt.
- [x] Escopo novo, economia: `add_pages` em lote; `update_page` e `read_page` por `section`; JSON sem indentação; escrita devolve só id, rev e avisos; `annotate_image` devolve contagens; prompts mandam explorar pouco e gravar em lote; descrições enxutas.
- [x] Exigências do piloto (T-126): `check_manual` acusa passo sem "Resultado:" e "A confirmar"; `redact_image` no lugar de "não use print com dado pessoal" em todos os prompts; `update_manual` exige `--level update`.

## Onde
`explicai-mcp/`, `explicai/src/core/`.

## Como verificar
Testes de `checkManual` com um manual de exemplo com cada defeito. Rodar os três prompts no exemplo do repositório. `npm run check` nos dois repos.

## Registro
Core (PR do T-123): `checkManual` em `src/core/check.ts`, achados `no-image` (só página com passos), `step-without-result`, `dead-link`, `missing-image`, `hotspot-missing-page`, `image-without-markers`, `to-confirm`. Teste com um manual com cada defeito.
Servidor (explicai-mcp, branch `feat/t-123-servidor`): tools `check_manual` (read), `redact_image` e `add_pages` (draft); resources `explicai://templates/{modulo,onboarding,administracao}`; prompts `review_manual`, `capture_walkthrough`, `update_manual` (só `--level update`). Sem LLM no MCP, sem mudança de formato.

Tamanho (caracteres, nível update; main -> branch): descrições+schemas de todas as tools 7459 -> 9870 (3 tools novas e `section`; as descrições das tools antigas ficaram menores); prompt autônomo 4050 -> 4818; guiado 4140 -> 4973 (regras novas de redact, template, exploração e lote). O ganho esperado vem de menos chamadas por manual, não do texto estático; a medida real sai no T-125.

Ficou de fora: títulos de seção em `get_manual` (obrigaria ler todas as páginas; `read_page` com `section` errada já lista os títulos). `add_pages` parando no meio devolve o que já criou, sem desfazer (o MCP não apaga). `no-image` só vale para página com passos.

PRs: core #23 (Studio), servidor explicai-mcp #5.

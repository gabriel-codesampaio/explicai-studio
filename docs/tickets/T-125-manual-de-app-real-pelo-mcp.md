# T-125: Manual de um app real feito com o MCP

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: supervisor
- Origem: pedido da pessoa (2026-11-03); alvo trocado em 2026-11-04
- Depende de: T-131, T-132

## Problema
Falta a primeira prova real do MCP de ponta a ponta. O alvo era o CodeLab, que já serviu de piloto (T-126). A pessoa trocou o alvo por um app de terceiro que roda localmente, com dois perfis (administrador e cliente) e um manual escrito à mão para comparar. O nome e o acesso ficam fora deste repositório, que é público.

## Critérios de aceite
- [ ] O manual é gravado só pelas tools do MCP, nunca por edição direta dos arquivos.
- [ ] Um manual cobre os dois perfis, com `audience`, e exporta uma versão para cada um.
- [ ] Texto, telas e passos vêm do código do app; o que não deu para confirmar fica listado no relatório.
- [ ] Nenhum segredo do app entra no manual. Prints com dados sensíveis são ocultados.
- [ ] Nada é gravado no repositório do app nem no banco dele. O manual fica fora do repositório.
- [ ] O manual abre no Studio sem erro. Exporta em HTML e Markdown.
- [ ] Custo em tokens comparado ao piloto: 148 mil novos, 1,6 milhão de cache, 19,5 mil de saída.
- [ ] Relatório do que precisou de correção à mão e da comparação com o manual escrito à mão. Defeito do MCP vira ticket.

## Como verificar
Abrir o manual no Studio com a pessoa.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

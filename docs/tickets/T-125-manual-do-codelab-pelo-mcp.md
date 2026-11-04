# T-125: Manual do CodeLab feito com o MCP

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: supervisor
- Origem: pedido da pessoa (2026-11-03)
- Depende de: T-124, T-131, T-132

## Problema
A pessoa pediu um manual de [gabriel-codesampaio/codelab](https://github.com/gabriel-codesampaio/codelab) feito com o MCP. É também a primeira prova real dele.

## Critérios de aceite
- [ ] O manual é gravado só pelas tools do MCP, nunca por edição direta dos arquivos.
- [ ] Texto, telas e passos vêm do código do projeto; o que não deu para confirmar fica listado no relatório.
- [ ] Nenhum segredo do projeto entra no manual. Prints com dados sensíveis são ocultados.
- [ ] O manual abre no Studio sem erro. Exporta em HTML e Markdown.
- [ ] Relatório do que precisou de correção à mão, para medir a qualidade do MCP. Defeito do MCP vira ticket.

## Como verificar
Abrir o manual no Studio com a pessoa.

Em aberto: o CodeLab usa Next.js, Prisma e Asaas. Rodá-lo para capturar prints pode exigir banco e chaves. Sem isso, as páginas ficam com "Print pendente" e a lista vai para a pessoa.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

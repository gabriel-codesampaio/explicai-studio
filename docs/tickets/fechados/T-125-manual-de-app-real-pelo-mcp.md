# T-125: Manual de um app real feito com o MCP

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: supervisor
- Origem: pedido da pessoa (2026-11-03); alvo trocado em 2026-11-04
- Dependia de: T-131, T-132

## Problema
Falta a primeira prova real do MCP de ponta a ponta. O alvo era o CodeLab, que já serviu de piloto (T-126). O alvo passou a ser um app de terceiro, mas o banco dele recusou a credencial local, e a pessoa voltou ao CodeLab, agora rodando com banco descartável e dados fictícios.

## Critérios de aceite
- [x] O manual é gravado só pelas tools do MCP, nunca por edição direta dos arquivos.
- [x] Um manual cobre os dois perfis, com `audience`, e exporta uma versão para cada um.
- [x] Texto, telas e passos vêm do código do app; o que não deu para confirmar fica listado no relatório.
- [x] Nenhum segredo do app entra no manual. Prints com dados sensíveis são ocultados.
- [x] Nada é gravado no repositório do app nem no banco dele. O manual fica fora do repositório.
- [x] O manual abre no Studio sem erro. Exporta em HTML e Markdown.
- [x] Custo em tokens comparado ao piloto.
- [x] Relatório do que precisou de correção à mão e dos defeitos achados. Não houve comparação com manual escrito à mão: ficou para o T-150.

## Como verificar
Abrir o manual no Studio com a pessoa.

## Registro
Aprovado pela pessoa em 2026-11-04 ("gostei bastante"). 23 páginas e 17 prints, com perfis aluno e admin, em codelab #2, #3 e #4. Custo: 163 mil tokens novos, 2,8 milhões de cache e 51 mil de saída, contra 148 mil, 1,6 milhão e 19,5 mil do piloto de 5 páginas. Defeitos achados: T-134 (export por perfil se sobrescreve) e T-139 (numeração depois do print). Ocultar dados não foi testado, porque os dados eram fictícios.

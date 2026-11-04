# T-130: Menores deixados pelo T-123

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: revisão do T-123 (2026-11-04)
- Depende de: T-123

## Problema
Cinco defeitos pequenos do `checkManual` e do `add_pages`, sem perda de dados.

## Critérios de aceite
- [ ] `> **Resultado:**` logo depois de um passo não gera falso `step-without-result`.
- [ ] Link e imagem dentro de bloco de código não entram no `checkManual`.
- [ ] `add_pages` avisa segredo no título, como `add_page` avisa no corpo.
- [ ] `add_pages` que falha no meio devolve os títulos com os ids já criados.
- [ ] `add_pages` tem limite total de profundidade e de tamanho (hoje só 100 nós no nível de cima).

## Onde
`src/core/check.ts` e `explicai-mcp/src/tools.ts`, `explicai-mcp/src/guards.ts`.

## Como verificar
Teste de cada caso em `test/check-manual.test.ts` e no `explicai-mcp/test/`. `npm run check` nos dois repos.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

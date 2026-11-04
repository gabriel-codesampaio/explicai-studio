# T-131: Prompts do MCP depois da crítica do manual

- Prioridade: P1
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [Crítica do manual do piloto](../discovery/2026-11-04-critique-manual-piloto.md) (2026-11-04)
- Bloqueia: T-125

## Problema
Nota 6/10 no manual do piloto. Na parte de conteúdo, o que mais pesa: 11 dos cerca de 17 alertas são "Print pendente", com a mesma cara de uma nota real, e o aluno lê isso como informação.

## Critérios de aceite
- [x] Sem print, nada entra no corpo da página: a pendência vai só para o relatório, e o `check_manual` já aponta `no-image`. A regra "Print pendente" sai de todos os prompts, inclusive `build_*` e `capture_walkthrough`.
- [x] Passo cita o nome literal do elemento ou a posição dele na tela. Nada de "clique em responder" ou "ícone de vídeo/círculo".
- [x] Instrução que só funciona com mouse ganha alternativa para toque.
- [x] Página informativa não se mistura com tarefa. Toda tarefa fecha dizendo que a pessoa concluiu. A última página do manual não termina seca.
- [x] Tarefa que envolve dinheiro ou dado sensível tem um alerta "se der errado".
- [x] Nota sobre os bastidores do print (ex.: "capturada em conta de administrador") não entra na página: vai para o relatório.
- [x] Os prompts não crescem sem necessidade: meça os caracteres antes e depois.

## Onde
`explicai-mcp/src/content.ts`.

## Como verificar
Teste de conteúdo dos prompts e medida real no T-125.

## Registro
Prompts ajustados no explicai-mcp #7: 4 a 21% maiores (tabela no PR). Efeito em manual real se mede no T-125.

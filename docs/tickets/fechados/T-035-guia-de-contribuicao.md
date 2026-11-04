# T-035: Guia de contribuição e código de conduta

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [Discovery de contribuição](../../discovery/archives/2026-10-30-contribuicao.md) (2026-10-30)

## Problema
O projeto é open source, mas não diz como contribuir. Só o README tem uma frase sobre isso.

## Critérios de aceite
- [x] `CONTRIBUTING.md` em pt-BR com resumo em inglês: como rodar, `npm run check`, padrão de commits, o que não muda sem conversa.
- [x] `CODE_OF_CONDUCT.md` com o Contributor Covenant.
- [x] Contato para denúncias e segurança: e-mail ainda não definido pela pessoa. Não publicar sem ele.
- [x] Os READMEs do Studio e do MCP linkam o guia. Nenhum nome de pessoa novo na interface.

## Onde
Raiz do repositório, `README.md`, `explicai-mcp/README.md`.

## Como verificar
Seguir só o guia num clone novo e passar no `npm run check`.

## Registro
`CONTRIBUTING.md` e `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1). Contato: gabriel@codesampa.io. O MCP linka o guia em vez de ter o seu. Verificado pelo CI, que parte de checkout limpo; ninguém seguiu o guia à mão num clone novo.

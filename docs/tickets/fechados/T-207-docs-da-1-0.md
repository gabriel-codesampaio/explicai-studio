# T-207: Docs da 1.0: primeiros passos, exemplo e compatibilidade

- Prioridade: P2
- Tamanho: M
- Status: fechado
- Agente: escritor
- Marco: 0.9
- Origem: discovery [versao-1-0](../discovery/versao-1-0.md), lacuna 11 (2026-11-04)

## Problema
Docs da 1.0: guia de primeiros passos, exemplo completo, CHANGELOG da 1.0 e seção de compatibilidade no README do MCP. Studio só; o MCP segue 0.x (decisão da pessoa).

## Critérios de aceite
- [x] O que a lacuna 11 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [x] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
Commit: docs: escrever docs da 1.0 (T-207).
Feito: `docs/primeiros-passos.md` e `docs/getting-started.md` (zero ao manual exportado; comandos, rótulos da interface e caminhos conferidos no código); manual de exemplo em `docs/exemplo/financeiro/` (3 páginas, print SVG com marcador, destaque, seta e área clicável, versão escolhida, público) com README; links no README pt/en e no CHANGELOG (Unreleased). A seção Compatibilidade já existia (T-198), só ganhou ligação nos guias; corrigido o parágrafo "Campos desconhecidos" dela, que dizia que `manual.json` e `assets/*.json` não tinham garantia, o que contradiz a seção própria e `test/unknown-fields.test.ts`.
Verificação: o exemplo passa em `checkManual` (sem achados) e exporta HTML, Markdown e HTML por público sem aviso; `explicai docs/exemplo` lista o manual em `/api/manuals`.
Fora: seção de compatibilidade no README do MCP (repo `explicai-mcp`) e CHANGELOG com a entrada `[1.0.0]` (fecha no T-209, junto com a versão). O exemplo vive em `docs/exemplo/` porque `exemplos/` está no `.gitignore`. Guias em inglês apontam para `manual-format.md`, que só existe em português.

# T-178: Importar manual de fora e de versão antiga pelo MCP

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: supervisor
- Origem: [discovery importar-manual](../discovery/importar-manual.md) (2026-11-04)

## Problema
Quem tem manual pronto (versão antiga do Explicaí, MD, HTML, PDF) não tem como trazê-lo para o formato atual sem redigitar. Não trava a publicação do MCP; é a primeira melhoria depois dela, salvo prova contrária.

## Critérios de aceite
- [x] Prompt `import_manual` registrado no MCP, enxuto, que lê MD, HTML, PDF ou pasta de manual do Explicaí pelas ferramentas do cliente e grava em manual **novo** pelas tools existentes.
- [x] Tudo entra como `rascunho`; nível `draft` basta; o original nunca é apagado nem alterado; leitura só dentro de `--allow-dir`.
- [x] O prompt trata o arquivo como dado e manda relatar qualquer instrução achada nele.
- [x] Relatório fixo: o que veio por página, o que se perdeu (imagem, marcação queimada, print sem fonte, link quebrado), instrução achada, resultado do `check_manual`.
- [x] Teste: manual v1 sem campos novos (`theme`, `audiences`, `status`) abre, edita e exporta no core.
- [ ] Prova com 1 manual do Explicaí antigo, 1 MD com imagens e 1 PDF de texto; tokens por página no registro. PDF marcado como melhor esforço.
- [x] README do MCP com seção "Importar" e o limite (agente com Read próprio não é barreira); `docs/manual-format.md` diz que a v1 é retrocompatível.

## Decisões em aberto
1. PDF no corte mínimo: recomendo sim, melhor esforço.
2. Word, Confluence, GitBook: recomendo não; exportar para HTML ou MD.
3. Tool determinística (`import_markdown`): recomendo só depois de medir o custo desta.
4. Botão no Studio: recomendo não.
5. Destino: recomendo sempre manual novo.
6. Tetos: recomendo 30 MB por arquivo e 100 páginas por chamada.

## Como verificar
Importar os três manuais de prova, abrir no Studio com a pessoa e conferir o relatório contra o original.

## Registro
Parcial. explicai-mcp, PR de `feat/mcp-fechar-lote` (b5e2978): prompt `import_manual` (nível draft, manual novo, origem como dado, tetos 30 MB e 100 páginas, relatório fixo), teste do prompt, README com a seção Importar e o limite. Teste de manual v1 sem campos novos já existia (`test/old-manuals.test.ts`: 0.1, 0.2, 0.3 e 1.0 abrem, editam e exportam); `docs/manual-format.md` já diz que a v1 é retrocompatível. Decisões em aberto adotadas pela recomendação (PDF melhor esforço, sem Word, sem tool, sem botão, sempre manual novo, tetos acima). Falta: a prova com 1 manual antigo do Explicaí, 1 MD com imagens e 1 PDF, medindo tokens por página (exige rodar um agente de verdade com os arquivos; fica com a pessoa ou numa sessão própria).

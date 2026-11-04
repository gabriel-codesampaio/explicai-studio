# T-201: Abrir manual de formato maior só para leitura, com aviso

- Prioridade: P2
- Tamanho: M
- Status: fechado
- Agente: frontend
- Marco: 0.5
- Origem: discovery [versao-1-0](../discovery/versao-1-0.md), lacuna 4 (2026-11-04)

## Problema
Manual de formato maior que o suportado: abrir só leitura com mensagem acionável, nunca regravar; documentar o caminho `explicai migrate` para uma v2.

## Critérios de aceite
- [x] O que a lacuna 4 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [x] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
- Commit: feat/t-201-formato-maior-leitura (feat(core), feat(editor), docs(formato)).
- Feito: `readManual` lança `ExplicaiError` `format-newer` para versão maior (gravações do núcleo, CLI e MCP recusam); `allowNewer` só nas leituras do Studio (lista, GET manual com `newerFormat`, árvore, página). 409 nas gravações. Editor: faixa `role=status` pt/en, texto e título só leitura, sem barra de ferramentas, versões, público, status e exportar. Testes: `test/format-newer.test.ts`, `test/server-format-newer.test.ts`, `web/test/formatNewer.test.tsx`. Doc em `docs/manual-format.md` (Manual de formato mais novo, Migração).
- Fora: botões da Sidebar (nova página, mover, renomear) seguem visíveis e dão o erro 409 traduzido; versões e busca de histórico do manual novo respondem o erro. Sem e2e nem conferência no navegador.

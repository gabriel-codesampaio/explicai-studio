# T-540: Mostrar no Studio os achados do checkManual, com clique para abrir a página

- Prioridade: P1
- Tamanho: G
- Status: feito
- Agente: frontend (+ qa)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 1 (esforço P, risco B)

## Problema
`checkManual` (`src/core/check.ts`, 8 tipos de achado) acha passo sem resultado, link morto, imagem sem marcador e outros problemas, mas só o MCP (`check_manual`) mostra. Dev solo e redator não veem sem usar a IA. Hoje `checkManual` aparece só em `src/core/index.ts` e `check.ts`: nenhuma rota nem tela do Studio. Princípio 1 do produto: o manual acompanha o código.

Esforço no relatório: P (reaproveita código pronto e testado). Tamanho G pelo trilho, porque é tela nova.

## Escopo
- Rota `GET /api/manuals/:slug/check` em `src/server/routes/`, devolvendo `CheckFinding[]`.
- Diálogo "Checar manual" pelo menu do manual, com achados agrupados por página, nome do tipo em pt/en, detalhe e "Abrir página".
- Contagem de achados no botão Exportar, sem bloquear o export.
- Tipo `to-confirm` mostrado como "A confirmar", não como erro. Estado vazio: "Nenhum problema encontrado."

## Fora
Correção automática; mudança em `check.ts`; nova regra de checagem; CLI (T-541).

## Critérios de aceite
- [x] Manual com os 8 tipos mostra todos, cada um na página certa; clicar abre a página.
- [x] Manual sem achado mostra "Nenhum problema encontrado.".
- [x] Texto em pt e en, sem palavra em um idioma só (T-206).
- [x] Diálogo operável só por teclado, com foco preso e devolvido (T-173, T-424), nome acessível e sem falha no axe.
- [x] Manual de 500 páginas (fixture do T-423) responde sem travar o editor.
- [x] Manual de formato mais novo (`format-newer`) abre a checagem só para leitura; a rota não grava nada.
- [x] Erro da rota sem caminho absoluto (T-101): devolve só id de página e texto.
- [x] `npm run check` passa; teste unitário da rota; e2e: abrir o diálogo e clicar num achado.

## Onde
`src/server/routes/` (rota nova), `src/core/check.ts` (só leitura), `web/src/features/` (diálogo), menu do manual, textos pt/en.

## Como verificar
Os critérios acima. Lista longa vira ruído: agrupar por página e contar. Medir no `docs/exemplo`.

## Riscos
Muito "a confirmar" em manual novo pode poluir a lista. Hipótese, a medir.

## Decisões pendentes
Nenhuma.

## Registro
Commits: 0e0ee4d (rota), 412c694 (diálogo e contagem), 1d86678 (e2e).
- Rota `GET /api/manuals/:slug/check` (`src/server/routes/check.ts`), só leitura. Teste: `test/server-check.test.ts`.
- Diálogo `web/src/features/check/CheckManualDialog.tsx`, aberto por "Checar manual" no seletor de manual. Nome e detalhe do achado em pt/en (`findingText.ts`). Rótulo "A confirmar" com ícone neutro.
- Contagem no Exportar: número no botão (fora do nome acessível) e na descrição ("3 achados na checagem do manual."). Refaz ao trocar de manual e ao abrir o Exportar; não bloqueia.
- 500 páginas: `checkManual` levou ~0,8 s no servidor (1500 achados). A tela só lista; não mediu o diálogo com tanta linha.
- Ficou de fora: `format-newer`. `checkManual` lê o manual sem `allowNewer` e `check.ts` está fora do escopo, então a rota responde 409 `format-newer` (nada é gravado) e o diálogo mostra o aviso, em vez de listar os achados. Para listar em leitura, `checkManual` precisa passar `allowNewer` a `readManual` e `readPage`.
- Ficou de fora: a contagem do Exportar não atualiza a cada edição; só ao abrir o Exportar ou trocar de manual.

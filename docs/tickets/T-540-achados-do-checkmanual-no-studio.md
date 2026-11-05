# T-540: Mostrar no Studio os achados do checkManual, com clique para abrir a página

- Prioridade: P1
- Tamanho: G
- Status: aberto
- Agente: frontend (+ qa)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 1 (esforço P, risco B)

## Problema
`checkManual` (`src/core/check.ts`, 8 tipos de achado) acha passo sem resultado, link morto, imagem sem marcador e outros problemas, mas só o MCP (`check_manual`) mostra. Dev solo e redator não veem sem usar a IA. Hoje `checkManual` aparece só em `src/core/index.ts` e `check.ts`: nenhuma rota nem tela do Studio. Princípio 1 do produto: o manual acompanha o código.

Esforço no relatório: P (reaproveita código pronto e testado). Tamanho G pelo trilho, porque é tela nova.

## Escopo
- Rota `GET /api/manuals/:id/check` em `src/server/routes/`, devolvendo `CheckFinding[]`.
- Diálogo "Checar manual" pelo menu do manual, com achados agrupados por página, nome do tipo em pt/en, detalhe e "Abrir página".
- Contagem de achados no botão Exportar, sem bloquear o export.
- Tipo `to-confirm` mostrado como "A confirmar", não como erro. Estado vazio: "Nenhum problema encontrado."

## Fora
Correção automática; mudança em `check.ts`; nova regra de checagem; CLI (T-541).

## Critérios de aceite
- [ ] Manual com os 8 tipos mostra todos, cada um na página certa; clicar abre a página.
- [ ] Manual sem achado mostra "Nenhum problema encontrado.".
- [ ] Texto em pt e en, sem palavra em um idioma só (T-206).
- [ ] Diálogo operável só por teclado, com foco preso e devolvido (T-173, T-424), nome acessível e sem falha no axe.
- [ ] Manual de 500 páginas (fixture do T-423) responde sem travar o editor.
- [ ] Manual de formato mais novo (`format-newer`) abre a checagem só para leitura; a rota não grava nada.
- [ ] Erro da rota sem caminho absoluto (T-101): devolve só id de página e texto.
- [ ] `npm run check` passa; teste unitário da rota; e2e: abrir o diálogo e clicar num achado.

## Onde
`src/server/routes/` (rota nova), `src/core/check.ts` (só leitura), `web/src/features/` (diálogo), menu do manual, textos pt/en.

## Como verificar
Os critérios acima. Lista longa vira ruído: agrupar por página e contar. Medir no `docs/exemplo`.

## Riscos
Muito "a confirmar" em manual novo pode poluir a lista. Hipótese, a medir.

## Decisões pendentes
Nenhuma.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

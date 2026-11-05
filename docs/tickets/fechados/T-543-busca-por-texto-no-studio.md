# T-543: Busca por texto nas páginas do manual no Studio

- Prioridade: P2
- Tamanho: G
- Status: feito
- Agente: frontend (+ qa)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 4 (esforço M, risco B)

## Problema
Manual com 50 páginas: achar onde se fala de "boleto" exige abrir página por página. A árvore filtra só por título (T-170), e Ctrl+P hoje faz o mesmo.

## Escopo
- Busca por substring, sem acento nem caixa, no corpo das páginas visíveis (sem lixeira).
- Resultado com trecho; clicar abre a página.
- O servidor lê os `.md` na hora (`readPageTree` lê só o frontmatter, T-096; aqui lê o corpo). Sem índice persistente, sem IA.

## Atenção ao atalho
O relatório sugere Ctrl+K, mas Ctrl+P já abre a busca de títulos. Antes de codar, decidir: a busca de texto estende o diálogo do Ctrl+P, ou ganha outro atalho sem colisão.

## Critérios de aceite
- [x] A busca acha o termo no corpo, ignorando acento e caixa; mostra trecho e abre a página.
- [x] Páginas da lixeira não aparecem.
- [x] Atalho decidido e sem colisão; lista de atalhos atualizada (T-167, T-184).
- [x] Acessibilidade igual à do T-171 (listbox com estado vazio, nome, foco) e axe sem falha.
- [x] Manual de 500 páginas (fixture do T-423) responde em tempo aceitável (meta a definir com T-205). Medir antes de pensar em índice.

## Onde
Rota de busca nova em `src/server/routes/`, leitura do corpo em `src/core/` (ao lado de `readPageTree`), diálogo de busca em `web/src/features/`, lista de atalhos.

## Como verificar
e2e: buscar termo com acento e sem, com página na lixeira e sem; teste de unidade da normalização.

## Riscos
Manual grande fica lento sem índice: medir antes.

## Registro
Feito em `feat/busca-por-texto`. Atalho decidido: nenhum novo; a busca de texto estende o diálogo do Ctrl+P (mesmo campo): títulos primeiro, depois a seção "No texto" com trecho (~60 caracteres de cada lado) e o termo em `<mark>`.
- Núcleo: `src/core/search.ts` (`foldText`: NFD sem diacríticos e minúscula; `searchBodies`: lê o corpo de cada página da árvore, então a lixeira fica de fora; leitura em paralelo, sem índice; limite 30, mínimo 1 letra no core).
- Rota: `GET /api/manuals/:slug/search?q=` (`src/server/routes/search.ts`), só leitura, `allowNewer`, erro sem caminho absoluto. Devolve `{id, title, before, match, after}`: a interface monta o `<mark>`, sem HTML vindo do servidor.
- Interface: `PageSearch.tsx` + `useTextSearch.ts` (a partir de 2 caracteres, espera de 200 ms, `AbortController` na consulta velha). Listbox com dois grupos, `role=status` anunciando a contagem, estado vazio, foco igual ao T-171. Lista de atalhos e `i18n.en.ts` atualizados ("Buscar página pelo título ou texto"); o nome do campo mudou para "Buscar por título ou texto".
- Medida, 500 páginas (~2,5 KB cada), termo que não existe (pior caso), mediana de 5: 84 a 163 ms em três rodadas (a primeira versão, serial, deu 569 ms; leitura em paralelo e fold só nas páginas com o termo resolveram). Abaixo de 300 ms: sem índice. Teto de 300 ms vigiado em `test/budget-500.test.ts`.
- Testes: `test/search-text.test.ts`, `test/server-search.test.ts`, `e2e/studio.busca-texto.e2e.ts` (com e sem acento, lixeira, axe, contagem).
- Fora: busca dentro de tabelas/blocos com marcação (o texto é o Markdown cru); destaque do termo na página aberta; índice persistente.

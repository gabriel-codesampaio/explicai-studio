# T-543: Busca por texto nas páginas do manual no Studio

- Prioridade: P2
- Tamanho: G
- Status: aberto
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
- [ ] A busca acha o termo no corpo, ignorando acento e caixa; mostra trecho e abre a página.
- [ ] Páginas da lixeira não aparecem.
- [ ] Atalho decidido e sem colisão; lista de atalhos atualizada (T-167, T-184).
- [ ] Acessibilidade igual à do T-171 (listbox com estado vazio, nome, foco) e axe sem falha.
- [ ] Manual de 500 páginas (fixture do T-423) responde em tempo aceitável (meta a definir com T-205). Medir antes de pensar em índice.

## Onde
Rota de busca nova em `src/server/routes/`, leitura do corpo em `src/core/` (ao lado de `readPageTree`), diálogo de busca em `web/src/features/`, lista de atalhos.

## Como verificar
e2e: buscar termo com acento e sem, com página na lixeira e sem; teste de unidade da normalização.

## Riscos
Manual grande fica lento sem índice: medir antes.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

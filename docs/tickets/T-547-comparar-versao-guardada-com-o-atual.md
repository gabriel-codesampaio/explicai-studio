# T-547: Comparar uma versão guardada com o texto atual, com diff por linha

- Prioridade: P2
- Tamanho: G
- Status: feito (aguardando revisão de design)
- Agente: frontend (+ qa)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 8 (esforço M, risco B)

## Problema
A pessoa guarda versões da página (T-016, T-144), mas não vê o que mudou de uma para a outra; só restaura às cegas. Relacionado: T-163 (aviso de conflito com diferença), fechado.

## Escopo
- Na lista de versões, "Comparar com o atual" mostra o diff de texto por linha em dois painéis.
- Reaproveita `web/src/lib/conflictDiff.ts` e `src/core/versions.ts`.
- Sem diff de imagem nem de marcação.

## Critérios de aceite
- [ ] Cada versão guardada tem "Comparar com o atual", que mostra as diferenças por linha em dois painéis.
- [ ] Sem diferença, mostra estado vazio; página grande não trava (limite ou virtualização definidos e testados).
- [ ] Teclado e leitor de tela: painéis com nome e navegação; axe sem falha.
- [ ] Comparar não restaura nada: restaurar é ação separada.
- [ ] Textos em pt e en.

## Onde
`web/src/lib/conflictDiff.ts`, `src/core/versions.ts`, painel de versões (`web/src/features/versions/`).

## Como verificar
e2e: guardar versão, editar, comparar, conferir as linhas; teste com página grande.

## Riscos
Interface em páginas grandes e em estado vazio (o relatório aponta os dois).

## Registro
Feito na branch `feat/comparar-versao`.
- Cada versão ganhou "Comparar com o atual": dois painéis (versão guardada e texto atual) com diff por linha, alinhado por Myers, em `web/src/lib/conflictDiff.ts` e `web/src/features/versions/VersionDiff.tsx`.
- Sem diferença: estado "Sem diferenças". Limite: acima de 10000 linhas mostra aviso em vez de comparar; modo grosso se passar de 2000 edições. Teste e2e com 5000 linhas.
- Painéis são regiões nomeadas e focáveis; axe sem falha grave; Voltar devolve o foco. Comparar não restaura. pt e en.
- Ficou de fora: diff de imagem e de marcação.

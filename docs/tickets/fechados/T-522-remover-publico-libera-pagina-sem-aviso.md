# T-522: Remover público libera a página restrita sem confirmação

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: rodada pesada da 1.0.0, 2026-11-05

## Problema
Em src/core/audience.ts `removeAudience`: página que só tinha esse público volta a 'todos' e fica visível na próxima exportação. O retorno `freed` existe, mas não há teste de que UI e MCP avisem antes de gravar.

## Critérios de aceite
- [x] UI mostra as páginas liberadas e pede confirmação; teste cobre.

## Registro
- Achado na revisão/matriz da 1.0.0; não bloqueia a versão.
- Fechado na branch fix/ultimos-1-0. UI já confirmava (ConfirmDialog com contagem e títulos liberados); faltava teste: web/test/audiencesDialog.test.tsx. MCP fora do escopo.

# T-161: Proteger a limpeza da lixeira e renomear a ação

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A11 (avaliado no commit 60a0e3d)

## Problema
Achado A11. A lixeira abre com o foco em "Mover para a lixeira". Enter executa sem confirmar. O texto cita apagar, mas não há botão para isso. Ação em `TrashPanel.tsx:82`.

## Critérios de aceite
- [ ] O foco inicial fica em Restaurar ou no X, nunca numa ação destrutiva.
- [ ] A limpeza pede confirmação antes de apagar.
- [ ] A ação se chama "Limpar imagens sem uso", e o texto combina com ela.
- [ ] Enter no foco inicial não apaga nada.

## Onde
- web/src/features/pages/TrashPanel.tsx:82

## Como verificar
Abrir a lixeira e apertar Enter logo de cara: nada é apagado. Clicar Limpar imagens sem uso: confirmação aparece. Teste de componente com foco inicial.

## Registro
Feito: foco inicial no painel (`onOpenAutoFocus`), confirmação em dois passos, ação renomeada, texto sem "apagar". Testes em `web/test/trashPanel.test.tsx`.

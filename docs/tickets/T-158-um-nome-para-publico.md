# T-158: Usar um nome só para o público da página

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A8 (avaliado no commit 60a0e3d)

## Problema
Achado A8. O público tem quatro nomes: Ver como, Público da página, Quem vê esta página e Para quem exportar. Cada tela usa um. Relacionado ao T-124 (fechado: manual por público) e aos T-134 a T-137 (abertos, sobras do T-124).

## Critérios de aceite
- [ ] A equipe escolhe um termo único e registra a escolha no Registro.
- [ ] O termo aparece igual na barra lateral, no menu da página e no diálogo de exportação.
- [ ] Os textos novos têm chave de i18n em pt e en.
- [ ] Nenhum dos outros três termos sobra na interface (grep).

## Onde
- web/src/layout/Sidebar.tsx
- web/src/features/pages/AudienceMenu.tsx
- web/src/features/export/ExportDialog.tsx

## Como verificar
Grep pelos quatro termos em web/src e nos arquivos de i18n. Conferir as três telas em pt e en.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

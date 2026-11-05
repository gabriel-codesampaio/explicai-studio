# T-554: Versões: um nome só ("Fixada no manual") e ações claras

- Prioridade: P1
- Tamanho: M
- Status: fechado
- Agente: frontend
- Origem: [critique 2026-11-05 (27/40)](../../../.impeccable/critique/2026-11-05T12-50-20Z__web-src-app-tsx.md)

## Problema
A mesma coisa tem vários nomes e o aviso acima do título empurra o texto. No diálogo Versões, "Remover" quebra linha e parece desativado. Exportar mostra texto longo sobre versão fixada. Mesmo comportamento, só renomear e enxugar. Absorve T-529 (aviso de versão fixada).

## Critérios de aceite
- [ ] Nome único: "Fixada no manual" (pt) / equivalente en, em toda a UI.
- [ ] Aviso acima do título vira selo junto ao título com uma ação "Usar texto atual"; sem parágrafo; sem empurrar o título.
- [ ] Diálogo Versões: ações "Ver", "Restaurar", "Desafixar"; Remover vai para um menu ⋯ (sem quebra de linha, sem parecer desativado).
- [ ] Exportar mostra só o contador "N páginas usam versão fixada".
- [ ] Cobre T-529 (fechar T-529 como coberto).
- [ ] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Como verificar
Teste de unidade do que for lógica; conferir a tela com script Playwright (uma largura, um tema) e medir com `evaluate_script`/script.

## Registro
- Fechado na branch feat/ui-versoes-publico. Nome único "Fixada no manual" (en: Pinned in manual); aviso virou selo ao lado do título com "Usar texto atual"; diálogo Versões com Ver, Restaurar, Fixar/Desafixar e Remover no menu ⋯; Exportar mostra só "N páginas usam versão fixada". Mesmo comportamento. Teste e e2e atualizados (e2e não rodado aqui).

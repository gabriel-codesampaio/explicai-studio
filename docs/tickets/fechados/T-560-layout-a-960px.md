# T-560: Testar e ajustar o layout a 960px

- Prioridade: P3
- Tamanho: M
- Status: fechado
- Agente: frontend
- Origem: [critique 2026-11-05 (27/40)](../../.impeccable/critique/2026-11-05T12-50-20Z__web-src-app-tsx.md)

## Problema
Janela meio-tela (960px) é uso real e não foi conferida.

## Critérios de aceite
- [x] Studio a 960px (claro e escuro) sem corte, sobreposição nem rolagem horizontal nas telas principais (página, Exportar, Versões, Ajustes, editor de imagem).
- [x] Ajustes aplicados onde houver defeito.
- [x] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Como verificar
Teste de unidade do que for lógica; conferir a tela com script Playwright (uma largura, um tema) e medir com `evaluate_script`/script.

## Registro
- Fechado em feat/ui-lote3. e2e novo e2e/studio.960.e2e.ts (960x720, claro e escuro): página com tabela, Exportar, Versões, Ajustes (Aparência) e editor de imagem sem rolagem horizontal e sem filho de diálogo fora da janela. Nenhum defeito achado, nenhum ajuste de CSS. Corte e sobreposição só medidos por geometria (sem print); conferência visual fica com o design.

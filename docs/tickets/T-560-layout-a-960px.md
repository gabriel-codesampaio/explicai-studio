# T-560: Testar e ajustar o layout a 960px

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [critique 2026-11-05 (27/40)](../../.impeccable/critique/2026-11-05T12-50-20Z__web-src-app-tsx.md)

## Problema
Janela meio-tela (960px) é uso real e não foi conferida.

## Critérios de aceite
- [ ] Studio a 960px (claro e escuro) sem corte, sobreposição nem rolagem horizontal nas telas principais (página, Exportar, Versões, Ajustes, editor de imagem).
- [ ] Ajustes aplicados onde houver defeito.
- [ ] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Como verificar
Teste de unidade do que for lógica; conferir a tela com script Playwright (uma largura, um tema) e medir com `evaluate_script`/script.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

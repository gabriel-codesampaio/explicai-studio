# T-555: Público com um nome só e pré-seleção no Exportar

- Prioridade: P2
- Tamanho: M
- Status: fechado
- Agente: frontend
- Origem: [critique 2026-11-05 (27/40)](../../../.impeccable/critique/2026-11-05T12-50-20Z__web-src-app-tsx.md)

## Problema
O público tem 3 nomes: lateral "Ver como público", botão da página "Todos" (só ícone de pessoas), Exportar "Público do export".

## Critérios de aceite
- [ ] Lateral: "Visualizar como".
- [ ] Botão da página: "Público: Todos" (texto, não só ícone).
- [ ] Exportar usa o mesmo nome e pré-seleciona o público visto no momento.
- [ ] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Como verificar
Teste de unidade do que for lógica; conferir a tela com script Playwright (uma largura, um tema) e medir com `evaluate_script`/script.

## Registro
- Fechado na branch feat/ui-versoes-publico. Lateral "Visualizar como"; botão da página "Público: Todos"; Exportar usa "Visualizar como" e abre no público visto (estado `viewAs` subiu para useStudio). Teste novo web/test/exportAudience.test.tsx; e2e atualizados (não rodados aqui).

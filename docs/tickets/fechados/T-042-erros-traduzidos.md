# T-042: Erros do núcleo traduzidos na interface em inglês

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: Revisão do T-015 e do T-029

## Problema
Com a interface em inglês, o erro "nenhuma página aprovada" (T-015) e os de contraste do tema (T-029) apareciam em português, porque o núcleo só manda texto em português. Além disso, o `ExportDialog` repetia a condição `onlyApproved && approved > 0`.

## Critérios de aceite
- [x] O núcleo lança `ExplicaiError` com `code` e `params` estáveis; a mensagem em português continua igual para CLI e MCP.
- [x] O servidor devolve `code` e `params` junto de `error`.
- [x] O Studio monta o texto pelo i18n a partir do código (`errorMessage`), nos dois idiomas.
- [x] `ExportDialog` calcula a condição uma vez.

## Onde
`src/core/errors.ts`, `src/core/export/{index,theme}.ts`, `src/server/index.ts`, `web/src/lib/api.ts`, `web/src/lib/i18n.en.ts`, `web/src/features/export/ExportDialog.tsx`.

## Como verificar
`test/theme.test.ts`, `test/export.test.ts`, `test/server.test.ts`, `web/test/apiErrors.test.ts`.

## Registro
Feito: códigos `no-approved-pages`, `low-contrast`, `low-contrast-highlight`. Erro novo do núcleo que a tela possa mostrar: criar com `ExplicaiError` e uma entrada em `CODED` (api.ts). Fora: a paleta da tela só tem cores que passam no contraste, então o erro de contraste só chega à tela pelo MCP/API; sem e2e.

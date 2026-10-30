# T-061: Testes unitários da web (autosave, rota, marcações, teclado)

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: qa

## Feito
Testes novos em `web/test/` (happy-dom, Testing Library): `useAutosave` (debounce, flush, discard, falha e retry, texto digitado durante a falha, beforeunload), `hashRoute`, `annotationStore` (cache, uma busca por imagem, falha, salvamento), `time`, `status`, `text` e `useTreeKeyboard` (setas, Home/End, Alt+Shift, menu). 39 testes novos.

## Bug real achado
`useAutosave` tinha uma fila de uma posição só. Se a gravação da página A falhava enquanto a pessoa já editava a página B, o texto de B era mesclado ao patch de A e gravado na página errada, e B sumia da fila. Corrigido com uma mudança pendente por página (commit `d03dde3`), com o teste vermelho antes.

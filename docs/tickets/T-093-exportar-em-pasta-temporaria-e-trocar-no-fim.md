# T-093: Exportar em pasta temporária e trocar no fim

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 10 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
se algo falha no meio (item 9, imagem apagada entre o `exists` e o `copyFile`, `renderHtml` lançando), `exportacao/html/` fica vazia ou pela metade, e a versão boa que já existia se foi. O diálogo desabilita o botão enquanto exporta, mas duas abas ou o MCP podem chamar juntos, e `rm` de uma apaga o que a outra gravou.

## Critérios de aceite
- [ ] gerar em `exportacao/.html-<uuid>/` e, no fim, `rm` do antigo + `rename`. Falhou, o antigo continua.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
`src/core/export/index.ts:315,322` (`freshDir` primeiro, depois cópia e renderização); `:363-367`.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 10 da auditoria.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

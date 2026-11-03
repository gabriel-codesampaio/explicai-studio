# T-108: Detectar edição feita fora do Studio antes de sobrescrever

- Prioridade: P1
- Tamanho: G
- Status: aberto
- Agente: frontend
- Origem: preparação da versão de produção (2026-11-03)

## Problema
O Studio não relê o disco: se a pessoa (ou o MCP, ou um editor) altera uma página fora dele, o próximo autosave sobrescreve a edição sem aviso. Perde trabalho.

## Critérios de aceite
- [ ] GET da página devolve uma versão (mtime+tamanho ou hash); PUT envia essa versão (`If-Match`); servidor responde 409 se o arquivo mudou no disco.
- [ ] No 409 o autosave para aquela página, nada é sobrescrito, e a interface avisa com duas ações: "Recarregar do disco" e "Manter a minha versão" (esta regrava).
- [ ] Textos em pt e en; sem mudança no formato salvo em disco.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
src/server/routes/pages*, src/core/pages.ts, web/src/hooks (autosave/useStudio), web/src/lib/api

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

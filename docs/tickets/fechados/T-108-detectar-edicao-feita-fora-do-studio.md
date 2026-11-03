# T-108: Detectar edição feita fora do Studio antes de sobrescrever

- Prioridade: P1
- Tamanho: G
- Status: fechado
- Agente: frontend
- Origem: preparação da versão de produção (2026-11-03)

## Problema
O Studio não relê o disco: se a pessoa (ou o MCP, ou um editor) altera uma página fora dele, o próximo autosave sobrescreve a edição sem aviso. Perde trabalho.

## Critérios de aceite
- [x] GET da página devolve uma versão (mtime+tamanho ou hash); PUT envia essa versão (`If-Match`); servidor responde 409 se o arquivo mudou no disco.
- [x] No 409 o autosave para aquela página, nada é sobrescrito, e a interface avisa com duas ações: "Recarregar do disco" e "Manter a minha versão" (esta regrava).
- [x] Textos em pt e en; sem mudança no formato salvo em disco.
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
src/server/routes/pages*, src/core/pages.ts, web/src/hooks (autosave/useStudio), web/src/lib/api

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`.

## Registro
Branch fix/t-108-conflito-de-disco. Versão da página = mtime+tamanho do arquivo (`version` no GET/PUT). PUT com `If-Match` diferente do disco responde 409 `disk-conflict` (erro do núcleo, pt e en); checagem e gravação dentro da fila da pasta (`inQueue`, extraída de `updateManual`). Sem `If-Match` nada muda (MCP e clientes antigos). O editor guarda a versão por página; no 409 o autosave, a etapa e o renomeio param e um aviso fixo oferece "Recarregar do disco" e "Manter a minha versão". Formato em disco intacto.
Ficou de fora: com renomeio de arquivo a checagem e a gravação não são atômicas (janela de milissegundos); a versão não detecta edição que preserve mtime e tamanho.

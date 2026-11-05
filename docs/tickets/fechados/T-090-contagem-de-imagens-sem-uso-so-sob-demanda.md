# T-090: Contagem de imagens sem uso só sob demanda

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 7 (`docs/discovery/archives/2026-11-02-auditoria-ponytail.md`)

## Problema
cada versão guardada é uma cópia completa da página (`versions.ts:405`). A leitura é sequencial e se repete a cada abertura do painel.

## Critérios de aceite
- [x] calcular só ao clicar em "Limpar" (o botão já existe) ou sob demanda com `Promise.all` em lotes; mostrar a contagem depois. Alternativa: guardar contagem por 60 s.
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
`web/src/features/pages/TrashPanel.tsx:27` chama `unusedAssets` a cada abertura; `src/core/assets.ts:159-168` lê, um por vez, todo `.md` de `pages/`, `.versoes/` e `.lixeira/`.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 7 da auditoria.

## Registro
Fechado na branch fix/lote-4-tecnico. O painel da lixeira não chama mais a contagem ao abrir; o botão "Mover para a lixeira" fica sempre visível e avisa "Nenhuma imagem sem uso." se não havia nada. Removido `api.unusedAssets` do cliente (a rota segue no servidor).

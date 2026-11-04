# T-153: Mostrar no Studio o que mudou fora dele, sem trocar de página

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A3 (avaliado no commit 60a0e3d)

## Problema
Achado A3. Mudança feita fora do Studio não aparece. Página criada pela API fica fora da árvore por 12 s. Manual novo fica fora do menu, e o link dele dá 404. Arquivo alterado segue antigo na tela, sem aviso, até trocar de página. Afeta o fluxo pelo MCP. Relacionado ao T-108 (fechado: detecta edição externa antes de sobrescrever), que não cobre a atualização da tela.

## Critérios de aceite
- [ ] Ao a aba voltar ao foco, árvore e página atual são rebuscadas do disco.
- [ ] Página criada pela API aparece na árvore sem recarregar a aba.
- [ ] Manual novo aparece no menu, e o link dele abre em vez de dar 404.
- [ ] Arquivo alterado em disco atualiza a tela ou mostra aviso antes de qualquer gravação.
- [ ] Acompanhamento de arquivos em tempo real: decisão registrada no Registro. Se for grande, vira ticket próprio.

## Onde
- web/src/hooks/useStudio.ts
- Servidor do Studio: rotas de árvore e de manuais (confirmar o arquivo ao começar).

## Como verificar
Com a aba do Studio em segundo plano, criar uma página e um manual pela API. Voltar o foco à aba: a árvore e o menu mostram os dois, e o link do manual novo abre. Alterar um arquivo com um editor externo e voltar à aba: a tela mostra a nova versão ou o aviso.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

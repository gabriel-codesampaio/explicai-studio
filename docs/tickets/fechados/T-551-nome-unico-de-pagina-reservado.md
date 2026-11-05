# T-551: uniquePath reserva o nome (duplo clique cria dois nós num arquivo)

- Prioridade: P1
- Tamanho: P
- Status: fechado
- Agente: supervisor
- Origem: audit ponytail 2026-11-05

## Problema
`uniquePath` (src/core/fs.ts) só checa existência. Dois POST /pages simultâneos com título vazio (duplo clique em Nova página) escolhem o mesmo sem-titulo.md: dois nós na árvore, um arquivo. Afeta addPage, rename em updatePage, saveVersion, restorePage.

## Critérios de aceite
- [ ] `uniquePath` reserva o nome (wx; mkdir quando sem extensão) e tenta o próximo em EEXIST.
- [ ] Laço de retry de `saveAsset` sai.
- [ ] Teste: 2 addPage simultâneos com título vazio -> arquivos diferentes.

## Registro
- Fechado na branch fix/ponytail-core. uniquePath reserva (wx/mkdir) e tenta o próximo; laço de saveAsset removido; teste de 2 addPage com título vazio.

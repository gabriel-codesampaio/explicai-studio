# T-120: `settleRenames` corre com o autosave e mostra conflito falso

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: revisão de código da release 0.2.0 (2026-11-03)

## Problema
`settleRenames` (`web/src/hooks/useStudio.ts`) manda `PUT` com `fileName: "sync"` fora da fila do autosave. Se o autosave de digitação estiver em voo, ele leva a versão antiga no `If-Match` e recebe 409: a faixa de conflito aparece sem edição externa. Não perde dado.

## Critérios de aceite
- [ ] `settleRenames` roda na mesma serialização do autosave (ou refaz a busca da versão e tenta uma vez).
- [ ] Depois de `sync` com troca de arquivo, atualizar `versions` da página aberta.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
`web/src/hooks/useStudio.ts` (`settleRenames`), `web/src/hooks/useAutosave.ts`.

## Registro
<!-- preenchido ao fechar -->

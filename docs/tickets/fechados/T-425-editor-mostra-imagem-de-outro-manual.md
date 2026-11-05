# T-425: Editor mostra a imagem de outro manual

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: 2026-11-04, relatório do lote de medição, diagnóstico do T-129 (`studio.reduzir.e2e.ts:78`)

## Problema
Sob carga, com dois manuais em uso no mesmo servidor, o `<img>` do editor carregou a imagem de OUTRO manual (slug divergente, medido). O painel Reduzir some porque a imagem errada já tem 1600 px. Pode ser só do teste paralelo, mas se o Studio monta a URL da imagem com o slug de um manual que não é o aberto, é perda de confiança e vazamento entre manuais de clientes.

## Critérios de aceite
- [x] Achar de onde o editor tira o slug (`PageView`/`useStudio`/`assetUrl`) e provar se o Studio real pode mostrar imagem de outro manual ao trocar de manual.
- [x] Se puder: corrigir na origem, com teste que troca de manual e confere a URL da imagem.
- [x] Se for só do e2e (estado entre workers): corrigir o teste e registrar no T-129.

## Registro
- Fechado, sem hash (2026-11-05). Causa do e2e: `bigPng` fazia `page.goto("/")`; o Studio abre o 1º manual da lista (de outro worker, também com `tela.png`) e `showPage` grava o endereço dele no hash (`replaceState`). O `page.reload()` seguinte recarrega o hash já trocado e o editor mostra a página do vizinho (já reduzida a 1600 px). Corrigido em `e2e/studio.reduzir.e2e.ts` (`about:blank`).
- Studio real: o slug do `<img>` vem de `manual.slug` na montagem do `Editor` (conteúdo fixo, sem refetch de imagem; cache HTTP é por URL com slug). Brecha medida: `openManual` não sequenciava `getManual`; ao trocar de manual rápido, a resposta lenta do manual antigo sobrescrevia `manual` e o `PageView` montava com o slug errado (mesmo `assets/tela.png`). Teste em `web/test/useStudio.test.tsx` falha sem a correção e passa com ela. Correção em `web/src/hooks/useStudio.ts` (`openManual`, usa `openSeq`).
- Fora: `syncRef` (foco) ainda chama `refreshManual(manual.slug)` com closure; não provado como causa, não mexido.

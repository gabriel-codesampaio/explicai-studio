# T-425: Editor mostra a imagem de outro manual

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: 2026-11-04, relatório do lote de medição, diagnóstico do T-129 (`studio.reduzir.e2e.ts:78`)

## Problema
Sob carga, com dois manuais em uso no mesmo servidor, o `<img>` do editor carregou a imagem de OUTRO manual (slug divergente, medido). O painel Reduzir some porque a imagem errada já tem 1600 px. Pode ser só do teste paralelo, mas se o Studio monta a URL da imagem com o slug de um manual que não é o aberto, é perda de confiança e vazamento entre manuais de clientes.

## Critérios de aceite
- [ ] Achar de onde o editor tira o slug (`PageView`/`useStudio`/`assetUrl`) e provar se o Studio real pode mostrar imagem de outro manual ao trocar de manual.
- [ ] Se puder: corrigir na origem, com teste que troca de manual e confere a URL da imagem.
- [ ] Se for só do e2e (estado entre workers): corrigir o teste e registrar no T-129.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

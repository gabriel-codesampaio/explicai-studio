# T-542: Trocar o arquivo de uma imagem mantendo as marcações

- Prioridade: P2
- Tamanho: G
- Status: aberto
- Agente: frontend (+ qa)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 3 (esforço M, risco M)

## Problema
A tela mudou um pouco; a pessoa tira um print novo e hoje refaz marcadores, destaques e áreas clicáveis. É o "manual fica desatualizado" de `PRODUCT.md`. Coordenadas são relativas (0 a 1, `manual-format.md`, "Anotações da imagem"), então um tamanho diferente desloca as marcas sem aviso: risco de a marca ficar no lugar errado sem a pessoa notar.

## Escopo
- Ação "Trocar imagem" no balão da imagem: grava o arquivo novo, mantém o `.json`, mostra as marcas sobre o print novo.
- Aviso se a proporção mudou mais de uns 2% (valor a medir antes).
- Desfazer = o arquivo antigo vai para a lixeira.
- Sem alinhamento automático.

## Fora
Alinhamento automático; captura de tela.

## Critérios de aceite
- [ ] "Trocar imagem" no balão troca o arquivo, mantém o `.json`, e as marcas aparecem sobre o print novo.
- [ ] Com proporção mudando mais que o limite medido, aviso visível antes de confirmar; o limite fica anotado no Registro.
- [ ] Arquivo antigo vai para a lixeira e pode ser restaurado.
- [ ] Formato em disco não muda (`manual-format.md` igual).
- [ ] Teste: marcação com coordenadas relativas cai no mesmo lugar relativo no print novo.
- [ ] Referência da imagem na página atualizada; sem imagem órfã (`findUnusedAssets`).

## Onde
Balão/popover da imagem (`web/src/features/editor/ImagePopover.tsx`), rota de upload de imagem, lixeira existente. Dependências: lixeira e `findUnusedAssets` já existem.

## Como verificar
e2e: trocar a imagem, conferir as marcas e a lixeira; teste de unidade da regra de proporção.

## Riscos
Marca no lugar errado sem a pessoa notar (por isso o aviso).

## Decisões pendentes
2. **Quanto vale a feature 3 contra a 4 (busca, T-543)?** Recomendação do relatório: esta primeiro. É a única que ataca a dor "tela mudou", momento de uso citado no `PRODUCT.md`. Antes, medir quantas vezes a pessoa refaz marcação ao trocar print.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

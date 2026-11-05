# T-542: Trocar o arquivo de uma imagem mantendo as marcações

- Prioridade: P2
- Tamanho: G
- Status: fechado
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
- [x] "Trocar imagem" no balão troca o arquivo, mantém o `.json`, e as marcas aparecem sobre o print novo.
- [x] Com proporção mudando mais que o limite medido, aviso visível antes de confirmar; o limite fica anotado no Registro.
- [x] Arquivo antigo vai para a lixeira e pode ser restaurado.
- [x] Formato em disco não muda (`manual-format.md` igual).
- [x] Teste: marcação com coordenadas relativas cai no mesmo lugar relativo no print novo.
- [x] Referência da imagem na página atualizada; sem imagem órfã (`findUnusedAssets`).

## Onde
Balão/popover da imagem (`web/src/features/editor/ImagePopover.tsx`), rota de upload de imagem, lixeira existente. Dependências: lixeira e `findUnusedAssets` já existem.

## Como verificar
e2e: trocar a imagem, conferir as marcas e a lixeira; teste de unidade da regra de proporção.

## Riscos
Marca no lugar errado sem a pessoa notar (por isso o aviso).

## Decisão
Decidido em 2026-11-05: sim, logo depois da fila de UI/UX. Primeira versão: print de tamanho diferente mostra aviso para conferir as marcações, sem realinhar sozinho.

## Registro
- 2026-11-05: Decidido em 2026-11-05: sim, logo depois da fila de UI/UX. Primeira versão: print de tamanho diferente mostra aviso para conferir as marcações, sem realinhar sozinho.
- 2026-11-05: feito em `feat/trocar-imagem`. "Trocar imagem" no balão (`ReplaceImage.tsx`): `POST /assets/replace` grava o arquivo novo no mesmo caminho (Markdown e `.json` não mudam, então as marcas relativas ficam no mesmo ponto proporcional) e copia o antigo para `.lixeira/imagens-<data>/assets/`; o toast tem Desfazer (`/assets/replace/undo`, que troca de volta sem perder o que estava no lugar). Sem imagem órfã: o caminho é o mesmo e a cópia da lixeira não conta em `findUnusedAssets`.
- Limite medido: 2% na proporção largura/altura. Numa captura de 1280 px, 2% deslocam o conteúdo ~26 px (um marcador tem 24 px); 5% seriam ~64 px, quase três marcadores. Acima de 2% o balão mostra o aviso e pede "Trocar mesmo assim"; até 2% troca direto. Regra em `web/src/lib/imageAspect.ts`.
- Fora: formato diferente do atual (ex.: .jpg no lugar de .png) é recusado (a extensão do arquivo é o caminho das marcações); a lixeira de páginas não lista imagens, o Desfazer é o toast (a pasta `.lixeira/imagens-*` segue restaurável à mão).

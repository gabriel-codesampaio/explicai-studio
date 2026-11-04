# T-175: Alinhar o nome das ferramentas de marcação ao texto visível

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado B5 (avaliado no commit 60a0e3d)

## Problema
Achado B5, axe sério, critério 2.5.3. Sete ferramentas da marcação têm nome "Selecionar" e texto visível "Selecionar V". A correção sugerida no relatório (esconder a letra do nome acessível) não resolve sozinha: o critério pede que o texto visível esteja contido no nome acessível. Conferir antes de escolher.

## Critérios de aceite
- [x] Cada ferramenta tem nome acessível único e igual ao texto visível, ou o texto visível sai da tela.
- [x] Atalho de letra (T-014) mantido.
- [x] Axe sem violação de 2.5.3 na marcação.

## Onde
- web/src/features/annotations/AnnotationEditor.tsx

## Como verificar
Rodar axe na marcação. Conferir o nome acessível de cada ferramenta no snapshot e testar o atalho de letra.

## Registro
Commit `9f3f8a1`. Causa: o `aria-label` criava um nome separado do texto da tela. O botão agora tira o nome do rótulo, que em tela estreita fica em `sr-only`. A letra continua visível como dica, com `aria-hidden` e `aria-keyshortcuts`. Decisão: a letra não faz parte do nome, porque repeti-la no nome faria o leitor de tela anunciar o atalho duas vezes.

Verificado a 1280, a 375 com mouse e a 375 com toque: os 7 nomes únicos e os 7 atalhos funcionam, e o axe não aponta `label-content-name-mismatch` nem `button-name`. E2e de imagem, ocultar e recortar: 48 de 48. Leitor de tela real não foi testado.

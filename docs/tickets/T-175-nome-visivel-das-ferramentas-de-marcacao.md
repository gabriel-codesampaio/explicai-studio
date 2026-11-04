# T-175: Alinhar o nome das ferramentas de marcação ao texto visível

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado B5 (avaliado no commit 60a0e3d)

## Problema
Achado B5, axe sério, critério 2.5.3. Sete ferramentas da marcação têm nome "Selecionar" e texto visível "Selecionar V". A correção sugerida no relatório (esconder a letra do nome acessível) não resolve sozinha: o critério pede que o texto visível esteja contido no nome acessível. Conferir antes de escolher.

## Critérios de aceite
- [ ] Cada ferramenta tem nome acessível único e igual ao texto visível, ou o texto visível sai da tela.
- [ ] Atalho de letra (T-014) mantido.
- [ ] Axe sem violação de 2.5.3 na marcação.

## Onde
- web/src/features/annotations/AnnotationEditor.tsx

## Como verificar
Rodar axe na marcação. Conferir o nome acessível de cada ferramenta no snapshot e testar o atalho de letra.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

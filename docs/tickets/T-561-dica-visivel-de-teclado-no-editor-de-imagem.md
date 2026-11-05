# T-561: Dica visível de teclado no editor de imagem

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: design do lote 1 (T-525 parcial)

## Problema
As dicas visíveis de cada ferramenta ("Clique onde o número deve ficar", `AnnotationEditor.tsx:48`) não citam o teclado; Tab, setas e Enter só são anunciados para leitor de tela.

## Critérios de aceite
- [x] Dicas incluem "Ou Tab, setas e Enter." (pt e en, `i18n.en.ts`).
- [x] Sem quebra de layout a 375 e 1280.

## Registro
Dicas das 6 ferramentas de desenho terminam em "Ou Tab, setas e Enter." (pt e en). Texto só cresce uma frase curta; o `<p>` já quebra linha. Largura 375/1280 não medida no navegador (fica para o design). Commit: ver git log.

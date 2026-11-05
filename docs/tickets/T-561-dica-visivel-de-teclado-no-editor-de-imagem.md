# T-561: Dica visível de teclado no editor de imagem

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: design do lote 1 (T-525 parcial)

## Problema
As dicas visíveis de cada ferramenta ("Clique onde o número deve ficar", `AnnotationEditor.tsx:48`) não citam o teclado; Tab, setas e Enter só são anunciados para leitor de tela.

## Critérios de aceite
- [ ] Dicas incluem "Ou Tab, setas e Enter." (pt e en, `i18n.en.ts`).
- [ ] Sem quebra de layout a 375 e 1280.

## Registro
<!-- preenchido ao fechar -->

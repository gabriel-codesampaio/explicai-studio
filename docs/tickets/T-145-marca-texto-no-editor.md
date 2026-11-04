# T-145: Marca-texto (caneta marcadora) no editor

- Prioridade: P2
- Tamanho: G
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
A pessoa quer destacar trecho de texto como com caneta marca-texto amarela (visual de 9.png).

## Decisão
Botão na barra do editor e atalho; formato no arquivo `==texto==` (Markdown legível fora do Studio). No HTML e no PDF vira `<mark>` com o amarelo da marca-texto (mesmo token do destaque do export, contraste do texto >= 4,5:1); no Markdown exportado fica `==texto==`.

## Critérios de aceite
- [ ] Ida e volta do Markdown sem perda (`web/test/markdown.test.ts`); manual antigo igual.
- [ ] HTML e PDF mostram o realce; impressão preserva a cor (`print-color-adjust`).
- [ ] Botão com nome acessível e estado ativo; pt/en; e2e.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

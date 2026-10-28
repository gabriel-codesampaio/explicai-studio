---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Estilo de código

- Comentários e mensagens de erro em português. Nomes de variáveis, funções e tipos em inglês.
- Mensagem de erro diz o que está errado e onde, por exemplo `markers[2].x: número entre 0 e 1`.
- Comente só o porquê que o código não mostra, em uma linha.
- Prefira funções puras e `node:` built-ins a novas dependências.
- Sem `any`. Dados de fora (disco, Agent, navegador) entram como `unknown` e passam por validação.
- Imports relativos com extensão `.js`, por causa do ESM com NodeNext.

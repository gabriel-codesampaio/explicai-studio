---
paths:
  - "src/**"
  - "test/**"
---

# Testes

- Todo comportamento novo do núcleo ganha teste em `test/`.
- Os testes usam pastas temporárias reais (`mkdtemp`), sem mock de sistema de arquivos.
- Bug corrigido ganha um teste que falhava antes da correção.
- Nome do teste em português, descrevendo o comportamento: "mantém o nome do arquivo quando o título muda".

---
paths:
  - "src/core/**"
  - "docs/manual-format.md"
---

# Formato do manual

- `docs/manual-format.md` é a especificação. Mudou o formato? Atualize o documento no mesmo commit.
- Mudança incompatível com arquivos já gravados exige subir `FORMAT_VERSION` e escrever a migração.
- Todo caminho recebido de fora passa por `resolveInside` antes de tocar no disco.
- Gravações usam `atomicWrite`. Nunca `writeFile` direto num arquivo existente.
- URL de área clicável aceita só `http`, `https` e `mailto`, porque o HTML exportado vira site.

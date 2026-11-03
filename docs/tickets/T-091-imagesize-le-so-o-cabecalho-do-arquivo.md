# T-091: `imageSize` lê só o cabeçalho do arquivo

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 8 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
PNG, GIF e WebP guardam as dimensões nos primeiros bytes; JPEG, nos primeiros KB. O código carrega o arquivo todo (até 20 MB) por imagem e depois o `copyFile` lê de novo.

## Critérios de aceite
- [ ] `open` + `read` de 64 KB no começo; SVG: 4 KB. JPEG progressivo com EXIF grande: se não achar o marcador SOF nos 64 KB, ler o resto.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
`src/core/export/imageSize.ts:77` (`readFile`), chamado de `src/core/export/refs.ts:37`, sequencial.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 8 da auditoria.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

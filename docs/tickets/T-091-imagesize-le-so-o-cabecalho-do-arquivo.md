# T-091: `imageSize` lê só o cabeçalho do arquivo

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 8 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
PNG, GIF e WebP guardam as dimensões nos primeiros bytes; JPEG, nos primeiros KB. O código carrega o arquivo todo (até 20 MB) por imagem e depois o `copyFile` lê de novo.

## Critérios de aceite
- [x] `open` + `read` de 64 KB no começo; SVG: 4 KB. JPEG progressivo com EXIF grande: se não achar o marcador SOF nos 64 KB, ler o resto.
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
`src/core/export/imageSize.ts:77` (`readFile`), chamado de `src/core/export/refs.ts:37`, sequencial.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 8 da auditoria.

## Registro
Fechado na branch fix/lote-4-tecnico. `open` + `read` de 64 KB; JPEG sem SOF nesse trecho (EXIF grande) lê o arquivo todo. Testes: SOF no começo, EXIF >64 KB, PNG grande. Ficou de fora: a leitura sequencial em refs.ts e o limite de 4 KB para SVG (os 64 KB já bastam).

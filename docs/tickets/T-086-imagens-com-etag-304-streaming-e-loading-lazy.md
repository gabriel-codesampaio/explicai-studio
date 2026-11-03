# T-086: Imagens com ETag/304, streaming e `loading="lazy"`

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 3 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
a cada abertura de página, o navegador rebaixa todas as imagens, e o Node carrega cada arquivo inteiro na memória antes de responder. Assets têm nome único e nunca mudam depois de gravados (`saveAsset`, `flag: "wx"`), então o `no-cache` não protege nada.

## Critérios de aceite
- [ ] `stat` + `ETag` por tamanho e mtime, responder 304; trocar `readFile` por `createReadStream(...).pipe(res)`; `cache-control: private, max-age=3600` nas imagens de `assets/`. `loading="lazy"` e `decoding="async"` no node de imagem do editor.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
`src/server/http.ts:38-47` (`readFile` do arquivo inteiro; `cache-control: no-cache` sem `ETag` nem `Last-Modified`, então nunca vira 304); limite de envio de 20 MB por imagem em `src/server/routes/assets.ts:145`.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 3 da auditoria.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

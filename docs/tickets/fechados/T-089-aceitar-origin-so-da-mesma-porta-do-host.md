# T-089: Aceitar Origin só da mesma porta do Host

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 6 (`docs/discovery/archives/2026-11-02-auditoria-ponytail.md`)

## Problema
Host e Origin são checados, mas Origin `http://localhost:3000` passa. Um `POST` com `text/plain` não dispara preflight, então o navegador envia, e o servidor lê o corpo como JSON. `PUT` e `DELETE` ficam protegidos (preflight falha, não há CORS). A resposta não é legível por quem enviou.

## Critérios de aceite
- [ ] aceitar Origin só se for `http://${req.headers.host}` (mesma porta; funciona com o proxy do Vite, que mantém Host e Origin em 5173). Segunda camada: exigir `content-type: application/json` onde `readJson` é usado.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
`src/server/security.ts:5` (`LOCAL_ORIGIN` aceita qualquer porta); `src/server/http.ts:67-86` (`readJson` não confere `content-type`).

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 6 da auditoria.

## Registro
Commit 0b27143. Origin deve ser igual a http://<Host> (porta inclusa); o proxy do Vite não reescreve o Host (changeOrigin desligado), então 5173 continua valendo. readJson recusa corpo não JSON com 415 (unsupported-media-type); corpo vazio passa, e curl/MCP sem Origin também. Testes: test/security.test.ts, test/server-security.test.ts. Upload binário de imagem/logo fica fora (readBody).

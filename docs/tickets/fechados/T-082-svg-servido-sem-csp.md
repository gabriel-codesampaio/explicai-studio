# T-082: CSP e sandbox nas respostas de /files/ (SVG na origem do Studio)

- Prioridade: P1
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: revisão de segurança do lote 7 e auditoria ponytail, achado 1 (`docs/discovery/archives/2026-11-02-auditoria-ponytail.md`)

## Problema
O servidor serve /files/... como image/svg+xml sem Content-Security-Policy; abrir a URL do SVG direto executaria um <script> dentro dele na origem do Studio.

## Critérios de aceite
- [ ] SVG sai com `content-security-policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` e continua aparecendo por <img>.

## Onde
src/server/http.ts (send)

## Como verificar
Teste do servidor conferindo o cabeçalho; SVG ainda carrega no editor e no export.

## Registro
Commit 0b27143. Teste vermelho: test/server-security.test.ts (CSP em /files/ para SVG e não raster; PNG e app sem CSP). E2E de imagem, logo e exportação (52 casos) passam, o SVG segue por <img>. Doc: manual-format.md não precisou mudar.

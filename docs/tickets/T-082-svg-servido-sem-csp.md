# T-082: CSP e sandbox nas respostas de /files/ (SVG na origem do Studio)

- Prioridade: P1
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: revisão de segurança do lote 7 e auditoria ponytail, achado 1 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
O servidor serve /files/... como image/svg+xml sem Content-Security-Policy; abrir a URL do SVG direto executaria um <script> dentro dele na origem do Studio.

## Critérios de aceite
- [ ] SVG sai com `content-security-policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` e continua aparecendo por <img>.

## Onde
src/server/http.ts (send)

## Como verificar
Teste do servidor conferindo o cabeçalho; SVG ainda carrega no editor e no export.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

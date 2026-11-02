# T-082: Servir SVG de assets/ com CSP restritiva

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: revisão de segurança do lote 7 (2026-11-02)

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

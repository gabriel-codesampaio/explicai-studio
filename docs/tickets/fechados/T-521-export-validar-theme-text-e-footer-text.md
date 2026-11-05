# T-521: Exportação valida theme.text e footer.text

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: rodada pesada da 1.0.0, 2026-11-05

## Problema
Em src/core/export/html.ts:101 `theme.text` entra em `muted()` sem validar HEX; em footer.ts `footer.text.trim()` quebra se o manual.json editado à mão tiver número. A exportação cai.

## Critérios de aceite
- [x] Valor inválido cai no padrão (HEX.test; typeof string como em coverLines), com teste.

## Registro
- Achado na revisão/matriz da 1.0.0; não bloqueia a versão.
- Fechado na branch fix/ultimos-1-0. theme.text só entra em muted() se HEX; footer.text não-string conta como vazio; teste em test/export-xss.test.ts.

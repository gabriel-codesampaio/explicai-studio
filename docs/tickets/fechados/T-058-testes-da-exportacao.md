# T-058: Testes da exportação (refs, collect, labels, safeHref, XSS, PDF)

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: qa

## Critérios de aceite
- [x] refs, collect e labels com teste de unidade.
- [x] safeHref: `javascript:`, `data:`, `vbscript:`, espaços, maiúsculas e entidades.
- [x] Título, alt, legenda, área clicável, idioma e nome do manual escapados no HTML (XSS).
- [x] Rota do PDF com o navegador de mentira, e o erro `no-browser` (400 com o código).

## Registro
Bugs achados e corrigidos:
- f83e3ec: `decodeURI` lançava URIError com `100%.png` ou `./100%.md` em página; derrubava a exportação inteira (HTML e Markdown) e a contagem de imagens sem uso. Agora `decodeUri` (src/core/text.ts) devolve o texto como está.
- 5f32ddf: `imageSize` de SVG montava a regex em template string sem escapar as barras (`\s`, `\d`), então `width` e `height` nunca eram lidos.

Sem bug: nenhuma brecha de XSS achada; safeHref e o escape do HTML aguentam todas as variações testadas. Testes: test/export-parts.test.ts, test/export-xss.test.ts, test/export-pdf.test.ts, test/image-size.test.ts.

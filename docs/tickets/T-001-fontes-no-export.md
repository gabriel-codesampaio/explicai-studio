# T-001: Embutir as fontes da marca no manual exportado

- Prioridade: P0
- Status: feito
- Agente: core
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O HTML exportado declara Archivo, Atkinson Hyperlegible Next e JetBrains Mono, mas não leva os arquivos das fontes (`document.fonts` vazio). Os títulos saem em Arial Narrow e o texto cai em Segoe UI em quem não tem as fontes instaladas. É o que o leitor final vê, e o PDF herda o problema.

## Critérios de aceite
- [x] O HTML exportado mostra Archivo nos títulos, Atkinson no texto e JetBrains Mono nos números, numa máquina sem essas fontes instaladas.
- [x] O PDF exportado sai com as mesmas fontes.
- [x] As fontes vão junto com o HTML (embutidas ou em `exportacao/html/fonts/`), sem depender de internet.
- [x] O tamanho extra do export é informado no Registro.

## Onde
`src/core/export/html.ts` (CSS `--display`, `--texto`, `--mono`), `src/core/export/index.ts` (cópia de arquivos); fontes de `@fontsource` (licença OFL, checar). Atenção: hoje os `@fontsource` são `devDependencies` e não vão no pacote publicado; a solução precisa funcionar com `npx explicai` (fontes em `dist/` ou dependência de produção).

## Como verificar
Teste em `test/export.test.ts` que confere o `@font-face` no HTML; abrir o HTML exportado no navegador e conferir `document.fonts` carregadas; exportar PDF e olhar os títulos.

## Registro
Commits: a8b724b (feat(export): embutir as fontes da marca no HTML exportado), e2aeb2f (teste das licenças e do `files`), e o commit que fecha este ticket.

O que foi feito: as fontes ficam em `fonts/` na raiz do pacote (woff2 latin de Archivo variável, JetBrains Mono variável e Atkinson Hyperlegible Next 400, 400 itálico e 700, com as três licenças OFL 1.1) e entram em `files` no package.json. Os `@fontsource` continuam como devDependencies; o `npx explicai` não ganhou dependência. A exportação copia a pasta para `exportacao/html/fonts/` e o CSS declara os `@font-face` com `font-display:block`, para o PDF não sair antes de a fonte carregar.

Verificação (qa): no Chrome, `document.fonts` com as 5 faces em `loaded`, numa máquina sem as fontes instaladas, e nenhuma requisição fora de file://. O PDF embute Archivo, AtkinsonHyperlegibleNext (regular, itálico e negrito) e JetBrainsMono, em 10 de 10 exportações. Pacote gerado com `npm pack`, instalado numa pasta limpa, exportou HTML e PDF com as fontes. `npm run check` (92 testes) e `npm run test:e2e` (10 testes) verdes.

Tamanho extra do export: 127.938 bytes (114.312 de woff2 e 13.626 das licenças). O pacote publicado cresce o mesmo.

Ficou de fora: subset latin-ext (setas como "→" caem na fonte do sistema; português e inglês estão cobertos pelo latin), itálico do Archivo e do JetBrains Mono e negrito itálico do Atkinson (o navegador sintetiza), e a largura `wdth` 112 do Archivo que o Studio usa nos títulos. `font-display:block` deixa o texto invisível por uns 3 s se alguém enviar só o `index.html` sem a pasta `fonts/`; mantido por causa do PDF.

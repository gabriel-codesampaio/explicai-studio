# T-001: Embutir as fontes da marca no manual exportado

- Prioridade: P0
- Status: aberto
- Agente: core
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O HTML exportado declara Archivo, Atkinson Hyperlegible Next e JetBrains Mono, mas não leva os arquivos das fontes (`document.fonts` vazio). Os títulos saem em Arial Narrow e o texto cai em Segoe UI em quem não tem as fontes instaladas. É o que o leitor final vê, e o PDF herda o problema.

## Critérios de aceite
- [ ] O HTML exportado mostra Archivo nos títulos, Atkinson no texto e JetBrains Mono nos números, numa máquina sem essas fontes instaladas.
- [ ] O PDF exportado sai com as mesmas fontes.
- [ ] As fontes vão junto com o HTML (embutidas ou em `exportacao/html/fonts/`), sem depender de internet.
- [ ] O tamanho extra do export é informado no Registro.

## Onde
`src/core/export/html.ts` (CSS `--display`, `--texto`, `--mono`), `src/core/export/index.ts` (cópia de arquivos); fontes de `@fontsource` (licença OFL, checar). Atenção: hoje os `@fontsource` são `devDependencies` e não vão no pacote publicado; a solução precisa funcionar com `npx explicai` (fontes em `dist/` ou dependência de produção).

## Como verificar
Teste em `test/export.test.ts` que confere o `@font-face` no HTML; abrir o HTML exportado no navegador e conferir `document.fonts` carregadas; exportar PDF e olhar os títulos.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

# T-111: Pacote npm pronto para publicar (files, metadados, README, CHANGELOG)

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: qa
- Origem: preparação da versão de produção (2026-11-03)

## Problema
O pacote precisa sair só com o necessário e com README, metadados bilíngues e CHANGELOG para quem chega pelo npm.

## Critérios de aceite
- [x] `npm pack --dry-run`: só dist, fonts, LICENSE, README (+ CHANGELOG); sem test/e2e/docs.
- [x] `files`, `bin`, `engines`, description/keywords/repository/homepage/bugs completos.
- [x] README pronto para o npm (pt e en); CHANGELOG.md.
- [x] `npx` do tarball num diretório limpo no Windows abre o Studio.
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
package.json, README.md, CHANGELOG.md

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`.

## Registro
Commits 655ddfe (package.json e teste), README e CHANGELOG na mesma branch. Pacote caiu de 179 para 136 arquivos (1,3 MB, 2,3 MB descompactado) com `!dist/**/*.map`. test/package.test.ts confere conteúdo do tarball, licenças OFL, bin, engines, exports e metadados. `npx --yes ./explicai-0.1.0.tgz` num diretório limpo no Windows abriu o Studio (porta 4793, `--no-open`), servindo `/`, `/api/manuals`, assets de dist/web e exportando HTML, Markdown e PDF com as fontes. Fora: versão (decisão da pessoa), publicação, tag, provenance.

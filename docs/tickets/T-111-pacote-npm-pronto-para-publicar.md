# T-111: Pacote npm pronto para publicar (files, metadados, README, CHANGELOG)

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: qa
- Origem: preparação da versão de produção (2026-11-03)

## Problema
O pacote precisa sair só com o necessário e com README, metadados bilíngues e CHANGELOG para quem chega pelo npm.

## Critérios de aceite
- [ ] `npm pack --dry-run`: só dist, fonts, LICENSE, README (+ CHANGELOG); sem test/e2e/docs.
- [ ] `files`, `bin`, `engines`, description/keywords/repository/homepage/bugs completos.
- [ ] README pronto para o npm (pt e en); CHANGELOG.md.
- [ ] `npx` do tarball num diretório limpo no Windows abre o Studio.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
package.json, README.md, CHANGELOG.md

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

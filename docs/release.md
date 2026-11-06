# Checklist de release do Studio

Vale para toda versão do pacote `explicai`. O MCP tem release própria. Publicar no npm pede o ok da pessoa.

## Antes da tag

1. Fila do Studio vazia: `npm run tickets` sem ticket do Studio aberto. Ficam de fora os do MCP e os de observação de CI (sem defeito a consertar, só esperam rodadas).
2. Rodada pesada na `main` atualizada:
   - [ ] `npm run check` e `npm run test:e2e` completos, sem falha (instável: repetir com `--repeat-each=3` antes de aceitar).
   - [ ] CI verde em Linux, Windows e macOS no último commit da `main`.
   - [ ] Matriz de tela: 375 e 1280, claro e escuro, pt e en, nas telas mudadas desde a última versão.
   - [ ] Revisão de código do que entrou desde a última tag (`git log vX.Y.Z..main`).
   - [ ] `npm audit --omit=dev` sem alta nem crítica.
   - [ ] Agente `seguranca` no diff desde a última tag: sem segredo nem caminho pessoal.
3. Formato: `FORMAT_VERSION` igual, mudança só por acréscimo ([política](manual-format.md#compatibilidade)); fixtures antigas passam (`test/old-manuals.test.ts`).
4. `CHANGELOG.md`: `[Unreleased]` vira `[X.Y.Z] - AAAA-MM-DD`, com tudo o que a pessoa nota, em pt e o resumo em en.
5. `package.json` e `package-lock.json` com a versão nova (`npm version X.Y.Z --no-git-tag-version`).
6. README, `docs/manual-format.md` e landing (`explicai-website`) dizem o que a versão faz e pede (Node 22.12+).
7. Landing: prints da página de Recursos refeitos com a tela atual (`site/img/feat-*`, pt e en, claro e escuro, celular e desktop: Aparência do manual e diálogo de marcação mudaram em 2026-11-04) e o rótulo "Studio X.Y" de volta em `features/index.html`.

## Publicar

1. Ok da pessoa, por escrito.
2. PR da versão mesclado na `main`.
3. `git tag vX.Y.Z && git push origin vX.Y.Z`. O workflow `Release` confere tag = versão, roda `prepublishOnly`, publica com provenance e cria a release no GitHub com o trecho do CHANGELOG.

## Depois

- [ ] `npm view explicai version` mostra a versão nova; `npx explicai@X.Y.Z --version` roda numa pasta vazia.
- [ ] Release no GitHub com as notas certas.
- [ ] Landing e brand book com a versão nova, se citam.
- [ ] Post do blog só se a pessoa pedir.

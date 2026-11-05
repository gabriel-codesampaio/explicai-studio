# T-483: A promessa "qualquer 1.x abre" precisa de teste

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: qa
- Origem: relatório da rodada final, 2026-11-04 (revisão do T-207)

## Problema
`docs/manual-format.md:258` promete que manual de qualquer 1.x abre na 1.x seguinte, mas só existem fixtures 0.1 a 0.3. O texto também cita `explicai migrate`, que não existe.

## Critérios de aceite
- [x] Fixture de manual 1.0 (com style por marcador, capa, rodapé, fonte de trecho e públicos) entra em `test/old-manuals.test.ts` no release da 1.0.
- [x] `explicai migrate` aparece só como plano ("se um dia houver v2"), não como comando.

## Registro
- Commit: (sem hash; fechado no lote regr)
- Feito: fixture `test/fixtures/manuais-antigos/1.0` (cópia da 0.3 com `cover`, `footer`, `style` em marcador e destaque, `<span data-font>` e públicos) entra em `describe.each` de `test/old-manuals.test.ts`, mais um teste que confere capa, rodapé, style e fonte no disco e no export HTML. `explicai migrate` nunca existiu no CLI, no help nem nos testes: só o texto de `docs/manual-format.md` (Migração, Manual de formato mais novo) e `docs/discovery/archives/versao-1-0.md` o citavam; agora aparecem como plano, sem comando. O núcleo de leitura e o `format-newer` ficam como estão.
- Fora: o `style` do marcador não aparece no HTML exportado porque a página B usa a versão publicada sem imagem; checado só no disco.

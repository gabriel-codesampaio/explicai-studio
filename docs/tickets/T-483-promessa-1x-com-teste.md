# T-483: A promessa "qualquer 1.x abre" precisa de teste

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: qa
- Origem: relatório da rodada final, 2026-11-04 (revisão do T-207)

## Problema
`docs/manual-format.md:258` promete que manual de qualquer 1.x abre na 1.x seguinte, mas só existem fixtures 0.1 a 0.3. O texto também cita `explicai migrate`, que não existe.

## Critérios de aceite
- [ ] Fixture de manual 1.0 (com style por marcador, capa, rodapé, fonte de trecho e públicos) entra em `test/old-manuals.test.ts` no release da 1.0.
- [ ] `explicai migrate` aparece só como plano ("se um dia houver v2"), não como comando.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->

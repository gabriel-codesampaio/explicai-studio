# T-059: Dependências de teste (cobertura, Testing Library, axe)

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: qa

## O que entrou
Só em `devDependencies`, versão exata: `@vitest/coverage-v8@5.0.5`, `@testing-library/react@16.3.3`, `@testing-library/user-event@14.6.8`, `@testing-library/dom@10.4.2`, `@axe-core/playwright@4.14.0`, `axe-core@4.14.0` (não a 4.14.1, pré-release).

## Conferido
- Licenças: MIT, exceto axe-core e @axe-core/playwright (MPL-2.0), aceitas só como ferramenta de teste. `files` do package.json = `dist` e `fonts`; o dist não contém axe nem Testing Library.
- Nenhuma GPL/AGPL.
- `@types/react` e `@types/react-dom` já estavam presentes.
- `npm audit`: 0 vulnerabilidades.

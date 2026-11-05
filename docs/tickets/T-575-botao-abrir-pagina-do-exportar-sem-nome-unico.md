# T-575: Botão "Abrir página" do Exportar sem nome único

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: achado de revisão dos PRs de 2026-11-05

## Problema
Na seção Checagem do manual cada achado tem um botão "Abrir página" com o mesmo nome acessível. Leitor de tela ouve N botões iguais.

## Critérios de aceite
- [ ] Cada botão tem nome único (`aria-label` com o título da página e o tipo do achado).

## Onde
`web/src/features/export/ExportFindings.tsx`.

## Como verificar
Teste de unidade em `web/test/exportFindings.test.tsx`: `getByRole('button', { name })` por achado.

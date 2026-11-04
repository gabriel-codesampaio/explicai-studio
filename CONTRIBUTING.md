# Como contribuir

Pode ser correção de texto, relato de bug ou código. Para algo grande, abra uma [issue](https://github.com/gabriel-codesampaio/explicai-studio/issues) antes e converse sobre a ideia, assim você não perde trabalho.

Quem participa segue o [código de conduta](CODE_OF_CONDUCT.md).

*Summary in English at the end.*

## Como rodar

Precisa do Node 22.12 ou mais novo.

```bash
git clone https://github.com/gabriel-codesampaio/explicai-studio.git
cd explicai-studio
npm install
npm run check
```

Para ver o Studio enquanto edita, use dois terminais:

```bash
npm run dev:server   # servidor, com os manuais na pasta exemplos
npm run dev:web      # interface
```

## Antes do pull request

- `npm run check` precisa passar: roda lint, tipos e testes.
- Mudou a tela? Rode também `npm run test:e2e`. Na primeira vez, instale o navegador com `npx playwright install chromium`.
- Bug corrigido vem com um teste que falhava antes da correção.
- Texto da interface existe em português e em inglês.

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/pt-br/), com o tipo em inglês e a descrição em português, no imperativo e sem ponto final:

```
fix(editor): mantém a seleção do link depois do Ctrl+K
docs(tickets): abre T-021 a T-024
```

Um assunto por commit. Regras completas em [.claude/rules/commits.md](.claude/rules/commits.md).

## O que não muda sem conversa

Abra uma issue antes de mexer em:

- o [formato do manual](docs/manual-format.md), porque os manuais das pessoas dependem dele;
- as funções exportadas por `explicai/core`, usadas pelo MCP e por outros programas;
- dependências novas;
- o que define o produto: roda no seu computador, sem conta e sem enviar seus manuais para fora.

## Segurança e denúncias

Achou uma falha de segurança? Não abra issue pública. Escreva para gabriel@codesampa.io.

O mesmo endereço recebe denúncias sobre o código de conduta.

## Summary in English

Contributions are welcome. For anything large, open an [issue](https://github.com/gabriel-codesampaio/explicai-studio/issues) first. Node 20.12 or newer is required.

- Run `npm install`, then `npm run check` (lint, types and tests). It must pass before a pull request.
- If you changed the UI, also run `npm run test:e2e`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/). The type is in English and the description in Portuguese.
- Talk to us before changing the manual format, the `explicai/core` exports, dependencies, or the local-only, no-account nature of the product.
- Report security problems and Code of Conduct issues privately to gabriel@codesampa.io.

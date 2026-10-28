# Explicaí Studio

Editor de manuais open source no estilo do editor do Confluence. Roda localmente com `npx explicai` e salva cada manual como uma pasta de Markdown com imagens. O projeto irmão, `explicai-mcp`, usa o módulo `explicai/core` para montar manuais pela IA.

Especificação da v1: `docs/spec-v1.md`. Formato em disco: `docs/manual-format.md`.

## Stack

- TypeScript 7 em modo estrito, ESM (`"type": "module"`, imports com `.js`)
- Node 20 ou mais novo
- Testes com Vitest
- Editor (próxima etapa): React + Vite + Tiptap 3 com `@tiptap/markdown`

## Comandos

```bash
npm test            # testes
npm run typecheck   # checagem de tipos
npm run build       # compila para dist/
```

Rode `npm test` e `npm run typecheck` antes de dizer que uma tarefa está pronta.

## Estrutura

```
src/core/   formato do manual: ler, gravar, validar (sem dependência de navegador)
test/       testes do núcleo, com pastas temporárias reais
docs/       documentação do formato
```

## Decisões que não mudam sem conversar

- O formato salvo é Markdown. HTML e PDF existem só na exportação.
- O PDF sai do HTML exportado, com Chromium em modo headless. Nada de pacote GPL nem de exportador pago.
- Projeto MIT: não adicione dependência com licença GPL ou AGPL.
- O Studio não captura tela. O print vem de fora.
- Interface em português e inglês.

## Marca

Nome no texto: Explicaí. Em código, pacotes e domínios: `explicai`. Nunca "ExplicAI". Textos de interface seguem o brand book: formais, com "você" e uma ideia por frase. O botão diz o que acontece. Brand book: https://gabriel-codesampaio.github.io/explicai-brandbook/

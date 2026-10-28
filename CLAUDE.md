# Explicaí Studio

Editor de manuais open source no estilo do editor do Confluence. Roda localmente com `npx explicai` e salva cada manual como uma pasta de Markdown com imagens. O projeto irmão, `explicai-mcp`, usa o módulo `explicai/core` para montar manuais pela IA.

Especificação da v1: `docs/spec-v1.md`. Formato em disco: `docs/manual-format.md`.

## Stack

- TypeScript 7 em modo estrito, ESM (`"type": "module"`, imports com `.js`)
- Node 20 ou mais novo
- Testes com Vitest (happy-dom nos testes do editor)
- Editor: React 19 + Vite + Tiptap 3 com `@tiptap/markdown`
- Servidor local: `node:http` puro, sem framework

## Comandos

```bash
npm test            # testes
npm run typecheck   # checagem de tipos (núcleo, servidor e editor)
npm run build       # compila para dist/ (CLI, servidor, núcleo e dist/web)
npm start -- <pasta>  # abre o Studio já compilado

# desenvolvimento com recarga automática, em dois terminais:
npm run dev:server  # servidor na porta 4321, manuais em ./exemplos
npm run dev:web     # editor em http://localhost:5173
```

Rode `npm test` e `npm run typecheck` antes de dizer que uma tarefa está pronta.

## Estrutura

```
src/core/     formato do manual: ler, gravar, validar (sem dependência de navegador)
src/server/   servidor local: API JSON em /api e imagens em /files, só para localhost
src/cli.ts    comando `explicai`
web/src/      editor (React + Tiptap). extensions.ts define o que vira Markdown
test/         testes do núcleo, do servidor e da ida e volta do Markdown
docs/         formato do manual e especificação
```

Mudou `web/src/extensions.ts`? Rode `test/markdown.test.ts`: ele garante que abrir e salvar uma página não perde conteúdo.

## Decisões que não mudam sem conversar

- O formato salvo é Markdown. HTML e PDF existem só na exportação.
- O PDF sai do HTML exportado, com Chromium em modo headless. Nada de pacote GPL nem de exportador pago.
- Projeto MIT: não adicione dependência com licença GPL ou AGPL.
- O Studio não captura tela. O print vem de fora.
- Interface em português e inglês.

## Marca

Nome no texto: Explicaí. Em código, pacotes e domínios: `explicai`. Nunca "ExplicAI". Textos de interface seguem o brand book: formais, com "você" e uma ideia por frase. O botão diz o que acontece. Brand book: https://gabriel-codesampaio.github.io/explicai-brandbook/

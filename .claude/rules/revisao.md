# Revisão

O que a revisão de código (agente `code-reviewer` do plugin explicai-workflow) olha primeiro neste projeto, em ordem de gravidade:

1. Perda de dados: gravação que não é atômica, remoção sem querer, formato que não volta igual ao ser lido.
2. Segurança: caminho vindo de fora sem `resolveInside`, URL sem validação, HTML exportado com conteúdo do usuário sem escape.
3. Formato: mudança em `src/core` sem atualizar `docs/manual-format.md` ou sem teste.
4. Licença: dependência nova com licença GPL ou AGPL.
5. Texto de interface fora da voz da marca (ver CLAUDE.md) ou sem tradução em `web/src/lib/i18n.en.ts`.

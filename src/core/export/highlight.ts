import type { TokenizerAndRendererExtension, Tokens } from "marked";

/**
 * Marca-texto `==texto==` vira `<mark>`. Mesma regra do editor (web/src/features/editor/highlight.ts):
 * `==` colado em texto, na mesma linha; `a == b` e `x===y` ficam como estão. Código o Markdown lê antes.
 */
const OPEN = /(?<!=)==(?=[^\s=])/;
const HIGHLIGHT = /^==(?=[^\s=])([^\n]*?[^\s=])==(?!=)/;

export const highlightExtension: TokenizerAndRendererExtension = {
  name: "highlight",
  level: "inline",
  start: (src) => src.search(OPEN),
  tokenizer(src) {
    const m = HIGHLIGHT.exec(src);
    return m ? { type: "highlight", raw: m[0], tokens: this.lexer.inlineTokens(m[1] ?? "") } : undefined;
  },
  renderer(token) {
    return `<mark>${this.parser.parseInline((token as Tokens.Generic).tokens ?? [])}</mark>`;
  },
};

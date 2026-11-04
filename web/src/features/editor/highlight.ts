import { Mark } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlight: {
      toggleHighlight: () => ReturnType;
    };
  }
}

/**
 * Marca-texto, salvo como `==texto==`. Só abre com `==` colado em texto (não espaço, não `=`) e fecha no mesmo
 * jeito, na mesma linha: `a == b` e `x===y` ficam como texto. Código não passa por aqui (o Markdown o lê antes).
 */
const OPEN = /(?<!=)==(?=[^\s=])/;
const HIGHLIGHT = /^==(?=[^\s=])([^\n]*?[^\s=])==(?!=)/;

export const Highlight = Mark.create({
  name: "highlight",

  parseHTML: () => [{ tag: "mark" }],
  renderHTML: ({ HTMLAttributes }) => ["mark", HTMLAttributes, 0],

  markdownTokenName: "highlight",
  markdownTokenizer: {
    name: "highlight",
    level: "inline",
    start: (src: string) => src.search(OPEN),
    tokenize(src, _tokens, h) {
      const m = HIGHLIGHT.exec(src);
      return m ? { type: "highlight", raw: m[0], tokens: h.inlineTokens(m[1] ?? "") } : undefined;
    },
  },
  parseMarkdown: (token, h) => h.applyMark("highlight", h.parseInline(token.tokens ?? [])),
  renderMarkdown: (node, h) => `==${h.renderChildren(node)}==`,

  addCommands() {
    return {
      toggleHighlight:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    };
  },

  addKeyboardShortcuts() {
    return { "Mod-Shift-h": () => this.editor.commands.toggleHighlight() };
  },
});

import { Mark } from "@tiptap/core";

/**
 * Paleta fixa da cor do texto. No disco fica só o nome; a cor de cada tema está em styles/tokens.css,
 * e a do manual exportado em src/core/export/textColors.ts (mesmos nomes; o teste textColor.test.ts confere).
 */
export const TEXT_COLORS = ["gray", "red", "orange", "green", "blue", "purple"] as const;
export type TextColorName = (typeof TEXT_COLORS)[number];

const isTextColor = (value: string | null): value is TextColorName => (TEXT_COLORS as readonly string[]).includes(value ?? "");

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textColor: {
      setTextColor: (color: TextColorName) => ReturnType;
      unsetTextColor: () => ReturnType;
    };
  }
}

/** Cor de um trecho, salva como `<span data-color="red">texto</span>`. Nome fora da paleta é ignorado. */
export const TextColor = Mark.create({
  name: "textColor",

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-color"),
        renderHTML: (attrs) => ({ "data-color": attrs.color }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-color]", getAttrs: (el) => (isTextColor(el.getAttribute("data-color")) ? null : false) }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },

  // Tokenizer próprio: o HTML comum do Markdown leria o **negrito** de dentro do span como texto.
  markdownTokenName: "textColor",
  markdownTokenizer: {
    name: "textColor",
    level: "inline",
    start: (src: string) => src.indexOf("<span data-color="),
    tokenize(src, _tokens, h) {
      const m = /^<span data-color="([a-z]+)">([\s\S]*?)<\/span>/.exec(src);
      if (!m || !isTextColor(m[1] ?? null)) return undefined;
      return { type: "textColor", raw: m[0], color: m[1], tokens: h.inlineTokens(m[2] ?? "") };
    },
  },

  parseMarkdown: (token, h) => h.applyMark("textColor", h.parseInline(token.tokens ?? []), { color: token.color }),

  renderMarkdown: (node, h) => `<span data-color="${node.attrs?.color}">${h.renderChildren(node)}</span>`,

  addCommands() {
    return {
      setTextColor:
        (color) =>
        ({ commands }) =>
          commands.setMark(this.name, { color }),
      unsetTextColor:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

import { Mark } from "@tiptap/core";
import { matchSpan } from "./spanMark";

/**
 * Fontes que um trecho aceita: as mesmas do manual (src/core/export/fonts.ts; o teste textFont.test.ts confere).
 * No disco fica só o id; a regra de cada uma está em styles/editor-content.css.
 */
export const TEXT_FONTS = [
  { id: "atkinson-hyperlegible-next", label: "Atkinson Hyperlegible Next" },
  { id: "inter", label: "Inter" },
  { id: "source-sans-3", label: "Source Sans 3" },
  { id: "source-serif-4", label: "Source Serif 4" },
  { id: "lora", label: "Lora" },
  { id: "archivo", label: "Archivo" },
  { id: "montserrat", label: "Montserrat" },
  { id: "playfair-display", label: "Playfair Display" },
] as const;
export type TextFontId = (typeof TEXT_FONTS)[number]["id"];

const isTextFont = (value: string | null): value is TextFontId => TEXT_FONTS.some((f) => f.id === value);

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textFont: {
      setTextFont: (font: TextFontId) => ReturnType;
      unsetTextFont: () => ReturnType;
    };
  }
}

/** Fonte de um trecho, salva como `<span data-font="lora">texto</span>`. Id fora da lista é ignorado. */
export const TextFont = Mark.create({
  name: "textFont",

  addAttributes() {
    return {
      font: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-font"),
        renderHTML: (attrs) => ({ "data-font": attrs.font }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-font]", getAttrs: (el) => (isTextFont(el.getAttribute("data-font")) ? null : false) }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },

  // Tokenizer próprio, como o da cor: o HTML comum do Markdown leria o **negrito** de dentro do span como texto.
  markdownTokenName: "textFont",
  markdownTokenizer: {
    name: "textFont",
    level: "inline",
    start: (src: string) => src.indexOf("<span data-font="),
    tokenize(src, _tokens, h) {
      const m = matchSpan(src, "font");
      if (!m || !isTextFont(m.value)) return undefined;
      return { type: "textFont", raw: m.raw, font: m.value, tokens: h.inlineTokens(m.inner) };
    },
  },

  parseMarkdown: (token, h) => h.applyMark("textFont", h.parseInline(token.tokens ?? []), { font: token.font }),

  renderMarkdown: (node, h) => `<span data-font="${node.attrs?.font}">${h.renderChildren(node)}</span>`,

  addCommands() {
    return {
      setTextFont:
        (font) =>
        ({ commands }) =>
          commands.setMark(this.name, { font }),
      unsetTextFont:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

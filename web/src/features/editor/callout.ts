import { mergeAttributes, Node } from "@tiptap/core";

/** Tipos do alerta e o marcador de cada um no Markdown (`> [!TIP]`, alerta do GFM). */
export const CALLOUT_TYPES = ["tip", "warning", "caution", "note"] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];
export const CALLOUT_MARKERS: Record<CalloutType, string> = { tip: "TIP", warning: "WARNING", caution: "CAUTION", note: "NOTE" };

/** Rótulo em texto do alerta: é conteúdo do manual, então segue o idioma dele (como o "Resultado:"). */
export const CALLOUT_LABELS: Record<"pt" | "en", Record<CalloutType, string>> = {
  pt: { tip: "Dica", warning: "Atenção", caution: "Erro", note: "Nota" },
  en: { tip: "Tip", warning: "Warning", caution: "Error", note: "Note" },
};

export const calloutLabel = (type: CalloutType, lang: string) =>
  CALLOUT_LABELS[lang.toLowerCase().startsWith("en") ? "en" : "pt"][type];

const isType = (v: unknown): v is CalloutType => (CALLOUT_TYPES as readonly unknown[]).includes(v);
const byMarker = (m: string) => CALLOUT_TYPES.find((t) => CALLOUT_MARKERS[t] === m.toUpperCase());

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /** Põe o alerta no bloco atual; se já está num, só troca o tipo. */
      setCallout: (type: CalloutType) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

const OPEN = /^ {0,3}> ?\[!(TIP|WARNING|CAUTION|NOTE)\][ \t]*(?:\n|$)((?: {0,3}>.*(?:\n|$))*)/i;

/** Alerta GFM: `> [!TIP]` e o texto na citação. O que não é um dos 4 tipos continua citação comum. */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: {
        default: "note",
        parseHTML: (el) => el.getAttribute("data-callout"),
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout]", getAttrs: (el) => (isType(el.getAttribute("data-callout")) ? null : false) }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-callout": node.attrs.type }), 0];
  },

  // Tokenizer próprio: o do marked leria o alerta como citação com o texto "[!TIP]".
  markdownTokenizer: {
    name: "callout",
    level: "block",
    start: (src: string) => src.search(/^ {0,3}> ?\[!(?:TIP|WARNING|CAUTION|NOTE)\]/im),
    tokenize(src, _tokens, h) {
      const m = OPEN.exec(src);
      if (!m) return undefined;
      const body = (m[2] ?? "").replace(/^ {0,3}> ?/gm, "").trimEnd();
      return { type: "callout", raw: m[0], calloutType: byMarker(m[1] ?? ""), tokens: h.blockTokens(body) };
    },
  },

  parseMarkdown: (token, h) => {
    const children = h.parseChildren(token.tokens ?? []);
    return h.createNode("callout", { type: token.calloutType }, children.length ? children : [h.createNode("paragraph")]);
  },

  renderMarkdown: (node, h) => {
    const lines = [`> [!${CALLOUT_MARKERS[isType(node.attrs?.type) ? node.attrs.type : "note"]}]`];
    (node.content ?? []).forEach((child, i) => {
      const text = h.renderChild?.(child, i) ?? h.renderChildren([child]);
      if (i > 0) lines.push(">");
      for (const line of text.split("\n")) lines.push(line.trim() === "" ? ">" : `> ${line}`);
    });
    return lines.join("\n");
  },

  addCommands() {
    return {
      setCallout:
        (type) =>
        ({ commands, editor }) =>
          editor.isActive(this.name) ? commands.updateAttributes(this.name, { type }) : commands.wrapIn(this.name, { type }),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});

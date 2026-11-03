// @vitest-environment happy-dom
import { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { contentExtensions } from "../src/features/editor/extensions";

function editorWith(md: string) {
  return new Editor({ extensions: contentExtensions(), content: md, contentType: "markdown" });
}

describe("código no texto", () => {
  it("aceita link em cima do código, como o Markdown `[`x`](url)` que o editor já abre", () => {
    const editor = editorWith("texto alvo");
    editor.chain().setTextSelection({ from: 7, to: 11 }).toggleCode().setLink({ href: "https://exemplo.com.br" }).run();
    expect(editor.getMarkdown()).toBe("texto [`alvo`](https://exemplo.com.br)");
    editor.destroy();
  });

  it("convive com negrito: ligar o código não apaga o negrito", () => {
    const editor = editorWith("texto alvo");
    editor.chain().setTextSelection({ from: 7, to: 11 }).toggleBold().toggleCode().run();
    expect(editor.getMarkdown()).toBe("texto **`alvo`**");
    editor.destroy();
  });

  it("ida e volta do Markdown com código dentro de negrito e de link", () => {
    const md = "a **`b`** e [`c`](https://x.com.br)";
    const first = editorWith(md);
    const out = first.getMarkdown();
    first.destroy();
    const second = editorWith(out);
    expect(second.getMarkdown()).toBe(out);
    second.destroy();
  });
});

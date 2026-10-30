// @vitest-environment happy-dom
import { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { contentExtensions } from "../src/features/editor/extensions";

const MD = "Antes da tela.\n\n![Tela](../assets/tela.png)\n\nDepois da tela.";

describe("Enter em página com imagem entre textos", () => {
  it("a imagem fica dentro de um parágrafo e splitBlock cria parágrafo novo", () => {
    const editor = new Editor({ extensions: contentExtensions(), content: MD, contentType: "markdown" });
    const top = (editor.getJSON().content ?? []).map((n) => n.type);
    expect(top).toEqual(["paragraph", "paragraph", "paragraph"]);
    editor.commands.setTextSelection(4);
    const before = editor.state.doc.childCount;
    expect(editor.commands.splitBlock()).toBe(true);
    expect(editor.state.doc.childCount).toBe(before + 1);
    expect(editor.getMarkdown()).toContain("![Tela](../assets/tela.png)");
    editor.destroy();
  });
});

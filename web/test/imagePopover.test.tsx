// @vitest-environment happy-dom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, it } from "vitest";
import { contentExtensions } from "../src/features/editor/extensions";
import { ImagePopover } from "../src/features/editor/ImagePopover";

afterEach(cleanup);

describe("ImagePopover: Remover imagem (T-155)", () => {
  it("remove como o Delete e o desfazer restaura", () => {
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    const editor = new Editor({
      extensions: contentExtensions(),
      content: "![Tela](../assets/tela.png)",
      contentType: "markdown",
    });
    let pos = -1;
    editor.state.doc.descendants((n, p) => {
      if (n.type.name === "image") pos = p;
    });
    render(<ImagePopover editor={editor} slug="m" onAnnotate={() => {}} />);
    act(() => {
      editor.commands.setNodeSelection(pos);
    });
    fireEvent.click(screen.getByRole("button", { name: /Remover imagem/i }));
    expect(editor.getMarkdown()).not.toContain("tela.png");
    act(() => {
      editor.commands.undo();
    });
    expect(editor.getMarkdown()).toContain("tela.png");
  });
});

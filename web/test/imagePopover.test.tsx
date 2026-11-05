// @vitest-environment happy-dom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, it } from "vitest";
import { contentExtensions } from "../src/features/editor/extensions";
import { freeSide, ImagePopover } from "../src/features/editor/ImagePopover";

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

describe("ImagePopover: lado livre (T-527)", () => {
  const pad = { top: 56, right: 8, bottom: 56, left: 8 };
  const box = (x: number, y: number, w: number, h: number) => new DOMRect(x, y, w, h);
  it("prefere embaixo, depois direita, esquerda e em cima", () => {
    expect(freeSide(box(300, 100, 400, 200), 1280, 800, pad)).toBe("bottom");
    expect(freeSide(box(300, 100, 400, 600), 1280, 800, pad)).toBe("right");
    expect(freeSide(box(800, 100, 460, 600), 1280, 800, pad)).toBe("left");
    expect(freeSide(box(8, 500, 1264, 200), 1280, 800, pad)).toBe("top");
  });
  it("sem espaço em lado nenhum devolve null", () => {
    expect(freeSide(box(8, 56, 1264, 700), 1280, 800, pad)).toBeNull();
  });
});

// @vitest-environment happy-dom
import { Editor } from "@tiptap/core";
import { expect, it } from "vitest";
import { contentExtensions } from "../src/features/editor/extensions";
import { headingsOf } from "../src/features/editor/headings";

it("índice da página lista os títulos com o nível, na ordem do texto", () => {
  const editor = new Editor({
    extensions: contentExtensions(),
    content: "# Cadastro\n\nTexto.\n\n## Campos\n\n- item\n\n### CPF\n\n## Salvar",
    contentType: "markdown",
  });
  expect(headingsOf(editor).map((h) => [h.level, h.text])).toEqual([
    [1, "Cadastro"],
    [2, "Campos"],
    [3, "CPF"],
    [2, "Salvar"],
  ]);
  editor.destroy();
});

// @vitest-environment happy-dom
import { Editor } from "@tiptap/core";
import { expect, it } from "vitest";
import { contentExtensions } from "../src/features/editor/extensions";
import { insertNewTable } from "../src/features/editor/tableCommands";

it("tabela nova sai 3 × 3 sem célula de cabeçalho vazia", () => {
  const editor = new Editor({ extensions: contentExtensions(), content: "", contentType: "markdown" });
  expect(insertNewTable(editor as never)).toBe(true);
  const ths = [...editor.view.dom.querySelectorAll("th")];
  expect(ths.map((th) => th.textContent)).toEqual(["Coluna 1", "Coluna 2", "Coluna 3"]);
  expect(editor.view.dom.querySelectorAll("td")).toHaveLength(6);
  editor.destroy();
});

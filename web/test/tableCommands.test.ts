// @vitest-environment happy-dom
import { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { contentExtensions } from "../src/features/editor/extensions";
import { COLUMN_ACTIONS, DELETE_TABLE, ROW_ACTIONS, type TableAction } from "../src/features/editor/tableCommands";

const MD = ["| A | B |", "| --- | --- |", "| 1 | 2 |"].join("\n");
const act = (list: TableAction[], id: string) => {
  const a = [...list, DELETE_TABLE].find((x) => x.id === id);
  if (!a) throw new Error(id);
  return a;
};

/** Abre a tabela, põe o cursor na célula "1" e roda a ação; devolve o Markdown. */
function run(list: TableAction[], id: string, md = MD) {
  const editor = new Editor({ extensions: contentExtensions(), content: md, contentType: "markdown" });
  let cell = -1;
  editor.state.doc.descendants((n, pos) => {
    if (n.type.name === "tableCell" && n.textContent === "1") cell = pos;
  });
  const done = act(list, id).run(editor as never, cell);
  const out = editor.getMarkdown();
  editor.destroy();
  return { done, out };
}
const rows = (md: string) => md.split("\n").filter((l) => l.startsWith("|"));

describe("comandos de tabela", () => {
  it("insere linha abaixo e acima da célula escolhida", () => {
    expect(rows(run(ROW_ACTIONS, "row-after").out)).toHaveLength(4);
    expect(rows(run(ROW_ACTIONS, "row-before").out)[2]).toMatch(/^\|\s*\|\s*\|$/);
  });
  it("insere coluna à esquerda e à direita", () => {
    expect(rows(run(COLUMN_ACTIONS, "col-after").out)[0]).toMatch(/^\|\s*A\s*\|\s*\|\s*B\s*\|$/);
    expect(rows(run(COLUMN_ACTIONS, "col-before").out)[0]).toMatch(/^\|\s*\|\s*A\s*\|\s*B\s*\|$/);
  });
  it("remove a coluna da célula escolhida", () => {
    const out = run(COLUMN_ACTIONS, "col-delete").out;
    expect(out).toContain("B");
    expect(out).not.toMatch(/\bA\b/);
  });
  it("remove a linha escolhida e a tabela inteira", () => {
    const three = "| A | B |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |";
    const out = run(ROW_ACTIONS, "row-delete", three).out;
    expect(out).toContain("3");
    expect(out).not.toContain("| 1 ");
    expect(run([], "table-delete").out).not.toContain("|");
  });
  it("a tabela com linha nova volta igual do Markdown (ida e volta GFM)", () => {
    const { out } = run(ROW_ACTIONS, "row-after");
    const again = new Editor({ extensions: contentExtensions(), content: out, contentType: "markdown" });
    const twice = again.getMarkdown();
    again.destroy();
    expect(twice).toBe(out);
  });
});

import { describe, expect, it } from "vitest";
import type { TreeItem } from "../src/lib/api";
import { dropTarget, renameItem } from "../src/lib/tree";

const item = (id: string, children: TreeItem[] = []): TreeItem => ({ id, title: id, children });
// a
// ├─ a1
// b
// c
const pages = [item("a", [item("a1")]), item("b"), item("c")];

describe("arrastar páginas na árvore", () => {
  it("solta antes e depois de uma página irmã", () => {
    expect(dropTarget(pages, "c", "a", "before")).toEqual({ parentId: null, index: 0 });
    expect(dropTarget(pages, "a", "c", "after")).toEqual({ parentId: null, index: 2 });
  });

  it("calcula o índice sem contar a página arrastada", () => {
    // a sai da posição 0, então "antes de c" é o índice 1 na lista [b, c].
    expect(dropTarget(pages, "a", "c", "before")).toEqual({ parentId: null, index: 1 });
  });

  it("solta dentro de outra página como última subpágina", () => {
    expect(dropTarget(pages, "b", "a", "inside")).toEqual({ parentId: "a", index: Number.MAX_SAFE_INTEGER });
    expect(dropTarget(pages, "b", "a1", "after")).toEqual({ parentId: "a", index: 1 });
  });

  it("ignora soltar uma página nela mesma ou dentro dos próprios filhos", () => {
    expect(dropTarget(pages, "a", "a", "inside")).toBeNull();
    expect(dropTarget(pages, "a", "a1", "inside")).toBeNull();
  });
});

describe("renomear na árvore", () => {
  it("troca o título em qualquer nível sem alterar a original", () => {
    const renamed = renameItem(pages, "a1", "Novo");
    expect(renamed[0]?.children[0]?.title).toBe("Novo");
    expect(pages[0]?.children[0]?.title).toBe("a1");
  });
});

import { describe, expect, it } from "vitest";
import type { TreeItem } from "../src/lib/api";
import { dropTarget, numberPages, renameItem, searchPages, shiftTarget } from "../src/lib/tree";

const item = (id: string, children: TreeItem[] = []): TreeItem => ({
  id,
  title: id,
  status: "rascunho",
  file: `pages/${id}.md`,
  children,
});
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

describe("mover pelo menu (alternativa ao arrastar)", () => {
  it("sobe e desce entre irmãs, sem passar das pontas", () => {
    expect(shiftTarget(pages, "b", "up")).toEqual({ parentId: null, index: 0 });
    expect(shiftTarget(pages, "b", "down")).toEqual({ parentId: null, index: 2 });
    expect(shiftTarget(pages, "a", "up")).toBeNull();
    expect(shiftTarget(pages, "c", "down")).toBeNull();
  });

  it("entra na página anterior e sai para o nível de cima", () => {
    expect(shiftTarget(pages, "b", "indent")).toEqual({ parentId: "a", index: Number.MAX_SAFE_INTEGER });
    expect(shiftTarget(pages, "a", "indent")).toBeNull();
    expect(shiftTarget(pages, "a1", "outdent")).toEqual({ parentId: null, index: 1 });
    expect(shiftTarget(pages, "b", "outdent")).toBeNull();
  });
});

describe("busca de páginas (Ctrl+P)", () => {
  const tree = [
    { ...item("clientes"), title: "Clientes", children: [{ ...item("editar"), title: "Editar cadastro" }] },
    { ...item("relatorios"), title: "Relatórios de cadastro" },
    { ...item("cad"), title: "Cadastro rápido" },
  ];

  it("ignora acento e maiúscula, põe quem começa com o texto primeiro e mostra o caminho", () => {
    expect(searchPages(tree, "CADASTRO").map((m) => [m.item.title, m.path])).toEqual([
      ["Cadastro rápido", []],
      ["Editar cadastro", ["Clientes"]],
      ["Relatórios de cadastro", []],
    ]);
    expect(searchPages(tree, "relatorio").map((m) => m.item.title)).toEqual(["Relatórios de cadastro"]);
  });

  it("sem texto, lista todas na ordem da árvore", () => {
    expect(searchPages(tree, " ").map((m) => m.item.id)).toEqual(["clientes", "editar", "relatorios", "cad"]);
  });
});

describe("numeração das páginas", () => {
  it("numera como o sumário exportado: 1, 2, 2.1", () => {
    const n = numberPages([item("a"), item("b", [item("b1"), item("b2", [item("b21")])]), item("c")]);
    expect([...n]).toEqual([
      ["a", "1"],
      ["b", "2"],
      ["b1", "2.1"],
      ["b2", "2.2"],
      ["b21", "2.2.1"],
      ["c", "3"],
    ]);
  });

  it("página com problema não ganha número e os filhos sobem para o lugar dela", () => {
    const broken = { ...item("x", [item("x1")]), problem: "ilegível" };
    const n = numberPages([item("a"), broken, item("c")]);
    expect([...n]).toEqual([
      ["a", "1"],
      ["x1", "2"],
      ["c", "3"],
    ]);
  });

  it("a busca traz o número da página", () => {
    const tree = [item("a"), item("b", [item("b1")])];
    expect(searchPages(tree, "b1")[0]?.number).toBe("2.1");
  });
});

import { expect, it } from "vitest";
import type { TreeItem } from "../src/lib/api";
import { visibleFor } from "../src/lib/tree";

const item = (id: string, audience?: string[], children: TreeItem[] = []): TreeItem => ({
  id,
  title: id,
  status: "rascunho",
  file: `pages/${id}.md`,
  ...(audience ? { audience } : {}),
  children,
});

const tree = [item("a"), item("b", ["admin"], [item("b1"), item("b2", ["cliente"])]), item("c", ["cliente"], [item("c1")])];
const ids = (items: TreeItem[]): string[] => items.flatMap((i) => [i.id, ...ids(i.children)]);

it("sem perfil mostra tudo", () => {
  expect(ids(visibleFor(tree, null))).toEqual(ids(tree));
});

it("o perfil vê as páginas sem restrição e as que o citam; a filha herda a mãe", () => {
  expect(ids(visibleFor(tree, "admin"))).toEqual(["a", "b", "b1"]);
  expect(ids(visibleFor(tree, "cliente"))).toEqual(["a", "c", "c1"]);
});

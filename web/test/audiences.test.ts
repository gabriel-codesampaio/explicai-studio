import { expect, it } from "vitest";
import type { TreeItem } from "../src/lib/api";
import { audienceNameError, audienceUsage } from "../src/lib/audiences";

const page = (title: string, audience?: string[], children: TreeItem[] = []): TreeItem => ({
  id: title,
  title,
  status: "rascunho",
  file: `${title}.md`,
  ...(audience ? { audience } : {}),
  children,
});

it("conta as páginas do público, filhas incluídas, e separa as que só têm ele", () => {
  const pages = [page("A", ["admin"], [page("A1", ["admin", "cliente"])]), page("B", ["cliente"]), page("C")];
  expect(audienceUsage(pages, "admin")).toEqual({ count: 2, freed: ["A"] });
  expect(audienceUsage(pages, "cliente")).toEqual({ count: 2, freed: ["B"] });
  expect(audienceUsage(pages, "novo")).toEqual({ count: 0, freed: [] });
});

it("recusa nome vazio, longo e repetido ignorando maiúscula; aceita o próprio nome ao renomear", () => {
  expect(audienceNameError("  ", [])).toBeTruthy();
  expect(audienceNameError("x".repeat(41), [])).toBeTruthy();
  expect(audienceNameError("ADMIN", ["admin"])).toBeTruthy();
  expect(audienceNameError("Admin", ["admin"], "admin")).toBeNull();
  expect(audienceNameError("novo", ["admin"])).toBeNull();
});

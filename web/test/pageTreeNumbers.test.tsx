// @vitest-environment happy-dom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { PageTree } from "../src/features/pages/PageTree";
import type { TreeItem } from "../src/lib/api";
import * as tree from "../src/lib/tree";

// T-106: a numeração só se recalcula quando a árvore muda, não a cada re-render (hover de arrastar, menu).
vi.mock("../src/lib/tree", async (importOriginal) => {
  const real = await importOriginal<typeof import("../src/lib/tree")>();
  return { ...real, numberPages: vi.fn(real.numberPages) };
});
afterEach(cleanup);

const page = (id: string, children: TreeItem[] = []): TreeItem => ({
  id,
  title: id,
  status: "rascunho",
  file: `${id}.md`,
  children,
});
const props = { selectedId: null, onSelect: () => {}, onAction: () => {}, onMove: () => {} };
const ui = (pages: TreeItem[]) => (
  <TooltipProvider>
    <PageTree pages={pages} {...props} />
  </TooltipProvider>
);

it("500 páginas: arrastar por cima de uma linha não renumera; mudar a árvore renumera", () => {
  const pages = Array.from({ length: 50 }, (_, i) =>
    page(
      `a${i}`,
      Array.from({ length: 9 }, (_, j) => page(`a${i}-${j}`)),
    ),
  );
  const { container, rerender } = render(ui(pages));
  expect(container.querySelectorAll("li")).toHaveLength(500);
  expect(tree.numberPages).toHaveBeenCalledTimes(1);

  const row = container.querySelector("[draggable]") as HTMLElement;
  const dataTransfer = { types: ["text/x-explicai-page"], getData: () => "" };
  fireEvent.dragOver(row, { dataTransfer, clientY: 1 });
  fireEvent.dragOver(row, { dataTransfer, clientY: 100 });
  expect(tree.numberPages).toHaveBeenCalledTimes(1);

  rerender(ui([...pages].reverse()));
  expect(tree.numberPages).toHaveBeenCalledTimes(2);
});

// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { PageTree } from "../src/features/pages/PageTree";
import type { TreeItem } from "../src/lib/api";
import { renameItem } from "../src/lib/tree";

// T-422: linha memoizada. Contar renders da linha, não ms (ms oscila sob carga).
const renders = vi.hoisted(() => ({ n: 0 }));
vi.mock("../src/features/pages/PageActions", async (orig) => {
  const real = await orig<typeof import("../src/features/pages/PageActions")>();
  return {
    ...real,
    PageActions: (p: Parameters<typeof real.PageActions>[0]) => {
      renders.n++;
      return real.PageActions(p);
    },
  };
});
afterEach(cleanup);

const page = (id: string, children: TreeItem[] = []): TreeItem => ({
  id,
  title: id,
  status: "rascunho",
  file: `${id}.md`,
  children,
});
const pages = Array.from({ length: 50 }, (_, i) =>
  page(
    `a${i}`,
    Array.from({ length: 9 }, (_, j) => page(`a${i}-${j}`)),
  ),
);
const ui = (p: TreeItem[]) => (
  <TooltipProvider>
    <PageTree pages={p} selectedId="a0" onSelect={vi.fn()} onAction={vi.fn()} onMove={vi.fn()} />
  </TooltipProvider>
);

it("renameItem mantém a identidade dos ramos sem a página", () => {
  const next = renameItem(pages, "a0-3", "novo");
  expect(next[1]).toBe(pages[1]);
  expect(next[0]).not.toBe(pages[0]);
  expect(next[0]?.children[3]?.title).toBe("novo");
  expect(next[0]?.children[2]).toBe(pages[0]?.children[2]);
});

it("500 páginas: digitar um título re-renderiza só a página e a mãe; arrastar, só as duas linhas do hover", () => {
  const { container, rerender } = render(ui(pages));
  renders.n = 0;
  act(() => rerender(ui(renameItem(pages, "a0-3", "x"))));
  expect(renders.n).toBe(2);

  const dataTransfer = { types: ["text/x-explicai-page"], getData: () => "" };
  const rows = container.querySelectorAll("[draggable]");
  renders.n = 0;
  fireEvent.dragOver(rows[5] as HTMLElement, { dataTransfer, clientY: 1 });
  expect(renders.n).toBe(1);
  fireEvent.dragOver(rows[6] as HTMLElement, { dataTransfer, clientY: 1 });
  expect(renders.n).toBe(3);
});

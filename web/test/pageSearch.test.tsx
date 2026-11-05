// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PageSearch } from "../src/features/pages/PageSearch";
import { api } from "../src/lib/api";

const selectPage = vi.fn();
vi.mock("../src/hooks/StudioContext", () => ({
  useStudioContext: () => ({ manual: { slug: "m", pages: [] }, page: null, selectPage }),
}));

afterEach(cleanup);

it("só com trechos do texto: sem grupo Por título vazio e o Enter abre o ativo", async () => {
  vi.spyOn(api, "searchText").mockResolvedValue([
    { id: "p1", title: "Uma", before: "a ", match: "foo", after: " b" },
    { id: "p2", title: "Outra", before: "c ", match: "foo", after: " d" },
  ]);
  render(<PageSearch open onOpenChange={() => {}} />);
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "foo" } });
  await screen.findAllByRole("option");

  expect(screen.queryByRole("group", { name: "Por título" })).toBeNull();
  expect(screen.getByRole("group", { name: "No texto" })).toBeTruthy();
  expect(input.getAttribute("aria-activedescendant")).toBe("busca-texto-p1");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(selectPage).toHaveBeenCalledWith("p2");
});

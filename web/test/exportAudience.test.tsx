// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ExportDialog } from "../src/features/export/ExportDialog";

const studio = {
  manual: {
    slug: "m",
    theme: {},
    pages: [{ id: "a", title: "A", status: "rascunho", children: [] }],
    audiences: ["admin", "cliente"],
  },
  viewAs: "cliente",
  exportManual: vi.fn(),
};
vi.mock("../src/hooks/StudioContext", () => ({ useStudioContext: () => studio }));

afterEach(cleanup);

it("Exportar começa no público que está sendo visto", () => {
  render(<ExportDialog open />);
  expect(screen.getByRole("combobox", { name: /Visualizar como/ }).textContent).toContain("cliente");
});

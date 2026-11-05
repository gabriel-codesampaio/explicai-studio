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
// Sem rede: o diálogo confere o manual com useManualCheck, que faria fetch na porta 3000.
vi.mock("../src/features/check/useManualCheck", () => ({
  useManualCheck: () => ({ findings: null, error: null, reload: () => {} }),
}));
vi.mock("../src/hooks/StudioContext", () => ({ useStudioContext: () => studio }));

afterEach(cleanup);

it("Exportar começa no público que está sendo visto", () => {
  render(<ExportDialog open />);
  expect(screen.getByRole("combobox", { name: /Visualizar como/ }).textContent).toContain("cliente");
});

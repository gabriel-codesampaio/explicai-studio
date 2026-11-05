// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudiencesDialog } from "../src/features/settings/AudiencesDialog";

const page = (title: string, audience: string[]) => ({
  id: title,
  title,
  status: "rascunho",
  file: `${title}.md`,
  audience,
  children: [],
});
const studio = vi.hoisted(() => ({
  manual: null as Record<string, unknown> | null,
  audiences: { add: vi.fn(), rename: vi.fn(), remove: vi.fn(async () => {}) },
}));
vi.mock("../src/hooks/StudioContext", () => ({ useStudioContext: () => studio }));

studio.manual = {
  audiences: ["admin", "cliente"],
  pages: [page("Só admin", ["admin"]), page("Os dois", ["admin", "cliente"]), page("Só cliente", ["cliente"])],
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AudiencesDialog: remover público", () => {
  it("pede confirmação antes de gravar e mostra quantas e quais páginas ficam para todos", async () => {
    render(<AudiencesDialog open onOpenChange={() => {}} />);
    fireEvent.click(screen.getByLabelText("Remover admin"));
    expect(studio.audiences.remove).not.toHaveBeenCalled();
    expect(screen.getByText("2 páginas citam este público.")).toBeTruthy();
    expect(screen.getByText("1 delas só tem esse público e passa a aparecer para todos:")).toBeTruthy();
    expect(screen.getByText("Só admin")).toBeTruthy();
    fireEvent.click(screen.getByText("Remover e liberar essas páginas"));
    await waitFor(() => expect(studio.audiences.remove).toHaveBeenCalledWith("admin"));
  });

  it("cancelar não remove nada", () => {
    render(<AudiencesDialog open onOpenChange={() => {}} />);
    fireEvent.click(screen.getByLabelText("Remover cliente"));
    fireEvent.click(screen.getByText("Cancelar"));
    expect(studio.audiences.remove).not.toHaveBeenCalled();
  });
});

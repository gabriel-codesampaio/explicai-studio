// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CoverFooterFields } from "../src/features/settings/CoverFooterFields";

const studio = vi.hoisted(() => ({
  manual: {
    title: "Guia",
    cover: { author: "Time X" },
    footer: { text: "Confidencial", pageNumbers: true },
  } as Record<string, unknown> | null,
  setManualCover: vi.fn(async () => {}),
  setManualFooter: vi.fn(async () => {}),
}));
vi.mock("../src/hooks/StudioContext", () => ({ useStudioContext: () => studio }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CoverFooterFields", () => {
  it("mostra o que está salvo e a prévia da capa em ordem, sem campo vazio", () => {
    render(<CoverFooterFields />);
    expect((screen.getByLabelText("Autor ou equipe") as HTMLInputElement).value).toBe("Time X");
    expect((screen.getByLabelText("Texto do rodapé") as HTMLInputElement).value).toBe("Confidencial");
    expect(screen.getByText("Guia")).toBeTruthy();
    expect(screen.getByText("2 / 8")).toBeTruthy();
  });

  it("a prévia muda ao digitar, mas só grava ao sair do campo", () => {
    render(<CoverFooterFields />);
    const sub = screen.getByLabelText("Subtítulo");
    fireEvent.change(sub, { target: { value: "Para: Acme" } });
    expect(screen.getAllByText("Para: Acme").length).toBeGreaterThan(0);
    expect(studio.setManualCover).not.toHaveBeenCalled();
    fireEvent.blur(sub);
    expect(studio.setManualCover).toHaveBeenCalledWith({ subtitle: "Para: Acme" });
  });

  it("não grava se o valor não mudou", () => {
    render(<CoverFooterFields />);
    fireEvent.blur(screen.getByLabelText("Autor ou equipe"));
    expect(studio.setManualCover).not.toHaveBeenCalled();
  });

  it("sugestão de versão vale com um clique e só aparece com o campo vazio", () => {
    render(<CoverFooterFields />);
    fireEvent.click(screen.getByRole("button", { name: "Usar Versão 1.0" }));
    expect(studio.setManualCover).toHaveBeenCalledWith({ version: "Versão 1.0" });
    expect(screen.queryByRole("button", { name: /Usar Time X/ })).toBeNull();
  });

  it("mostra o motivo e volta ao salvo quando o servidor recusa", async () => {
    studio.setManualFooter.mockRejectedValueOnce(new Error("Texto longo demais"));
    render(<CoverFooterFields />);
    const text = screen.getByLabelText("Texto do rodapé");
    fireEvent.change(text, { target: { value: "novo" } });
    fireEvent.blur(text);
    expect((await screen.findByRole("alert")).textContent).toContain("Texto longo demais");
    expect((text as HTMLInputElement).value).toBe("Confidencial");
  });

  it("não renderiza sem manual", () => {
    studio.manual = null;
    const { container } = render(<CoverFooterFields />);
    expect(container.innerHTML).toBe("");
  });
});

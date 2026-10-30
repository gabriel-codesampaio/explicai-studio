// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTreeKeyboard } from "../src/features/pages/useTreeKeyboard";

afterEach(cleanup);

function Tree({ version = 0, onShift = vi.fn(), onOpenMenu = vi.fn() }) {
  const { onKeyDown, root } = useTreeKeyboard(version, onShift, onOpenMenu);
  return (
    <ul ref={root} onKeyDown={onKeyDown}>
      {["a", "b", "c"].map((id) => (
        <li key={id}>
          <button type="button" data-page-id={id}>
            {id}
          </button>
        </li>
      ))}
    </ul>
  );
}

const key = (id: string, init: Parameters<typeof fireEvent.keyDown>[1]) => fireEvent.keyDown(screen.getByText(id), init);

describe("useTreeKeyboard", () => {
  it("setas andam entre as páginas e não passam das pontas", () => {
    render(<Tree />);
    screen.getByText("a").focus();
    key("a", { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByText("b"));
    key("b", { key: "ArrowUp" });
    expect(document.activeElement).toBe(screen.getByText("a"));
    key("a", { key: "ArrowUp" });
    expect(document.activeElement).toBe(screen.getByText("a"));
  });

  it("Home e End vão para a primeira e a última", () => {
    render(<Tree />);
    screen.getByText("b").focus();
    key("b", { key: "End" });
    expect(document.activeElement).toBe(screen.getByText("c"));
    key("c", { key: "Home" });
    expect(document.activeElement).toBe(screen.getByText("a"));
  });

  it("Alt+Shift+seta reordena e devolve o foco depois de redesenhar", () => {
    const onShift = vi.fn();
    const { rerender } = render(<Tree onShift={onShift} />);
    screen.getByText("b").focus();
    key("b", { key: "ArrowDown", altKey: true, shiftKey: true });
    expect(onShift).toHaveBeenCalledWith("b", "down");

    screen.getByText("c").focus();
    rerender(<Tree version={1} onShift={onShift} />);
    expect(document.activeElement).toBe(screen.getByText("b"));
  });

  it.each([
    ["ArrowUp", "up"],
    ["ArrowDown", "down"],
    ["ArrowRight", "indent"],
    ["ArrowLeft", "outdent"],
  ])("Alt+Shift+%s pede %s", (k, shift) => {
    const onShift = vi.fn();
    render(<Tree onShift={onShift} />);
    key("a", { key: k, altKey: true, shiftKey: true });
    expect(onShift).toHaveBeenCalledWith("a", shift);
  });

  it("Shift+F10 e a tecla de menu abrem o menu da página", () => {
    const onOpenMenu = vi.fn();
    render(<Tree onOpenMenu={onOpenMenu} />);
    key("a", { key: "F10", shiftKey: true });
    key("c", { key: "ContextMenu" });
    expect(onOpenMenu.mock.calls).toEqual([["a"], ["c"]]);
  });

  it("seta simples não reordena e tecla fora de um botão de página é ignorada", () => {
    const onShift = vi.fn();
    const { container } = render(<Tree onShift={onShift} />);
    key("a", { key: "ArrowRight" });
    fireEvent.keyDown(container.querySelector("ul") as HTMLElement, { key: "ArrowDown" });
    expect(onShift).not.toHaveBeenCalled();
  });
});

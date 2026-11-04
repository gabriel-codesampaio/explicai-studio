// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ItemStylePanel } from "../src/features/annotations/ItemStylePanel";
import { emptyAnnotations, findItem, updateItemStyle } from "../src/lib/annotations";

afterEach(cleanup);

describe("updateItemStyle", () => {
  const ann = {
    ...emptyAnnotations(),
    markers: [
      { id: "a", n: 1, x: 0.1, y: 0.1 },
      { id: "b", n: 2, x: 0.2, y: 0.2 },
    ],
  };
  it("muda só o item e remove o style ao voltar ao padrão", () => {
    const styled = updateItemStyle(ann, "b", { color: "red", size: "l" });
    expect(styled.markers[0]).toEqual(ann.markers[0]);
    expect(findItem(styled, "b")).toMatchObject({ kind: "marker", n: 2, style: { color: "red", size: "l" } });
    const back = updateItemStyle(styled, "b", undefined);
    expect("style" in (back.markers[1] ?? {})).toBe(false);
  });
});

const panel = (kind: "marker" | "highlight" | "hotspot", style: object | undefined, onChange = vi.fn(), imageStyle?: object) => (
  <ItemStylePanel kind={kind} name="Item" style={style} imageStyle={imageStyle} onChange={onChange} />
);

describe("ItemStylePanel", () => {
  it("troca cor e tamanho do marcador e volta ao padrão", () => {
    const onChange = vi.fn();
    const { rerender } = render(panel("marker", undefined, onChange));
    expect(screen.getByText("Herdando da imagem")).toBeTruthy();
    expect(screen.queryByText("Voltar ao padrão")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Vermelho" }));
    expect(onChange).toHaveBeenLastCalledWith({ color: "red" });
    rerender(panel("marker", { color: "red" }, onChange));
    fireEvent.click(screen.getByRole("button", { name: "Grande" }));
    expect(onChange).toHaveBeenLastCalledWith({ color: "red", size: "l" });
    fireEvent.click(screen.getByText("Voltar ao padrão"));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("destaque tem paleta de marca-texto, preenchimento e borda; sem preenchimento trava Nenhuma", () => {
    const onChange = vi.fn();
    const { rerender } = render(panel("highlight", undefined, onChange));
    expect(screen.queryByRole("button", { name: "Vermelho" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Rosa" }));
    expect(onChange).toHaveBeenLastCalledWith({ color: "pink" });
    expect(screen.getByRole("button", { name: "Cheio" }).getAttribute("aria-pressed")).toBe("false");
    rerender(panel("highlight", { fill: "none" }, onChange));
    expect((screen.getByRole("button", { name: "Nenhuma" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("área sem preenchimento não aceita borda Nenhuma", () => {
    render(panel("hotspot", { fill: "none" }));
    expect((screen.getByRole("button", { name: "Nenhuma" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("escolher Sem preenchimento com borda Nenhuma devolve a borda a s", () => {
    const onChange = vi.fn();
    render(panel("hotspot", { border: "none" }, onChange));
    fireEvent.click(screen.getByRole("button", { name: "Sem" }));
    expect(onChange).toHaveBeenCalledWith({ border: "s", fill: "none" });
  });
});

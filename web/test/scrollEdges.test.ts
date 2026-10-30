import { describe, expect, it } from "vitest";
import { scrollEdges } from "../src/hooks/useScrollEdges";

const box = (scrollLeft: number, clientWidth: number, scrollWidth: number) => ({ scrollLeft, clientWidth, scrollWidth });

describe("scrollEdges", () => {
  it("não mostra nada quando tudo cabe", () => {
    expect(scrollEdges(box(0, 400, 400))).toEqual({ start: false, end: false });
  });
  it("mostra só o fim no começo da barra", () => {
    expect(scrollEdges(box(0, 351, 559))).toEqual({ start: false, end: true });
  });
  it("mostra os dois lados no meio", () => {
    expect(scrollEdges(box(100, 351, 559))).toEqual({ start: true, end: true });
  });
  it("some o fim ao chegar nele, mesmo com subpixel", () => {
    expect(scrollEdges(box(207.6, 351, 559))).toEqual({ start: true, end: false });
  });
});

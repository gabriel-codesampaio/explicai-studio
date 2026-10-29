import { describe, expect, it } from "vitest";
import { addMarker, assetPathFromSrc, emptyAnnotations, isTooSmall, rectFrom, removeAnnotation } from "../src/lib/annotations";

describe("marcações de imagem", () => {
  it("acha o arquivo da imagem a partir da URL do Studio", () => {
    expect(assetPathFromSrc("/files/financeiro/assets/tela-clientes.png")).toBe("assets/tela-clientes.png");
    expect(assetPathFromSrc("https://exemplo.com/logo.png")).toBeNull();
  });

  it("monta o retângulo em qualquer direção de arraste e não deixa sair da imagem", () => {
    const a = rectFrom({ x: 0.6, y: 0.5 }, { x: 0.2, y: 0.1 });
    for (const [k, v] of Object.entries({ x: 0.2, y: 0.1, w: 0.4, h: 0.4 })) expect(a[k as keyof typeof a]).toBeCloseTo(v);
    const r = rectFrom({ x: 0.9, y: 0.9 }, { x: 1.3, y: -0.2 });
    expect(r).toMatchObject({ x: 0.9, y: 0, h: 0.9 });
    expect(r.w).toBeCloseTo(0.1);
  });

  it("trata arraste mínimo como clique", () => {
    expect(isTooSmall({ x: 0.5, y: 0.5 }, { x: 0.503, y: 0.5 })).toBe(true);
    expect(isTooSmall({ x: 0.5, y: 0.5 }, { x: 0.6, y: 0.5 })).toBe(false);
  });

  it("numera os marcadores em sequência e renumera ao excluir", () => {
    let ann = emptyAnnotations();
    ann = addMarker(ann, { x: 0.1, y: 0.1 });
    ann = addMarker(ann, { x: 0.2, y: 0.2 });
    ann = addMarker(ann, { x: 0.3, y: 0.3 });
    expect(ann.markers.map((m) => m.n)).toEqual([1, 2, 3]);

    const segundo = ann.markers[1]?.id ?? "";
    ann = removeAnnotation(ann, segundo);
    expect(ann.markers.map((m) => [m.n, m.x])).toEqual([
      [1, 0.1],
      [2, 0.3],
    ]);
  });
});

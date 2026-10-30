import { describe, expect, it } from "vitest";
import {
  type Annotations,
  addMarker,
  addShape,
  assetPathFromSrc,
  emptyAnnotations,
  isTooSmall,
  moveAnnotation,
  rectFrom,
  removeAnnotation,
} from "../src/lib/annotations";

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

  it("cria cada forma a partir do arraste e ignora arraste curto", () => {
    const target = { type: "page" as const, pageId: "p1" };
    const ann = emptyAnnotations();
    const a = { x: 0.1, y: 0.1 };
    const b = { x: 0.4, y: 0.3 };
    expect(addShape(ann, "highlight", a, b, target)?.highlights).toHaveLength(1);
    expect(addShape(ann, "arrow", a, b, target)?.arrows[0]).toMatchObject({ from: a, to: b });
    expect(addShape(ann, "hotspot", a, b, target)?.hotspots[0]).toMatchObject({ target });
    expect(addShape(ann, "highlight", a, { x: 0.101, y: 0.1 }, target)).toBeNull();
    expect(addShape(ann, "marker", a, a, target)?.markers[0]).toMatchObject({ n: 1, x: 0.1, y: 0.1 });
  });
});

describe("mover e redimensionar marcações", () => {
  const base: Annotations = {
    version: 1,
    markers: [{ id: "m", n: 1, x: 0.5, y: 0.5 }],
    highlights: [{ id: "h", x: 0.2, y: 0.2, w: 0.2, h: 0.1 }],
    arrows: [{ id: "a", from: { x: 0.1, y: 0.1 }, to: { x: 0.3, y: 0.3 } }],
    hotspots: [],
  };
  const near = (v: number) => expect.closeTo(v, 6);

  it("move o marcador e não deixa sair da imagem", () => {
    expect(moveAnnotation(base, "m", "move", 0.1, 0.9).markers[0]).toMatchObject({ x: near(0.6), y: 1 });
  });

  it("move o destaque inteiro encostando na borda, sem encolher", () => {
    expect(moveAnnotation(base, "h", "move", 0.9, 0).highlights[0]).toMatchObject({ x: near(0.8), y: 0.2, w: 0.2 });
  });

  it("redimensiona pelo canto; o canto oposto fica parado, mesmo passando para o outro lado", () => {
    expect(moveAnnotation(base, "h", "se", 0.1, 0.1).highlights[0]).toMatchObject({
      x: 0.2,
      y: 0.2,
      w: near(0.3),
      h: near(0.2),
    });
    expect(moveAnnotation(base, "h", "nw", 0.3, 0).highlights[0]).toMatchObject({ x: near(0.4), w: near(0.1) });
  });

  it("move uma ponta da seta ou a seta inteira", () => {
    expect(moveAnnotation(base, "a", "to", 0.2, 0).arrows[0]).toMatchObject({
      from: { x: 0.1, y: 0.1 },
      to: { x: near(0.5), y: 0.3 },
    });
    expect(moveAnnotation(base, "a", "move", 0.1, 0.1).arrows[0]?.from).toMatchObject({ x: near(0.2), y: near(0.2) });
  });
});

it("assetPathFromSrc não lança com % malformado", () => {
  expect(assetPathFromSrc("/files/m/assets/100%.png")).toBe("assets/100%.png");
});

import { describe, expect, it } from "vitest";
import { emptyAnnotations } from "../src/lib/annotations";
import { cropAnnotations } from "../src/lib/cropAnnotations";

const crop = { x: 0.25, y: 0.5, w: 0.5, h: 0.25 };

describe("cropAnnotations", () => {
  it("mantém o marcador sobre o mesmo pixel e renumera", () => {
    const a = {
      ...emptyAnnotations(),
      markers: [
        { id: "a", n: 1, x: 0.1, y: 0.1 },
        { id: "b", n: 2, x: 0.5, y: 0.625 },
        { id: "c", n: 3, x: 0.75, y: 0.75, label: "fim" },
      ],
    };
    const { annotations, removed } = cropAnnotations(a, crop);
    expect(annotations.markers).toEqual([
      { id: "b", n: 1, x: 0.5, y: 0.5 },
      { id: "c", n: 2, x: 1, y: 1, label: "fim" },
    ]);
    expect(removed.markers).toBe(1);
  });

  it("recorta retângulos pela interseção e remove os que ficam fora", () => {
    const a = {
      ...emptyAnnotations(),
      highlights: [
        { id: "h1", x: 0, y: 0.5, w: 0.5, h: 0.25 },
        { id: "h2", x: 0, y: 0, w: 0.2, h: 0.2 },
        { id: "h3", x: 0.25, y: 0.5, w: 0.25, h: 0.125 },
      ],
      hotspots: [{ id: "s1", x: 0.7, y: 0.6, w: 0.5, h: 0.1, target: { type: "url" as const, href: "https://x.dev" } }],
    };
    const { annotations, removed } = cropAnnotations(a, crop);
    expect(annotations.highlights).toEqual([
      { id: "h1", x: 0, y: 0, w: 0.5, h: 1 },
      { id: "h3", x: 0, y: 0, w: 0.5, h: 0.5 },
    ]);
    expect(annotations.hotspots[0]).toMatchObject({
      x: expect.closeTo(0.9),
      y: expect.closeTo(0.4),
      w: expect.closeTo(0.1),
      h: expect.closeTo(0.4),
    });
    expect(removed).toMatchObject({ highlights: 1, hotspots: 0 });
  });

  it("remove a seta com qualquer ponta fora", () => {
    const a = {
      ...emptyAnnotations(),
      arrows: [
        { id: "ok", from: { x: 0.25, y: 0.5 }, to: { x: 0.75, y: 0.75 } },
        { id: "fora", from: { x: 0.3, y: 0.6 }, to: { x: 0.9, y: 0.6 } },
      ],
    };
    const { annotations, removed } = cropAnnotations(a, crop);
    expect(annotations.arrows).toEqual([{ id: "ok", from: { x: 0, y: 0 }, to: { x: 1, y: 1 } }]);
    expect(removed.arrows).toBe(1);
  });

  it("preserva display e não muda nada com recorte total", () => {
    const a = { ...emptyAnnotations(), display: "m" as const, markers: [{ id: "a", n: 1, x: 0.3, y: 0.3 }] };
    const { annotations, removed } = cropAnnotations(a, { x: 0, y: 0, w: 1, h: 1 });
    expect(annotations).toEqual(a);
    expect(removed).toEqual({ markers: 0, highlights: 0, arrows: 0, hotspots: 0 });
  });

  it("o recorte (CropPanel) mantém o style de cada marcação", () => {
    const a = {
      ...emptyAnnotations(),
      markers: [{ id: "m", n: 1, x: 0.5, y: 0.6, style: { color: "red" as const, size: "s" as const } }],
      highlights: [{ id: "h", x: 0.3, y: 0.55, w: 0.2, h: 0.1, style: { border: "none" as const } }],
      arrows: [{ id: "a", from: { x: 0.3, y: 0.55 }, to: { x: 0.6, y: 0.7 }, style: { stroke: "l" as const } }],
      hotspots: [
        {
          id: "t",
          x: 0.3,
          y: 0.55,
          w: 0.2,
          h: 0.1,
          target: { type: "url" as const, href: "https://a.com" },
          style: { fill: "soft" as const },
        },
      ],
    };
    const { annotations } = cropAnnotations(a, crop);
    expect(annotations.markers[0]?.style).toEqual({ color: "red", size: "s" });
    expect(annotations.highlights[0]?.style).toEqual({ border: "none" });
    expect(annotations.arrows[0]?.style).toEqual({ stroke: "l" });
    expect(annotations.hotspots[0]?.style).toEqual({ fill: "soft" });
  });
});

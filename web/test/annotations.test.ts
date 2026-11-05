import { describe, expect, it } from "vitest";
import {
  type Annotations,
  addMarker,
  addShape,
  assetPathFromSrc,
  draftChanged,
  emptyAnnotations,
  isTooSmall,
  moveAnnotation,
  nudge,
  rectFrom,
  removeAnnotation,
  updateHotspot,
  updateMarker,
  warnsSmall,
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

  it("setas do teclado movem só a seta, 1% por passo e 5% com Shift", () => {
    const ann: Annotations = {
      ...emptyAnnotations(),
      arrows: [{ id: "a", from: { x: 0.2, y: 0.2 }, to: { x: 0.4, y: 0.4 } }],
      markers: [{ id: "m", n: 1, x: 0.5, y: 0.5 }],
    };
    expect(nudge(ann, "a", "ArrowRight", false)?.arrows[0]?.to.x).toBeCloseTo(0.41);
    expect(nudge(ann, "a", "ArrowUp", true)?.arrows[0]?.from.y).toBeCloseTo(0.15);
    expect(nudge(ann, "m", "ArrowLeft", false)?.markers[0]?.x).toBeCloseTo(0.49);
    expect(nudge(ann, "zz", "ArrowLeft", false)).toBeNull();
    expect(nudge(ann, "a", "a", false)).toBeNull();
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
    expect(addShape(ann, "arrow", a, { x: 0.12, y: 0.1 }, target)).toBeNull(); // seta pede 3%
    expect(addShape(ann, "arrow", a, { x: 0.14, y: 0.1 }, target)?.arrows).toHaveLength(1);
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

describe("tamanho de exibição", () => {
  const withMarkers = (n: number, display?: "s" | "m" | "full"): Annotations => {
    let ann: Annotations = { ...emptyAnnotations(), ...(display ? { display } : {}) };
    for (let i = 0; i < n; i++) ann = addMarker(ann, { x: 0.1 * (i + 1), y: 0.5 });
    return ann;
  };

  it("avisa só com Pequena e 4 ou mais marcadores", () => {
    expect(warnsSmall(withMarkers(4, "s"))).toBe(true);
    expect(warnsSmall(withMarkers(3, "s"))).toBe(false);
    expect(warnsSmall(withMarkers(6, "m"))).toBe(false);
    expect(warnsSmall(withMarkers(6))).toBe(false);
  });

  it("mexer nas marcações preserva o display", () => {
    expect(addMarker(withMarkers(1, "m"), { x: 0.5, y: 0.5 }).display).toBe("m");
  });
});

describe("draftChanged", () => {
  const base = emptyAnnotations();
  it("sem mudança não pergunta", () => {
    expect(draftChanged({ ann: base, redact: [], crop: [] }, null)).toBe(false);
    expect(draftChanged({ ann: addMarker(base, { x: 0.1, y: 0.1 }), redact: [], crop: [] }, null)).toBe(true);
  });
  it("marcador novo, removido ou área pendente contam como mudança", () => {
    const saved = addMarker(base, { x: 0.1, y: 0.1 });
    expect(draftChanged({ ann: saved, redact: [], crop: [] }, saved)).toBe(false);
    expect(draftChanged({ ann: addMarker(saved, { x: 0.5, y: 0.5 }), redact: [], crop: [] }, saved)).toBe(true);
    expect(draftChanged({ ann: base, redact: [], crop: [] }, saved)).toBe(true);
    expect(draftChanged({ ann: saved, redact: [{}], crop: [] }, saved)).toBe(true);
  });
});

describe("style de cada marcação sobrevive às edições do editor", () => {
  const ann: Annotations = {
    ...emptyAnnotations(),
    markers: [
      { id: "m1", n: 1, x: 0.2, y: 0.2, style: { color: "red", size: "l" } },
      { id: "m2", n: 2, x: 0.6, y: 0.6, style: { border: "none" } },
    ],
    highlights: [{ id: "h1", x: 0.1, y: 0.1, w: 0.2, h: 0.2, style: { border: "l" } }],
    arrows: [{ id: "a1", from: { x: 0.1, y: 0.1 }, to: { x: 0.5, y: 0.5 }, style: { stroke: "s" } }],
    hotspots: [
      {
        id: "t1",
        x: 0.5,
        y: 0.5,
        w: 0.2,
        h: 0.2,
        target: { type: "url", href: "https://a.com" },
        style: { fill: "none", border: "s" },
      },
    ],
  };

  it("mover e redimensionar", () => {
    for (const [id, handle] of [
      ["m1", "move"],
      ["h1", "se"],
      ["a1", "to"],
      ["t1", "move"],
    ] as const) {
      const out = moveAnnotation(ann, id, handle, 0.02, 0.02);
      const all = [...out.markers, ...out.highlights, ...out.arrows, ...out.hotspots];
      expect(all.find((i) => i.id === id)?.style).toEqual(
        [...ann.markers, ...ann.highlights, ...ann.arrows, ...ann.hotspots].find((i) => i.id === id)?.style,
      );
    }
    expect(nudge(ann, "a1", "ArrowRight", false)?.arrows[0]?.style).toEqual({ stroke: "s" });
  });

  it("excluir um renumera os outros sem perder o estilo deles", () => {
    expect(removeAnnotation(ann, "m1").markers[0]).toMatchObject({ id: "m2", n: 1, style: { border: "none" } });
  });

  it("legenda e legenda editada", () => {
    expect(updateMarker(ann, "m1", "Botão").markers[0]?.style).toEqual({ color: "red", size: "l" });
    expect(updateHotspot(ann, "t1", { type: "url", href: "https://b.com" }).hotspots[0]?.style).toEqual({
      fill: "none",
      border: "s",
    });
  });
});

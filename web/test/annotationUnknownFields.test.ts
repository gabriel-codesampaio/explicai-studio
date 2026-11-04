import { describe, expect, it } from "vitest";
import {
  type Annotations,
  addMarker,
  addShape,
  moveAnnotation,
  removeAnnotation,
  updateHotspot,
  updateMarker,
} from "../src/lib/annotations";
import { cropAnnotations } from "../src/lib/cropAnnotations";

// T-264: o editor reconstrói objetos ao editar; campo que ele não conhece tem de sobreviver (raiz e cada tipo de item).
const extra = { futuro: 1 };
const base = (): Annotations =>
  ({
    version: 1,
    ...extra,
    markers: [{ id: "m1", n: 1, x: 0.5, y: 0.5, ...extra }],
    highlights: [{ id: "h1", x: 0.4, y: 0.4, w: 0.2, h: 0.2, ...extra }],
    arrows: [{ id: "a1", from: { x: 0.4, y: 0.4 }, to: { x: 0.6, y: 0.6 }, ...extra }],
    hotspots: [{ id: "s1", x: 0.4, y: 0.4, w: 0.2, h: 0.2, target: { type: "url", href: "https://x.y" }, ...extra }],
  }) as Annotations;

const keeps = (a: Annotations) => {
  expect(a).toMatchObject(extra);
  for (const list of [a.markers, a.highlights, a.arrows, a.hotspots]) {
    expect(list.length).toBeGreaterThan(0);
    for (const item of list) if (item.id.endsWith("1")) expect(item).toMatchObject(extra);
  }
};

describe("editor de marcações preserva campo desconhecido", () => {
  it("mover, renomear, redirecionar, adicionar e remover", () => {
    let a = base();
    for (const id of ["m1", "h1", "a1", "s1"]) a = moveAnnotation(a, id, "move", 0.01, 0.01);
    a = moveAnnotation(a, "h1", "se", 0.01, 0.01);
    a = moveAnnotation(a, "a1", "to", 0.01, 0.01);
    a = updateMarker(a, "m1", "novo");
    a = updateHotspot(a, "s1", { type: "page", pageId: "p" });
    a = addMarker(a, { x: 0.1, y: 0.1 });
    a = addShape(a, "arrow", { x: 0, y: 0 }, { x: 1, y: 1 }, { type: "url", href: "" }) ?? a;
    keeps(a);
    keeps(removeAnnotation(a, "m2"));
  });

  it("recortar", () => {
    keeps(cropAnnotations(base(), { x: 0.2, y: 0.2, w: 0.7, h: 0.7 }).annotations);
  });
});

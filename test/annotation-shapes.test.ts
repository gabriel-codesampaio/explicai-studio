import { describe, expect, it } from "vitest";
import { arrowShape, legendRows } from "../src/core/export/annotationShapes.js";
import { arrowShape as arrowWeb, legendRows as rowsWeb } from "../web/src/lib/annotationShapes.js";

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

describe("geometria da seta", () => {
  const angles = [0, 30, 45, 90, 135, 180, 225, 300].map((d) => (d * Math.PI) / 180);

  it("ponta fechada: triângulo com o vértice em `to`, base perpendicular à haste, em qualquer ângulo", () => {
    for (const a of angles) {
      const from = { x: 100, y: 100 };
      const to = { x: 100 + 200 * Math.cos(a), y: 100 + 200 * Math.sin(a) };
      const { head, shaft } = arrowShape(from, to, 4);
      expect(head[0]).toEqual(to);
      expect(dist(head[1], head[2])).toBeCloseTo(2 * 18 * 0.45); // 4,5 x espessura de comprimento
      const base = { x: (head[1].x + head[2].x) / 2, y: (head[1].y + head[2].y) / 2 };
      expect(dist(base, to)).toBeCloseTo(18);
      // a base é perpendicular à direção da seta e o eixo passa pelo meio dela
      const ux = (to.x - from.x) / 200;
      const uy = (to.y - from.y) / 200;
      expect((head[1].x - head[2].x) * ux + (head[1].y - head[2].y) * uy).toBeCloseTo(0);
      expect((to.x - base.x) * uy - (to.y - base.y) * ux).toBeCloseTo(0);
      // a haste termina dentro da ponta
      expect(dist({ x: shaft.x2, y: shaft.y2 }, to)).toBeLessThan(18);
      expect(shaft).toMatchObject({ x1: 100, y1: 100 });
    }
  });

  it("seta curta encolhe a ponta e continua com a haste dentro dela", () => {
    const { head, shaft } = arrowShape({ x: 0, y: 0 }, { x: 10, y: 0 }, 4);
    expect(dist(head[0], { x: (head[1].x + head[2].x) / 2, y: (head[1].y + head[2].y) / 2 })).toBeCloseTo(7);
    expect(shaft.x2).toBeGreaterThan(0);
    expect(shaft.x2).toBeLessThanOrEqual(10);
  });

  it("seta de comprimento zero não gera NaN", () => {
    const { head, shaft } = arrowShape({ x: 5, y: 5 }, { x: 5, y: 5 }, 4);
    for (const n of [...Object.values(shaft), ...head.flatMap((p) => [p.x, p.y])]) expect(Number.isFinite(n)).toBe(true);
  });

  it("o editor e o export desenham a mesma seta", () => {
    for (const a of angles) {
      const to = { x: 50 + 90 * Math.cos(a), y: 50 + 90 * Math.sin(a) };
      expect(arrowWeb({ x: 50, y: 50 }, to, 3.5)).toEqual(arrowShape({ x: 50, y: 50 }, to, 3.5));
    }
  });
});

describe("linhas da legenda", () => {
  const markers = [{ n: 3, label: "" }, { n: 1, label: "Botão" }, { n: 2 }, { n: 5, label: " " }, { n: 4, label: "Campo" }];

  it("ordena por número e junta os sem descrição em sequência numa linha", () => {
    expect(legendRows(markers)).toEqual([
      { numbers: [1], label: "Botão" },
      { numbers: [2, 3], label: "" },
      { numbers: [4], label: "Campo" },
      { numbers: [5], label: "" },
    ]);
  });

  it("o editor e o export montam a mesma legenda", () => {
    expect(rowsWeb(markers)).toEqual(legendRows(markers));
  });
});

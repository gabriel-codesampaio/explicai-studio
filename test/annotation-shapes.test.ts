import { describe, expect, it } from "vitest";
import { arrowShape, legendRows, MARKER_DISC, placeMarkers } from "../src/core/export/annotationShapes.js";
import { arrowShape as arrowWeb, placeMarkers as placeWeb, legendRows as rowsWeb } from "../web/src/lib/annotationShapes.js";

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

  it("ordena por número e deixa de fora o marcador sem descrição", () => {
    expect(legendRows(markers)).toEqual([
      { n: 1, label: "Botão" },
      { n: 4, label: "Campo" },
    ]);
  });

  it("só marcadores sem descrição: nenhuma linha", () => {
    expect(legendRows(Array.from({ length: 8 }, (_, i) => ({ n: i + 1 })))).toEqual([]);
  });

  it("o editor e o export montam a mesma legenda", () => {
    expect(rowsWeb(markers)).toEqual(legendRows(markers));
  });
});

describe("posição do marcador (disco com cauda)", () => {
  const R = MARKER_DISC / 2;
  const [W, H] = [800, 600];
  const inside = (c: { x: number; y: number }) => c.x >= R && c.x <= W - R && c.y >= R && c.y <= H - R;

  it("a ponta da cauda é o alvo e o disco fica ao lado dele, dentro da imagem, em qualquer canto", () => {
    const targets = [
      { x: 400, y: 300 },
      { x: 2, y: 2 },
      { x: W - 2, y: 2 },
      { x: 2, y: H - 2 },
      { x: W - 2, y: H - 2 },
      { x: 400, y: 1 },
    ];
    for (const [i, s] of placeMarkers(targets, W, H).entries()) {
      const t = targets[i] as { x: number; y: number };
      expect(s.tail?.[0]).toEqual({ x: 0, y: 0 });
      expect(Math.hypot(s.disc.x, s.disc.y)).toBeGreaterThan(R);
      expect(inside({ x: t.x + s.disc.x, y: t.y + s.disc.y })).toBe(true);
      for (const p of s.tail ?? [])
        expect([t.x + p.x >= 0, t.x + p.x <= W, t.y + p.y >= 0, t.y + p.y <= H]).toEqual([true, true, true, true]);
    }
  });

  it("o disco sobe e vai para o lado com mais espaço", () => {
    const [left, right] = placeMarkers(
      [
        { x: 100, y: 300 },
        { x: 700, y: 300 },
      ],
      W,
      H,
    );
    expect(left?.disc.y).toBeLessThan(0);
    expect(left?.disc.x).toBeGreaterThan(0);
    expect(right?.disc.x).toBeLessThan(0);
  });

  it("marcadores vizinhos não se cobrem: discos separados e nenhum disco sobre o alvo de outro", () => {
    // Os 8 marcadores reais do manual-do-comercial (imagem 1200 x 700) e uma fila apertada.
    const real = [
      [0.338, 0.19],
      [0.602, 0.225],
      [0.824, 0.243],
      [0.821, 0.467],
      [0.427, 0.604],
      [0.214, 0.671],
      [0.205, 0.777],
      [0.427, 0.826],
    ].map(([x, y]) => ({ x: (x as number) * 1200, y: (y as number) * 700 }));
    const rows = Array.from({ length: 6 }, (_, i) => ({ x: 100 + i * 20, y: 300 }));
    for (const [pts, w, h] of [
      [real, 1200, 700],
      [rows, W, H],
    ] as const) {
      const shapes = placeMarkers([...pts], w, h);
      const centers = shapes.map((s, i) => ({ x: (pts[i]?.x ?? 0) + s.disc.x, y: (pts[i]?.y ?? 0) + s.disc.y }));
      centers.forEach((c, i) => {
        pts.forEach((t, j) => {
          if (i !== j) expect(dist(c, t)).toBeGreaterThanOrEqual(R);
        });
        for (const o of centers.slice(i + 1)) expect(dist(c, o)).toBeGreaterThanOrEqual(MARKER_DISC);
      });
    }
  });

  it("o editor e o export desenham o mesmo marcador", () => {
    const pts = [
      { x: 10, y: 10 },
      { x: 400, y: 300 },
      { x: 790, y: 590 },
    ];
    expect(placeWeb(pts, W, H)).toEqual(placeMarkers(pts, W, H));
  });
});

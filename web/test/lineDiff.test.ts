import { expect, it } from "vitest";
import { lineDiff, MAX_DIFF_LINES } from "../src/lib/conflictDiff";

const lines = (n: number, f = (i: number) => `linha ${i}`) => Array.from({ length: n }, (_, i) => f(i)).join("\n");

it("textos iguais não têm diferença", () => {
  expect(lineDiff("a\nb", "a\nb")).toBeNull();
});

it("alinha removidas, adicionadas e trocadas lado a lado", () => {
  expect(lineDiff("a\nb\nc", "a\nB\nc\nd")).toEqual({
    coarse: false,
    rows: [
      { left: "a", right: "a", changed: false },
      { left: "b", right: "B", changed: true },
      { left: "c", right: "c", changed: false },
      { left: null, right: "d", changed: true },
    ],
  });
  const r = lineDiff("a\nx\nb", "a\nb");
  expect(r && "rows" in r && r.rows[1]).toEqual({ left: "x", right: null, changed: true });
});

it("página de 5000 linhas com edições espalhadas compara rápido e certo", () => {
  const a = lines(5000);
  const b = lines(5000, (i) => (i % 500 === 0 ? `mudou ${i}` : `linha ${i}`));
  const t0 = performance.now();
  const r = lineDiff(a, b);
  expect(performance.now() - t0).toBeLessThan(2000);
  expect(r && "rows" in r && r.rows.filter((x) => x.changed)).toHaveLength(10);
});

it("5000 linhas todas diferentes caem no modo grosso sem travar", () => {
  const t0 = performance.now();
  const r = lineDiff(
    lines(5000),
    lines(5000, (i) => `outra ${i}`),
  );
  expect(performance.now() - t0).toBeLessThan(2000);
  expect(r && "rows" in r && r.coarse).toBe(true);
  expect(r && "rows" in r && r.rows).toHaveLength(5000);
});

it("acima do limite de linhas não compara", () => {
  expect(lineDiff(lines(MAX_DIFF_LINES + 1), "x")).toEqual({ tooBig: true });
});

it("as linhas dos dois painéis refazem os dois textos (textos aleatórios)", () => {
  let seed = 7;
  const rnd = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % n;
  };
  for (let k = 0; k < 200; k++) {
    const gen = () => Array.from({ length: rnd(12) }, () => `l${rnd(4)}`).join("\n");
    const [a, b] = [gen(), gen()];
    const r = lineDiff(a, b);
    if (r === null) continue;
    if (!("rows" in r)) throw new Error("grande demais");
    const side = (key: "left" | "right") => r.rows.map((x) => x[key]).filter((x) => x !== null);
    // texto vazio vira uma linha vazia; só comparamos quando há linhas de verdade
    expect(side("left").join("\n")).toBe(a);
    expect(side("right").join("\n")).toBe(b);
  }
});

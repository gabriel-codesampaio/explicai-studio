import { describe, expect, it } from "vitest";
import { numberPages, type TreeItem } from "../src/lib/tree";

// T-205: orçamento de numerar 500 páginas (docs/desempenho.md). Medido 0,03 ms; teto 50 ms.
describe("orçamento da numeração", () => {
  it("500 páginas numeram em menos de 50 ms", () => {
    const items: TreeItem[] = Array.from(
      { length: 500 },
      (_, i) => ({ id: `p${i}`, title: `P${i}`, children: [] }) as unknown as TreeItem,
    );
    const t0 = performance.now();
    const n = numberPages(items);
    expect(performance.now() - t0).toBeLessThan(50);
    expect(n.size).toBe(500);
  });
});

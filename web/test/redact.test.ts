import { describe, expect, it } from "vitest";
import { blurBlock, paintRedactions, REDACT_RGB } from "../src/lib/redact";

/** Imagem w×h com um padrão que muda a cada pixel, para notar qualquer pixel de fora que mude. */
function image(width: number, height: number) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) data.set([i % 251, (i * 7) % 253, (i * 13) % 255, 200], i * 4);
  return { data, width, height };
}
const px = (img: ReturnType<typeof image>, x: number, y: number) => [
  ...img.data.slice((y * img.width + x) * 4, (y * img.width + x) * 4 + 4),
];

describe("paintRedactions", () => {
  it("pinta opaco dentro do retângulo e não mexe no resto", () => {
    const before = image(20, 10);
    const after = paintRedactions(image(20, 10), [{ x: 0.25, y: 0.2, w: 0.5, h: 0.5 }]);
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 20; x++) {
        const inside = x >= 5 && x < 15 && y >= 2 && y < 7;
        expect(px(after, x, y)).toEqual(inside ? [...REDACT_RGB, 255] : px(before, x, y));
      }
    }
  });

  it("arredonda para fora: nunca cobre menos que o retângulo", () => {
    const img = paintRedactions(image(10, 10), [{ x: 0.12, y: 0.12, w: 0.11, h: 0.11 }]);
    expect(px(img, 1, 1)).toEqual([...REDACT_RGB, 255]);
    expect(px(img, 2, 2)).toEqual([...REDACT_RGB, 255]);
    expect(px(img, 3, 3)).not.toEqual([...REDACT_RGB, 255]);
  });

  it("retângulo que passa da borda é cortado na imagem", () => {
    const img = paintRedactions(image(4, 4), [{ x: 0.5, y: 0.5, w: 2, h: 2 }]);
    expect(px(img, 3, 3)).toEqual([...REDACT_RGB, 255]);
    expect(img.data.length).toBe(64);
  });
});

describe("paintRedactions em desfoque", () => {
  it("não mexe fora da área e apaga o detalhe dentro: nenhum bloco varia além do limite", () => {
    const rect = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
    const before = image(100, 100);
    const after = paintRedactions(image(100, 100), [rect], "blur");
    const [x0, y0, x1, y1] = [10, 10, 90, 90];
    for (let y = 0; y < 100; y++)
      for (let x = 0; x < 100; x++) if (x < x0 || x >= x1 || y < y0 || y >= y1) expect(px(after, x, y)).toEqual(px(before, x, y));
    const block = blurBlock(80);
    expect(block).toBe(20);
    // O original varia até ~250 entre pixels vizinhos; borrado, cada bloco varia pouco em todos os canais.
    for (let by = y0; by < y1; by += block)
      for (let bx = x0; bx < x1; bx += block)
        for (let c = 0; c < 3; c++) {
          const v: number[] = [];
          for (let y = by; y < Math.min(y1, by + block); y++)
            for (let x = bx; x < Math.min(x1, bx + block); x++) v.push(px(after, x, y)[c] ?? 0);
          expect(Math.max(...v) - Math.min(...v)).toBeLessThan(40);
        }
    expect(px(after, 50, 50)[3]).toBe(255);
  });

  it("bloco tem no mínimo 12 px e 1/4 da altura", () => {
    expect(blurBlock(20)).toBe(12);
    expect(blurBlock(200)).toBe(50);
  });
});

import { describe, expect, it } from "vitest";
import { paintRedactions, REDACT_RGB } from "../src/lib/redact";

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

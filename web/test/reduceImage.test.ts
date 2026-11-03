import { describe, expect, it } from "vitest";
import { hasQuality, reducedSize } from "../src/lib/reduceImage";

describe("reducedSize", () => {
  it("mantém a proporção", () => expect(reducedSize(3200, 1800, 1600)).toEqual({ w: 1600, h: 900 }));
  it("nunca amplia nem repete a largura", () => {
    expect(reducedSize(1600, 900, 1600)).toBeNull();
    expect(reducedSize(800, 600, 1600)).toBeNull();
  });
  it("recusa largura inválida", () => {
    expect(reducedSize(2000, 1000, 0)).toBeNull();
    expect(reducedSize(2000, 1000, Number.NaN)).toBeNull();
  });
  it("nunca devolve altura zero", () => expect(reducedSize(10000, 2, 100)?.h).toBe(1));
});

describe("hasQuality", () => {
  it("só JPEG e WebP", () => {
    expect(hasQuality("assets/a.JPG")).toBe(true);
    expect(hasQuality("assets/a.webp")).toBe(true);
    expect(hasQuality("assets/a.png")).toBe(false);
    expect(hasQuality("assets/a.gif")).toBe(false);
  });
});

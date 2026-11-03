import { describe, expect, it } from "vitest";
import { snapCrop } from "../src/lib/cropImage";

describe("snapCrop", () => {
  it("alinha a pixels inteiros", () => {
    const r = snapCrop({ x: 0.2501, y: 0.1, w: 0.4999, h: 0.5 }, 100, 200);
    expect(r).toEqual({ x: 0.25, y: 0.1, w: 0.5, h: 0.5 });
  });
  it("nunca fica com menos de 1 px nem sai da imagem", () => {
    expect(snapCrop({ x: 0.999, y: 0, w: 0.0001, h: 1 }, 100, 100)).toEqual({ x: 0.99, y: 0, w: 0.01, h: 1 });
    expect(snapCrop({ x: -0.1, y: 0.5, w: 2, h: 0.8 }, 100, 100)).toMatchObject({ x: 0, w: 1 });
  });
});

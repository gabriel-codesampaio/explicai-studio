import { describe, expect, it } from "vitest";
import { ASPECT_LIMIT, aspectChanged } from "../src/lib/imageAspect";

describe("aviso de proporção ao trocar a imagem", () => {
  it("o limite é de 2%", () => expect(ASPECT_LIMIT).toBe(0.02));
  it("mesma proporção em outro tamanho não avisa", () =>
    expect(aspectChanged({ w: 1000, h: 500 }, { w: 2000, h: 1000 })).toBe(false));
  it("diferença de até 2% não avisa", () => expect(aspectChanged({ w: 1000, h: 500 }, { w: 1019, h: 500 })).toBe(false));
  it("diferença acima de 2% avisa, para mais ou para menos", () => {
    expect(aspectChanged({ w: 1000, h: 500 }, { w: 1030, h: 500 })).toBe(true);
    expect(aspectChanged({ w: 1000, h: 500 }, { w: 1000, h: 520 })).toBe(true);
  });
  it("tamanho desconhecido ou zero avisa, por segurança", () => {
    expect(aspectChanged({ w: 0, h: 500 }, { w: 1000, h: 500 })).toBe(true);
  });
});

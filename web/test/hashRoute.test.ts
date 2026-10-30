// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { readLocation, writeLocation } from "../src/lib/hashRoute";

beforeEach(() => window.history.replaceState(null, "", "/"));

describe("hashRoute", () => {
  it("lê manual e página do hash", () => {
    window.location.hash = "#/meu-manual/pag-1";
    expect(readLocation()).toEqual({ slug: "meu-manual", pageId: "pag-1" });
  });

  it("hash vazio ou só o manual deixa o resto nulo", () => {
    expect(readLocation()).toEqual({ slug: null, pageId: null });
    window.location.hash = "#/meu-manual";
    expect(readLocation()).toEqual({ slug: "meu-manual", pageId: null });
  });

  it("decodifica nomes com acento e espaço", () => {
    window.location.hash = `#/${encodeURIComponent("guia rápido")}/${encodeURIComponent("página 1")}`;
    expect(readLocation()).toEqual({ slug: "guia rápido", pageId: "página 1" });
  });

  it("hash com % malformado não lança: vira o texto cru", () => {
    for (const h of ["#/%", "#/%E0%A4%A/x", "#/m/%zz"]) {
      window.location.hash = h;
      expect(() => readLocation()).not.toThrow();
    }
    window.location.hash = "#/%/p";
    expect(readLocation()).toEqual({ slug: "%", pageId: "p" });
  });

  it("escreve o hash codificado e a ida e volta devolve o mesmo lugar", () => {
    const place = { slug: "guia rápido", pageId: "a/b" };
    writeLocation(place);
    expect(window.location.hash).toBe("#/guia%20r%C3%A1pido/a%2Fb");
    expect(readLocation()).toEqual(place);
  });

  it("sem página escreve só o manual, e sem manual escreve a raiz", () => {
    writeLocation({ slug: "m", pageId: null });
    expect(window.location.hash).toBe("#/m");
    writeLocation({ slug: null, pageId: "x" });
    expect(window.location.hash).toBe("#/");
  });

  it("não acrescenta entrada no histórico ao escrever o mesmo hash", () => {
    writeLocation({ slug: "m", pageId: "p" });
    const before = window.history.length;
    writeLocation({ slug: "m", pageId: "p" });
    expect(window.history.length).toBe(before);
  });
});

import { describe, expect, it } from "vitest";
import { normalizeHref } from "../src/lib/links";

describe("endereço do link", () => {
  it("completa https:// quando falta o protocolo", () => {
    expect(normalizeHref("codesampa.io")).toBe("https://codesampa.io");
    expect(normalizeHref("  exemplo.com/ajuda ")).toBe("https://exemplo.com/ajuda");
  });

  it("mantém links completos, âncoras, caminhos e e-mail", () => {
    for (const href of ["http://localhost:3000", "https://a.b", "#cadastro", "/pagina", "mailto:a@b.com"]) {
      expect(normalizeHref(href)).toBe(href);
    }
  });

  it("vazio continua vazio (remove o link)", () => {
    expect(normalizeHref("   ")).toBe("");
  });
});

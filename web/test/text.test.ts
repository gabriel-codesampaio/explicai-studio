import { describe, expect, it } from "vitest";
import { decodeComponent, fold } from "../src/lib/text";

describe("fold", () => {
  it("tira acentos, maiúsculas e espaços nas pontas", () => {
    expect(fold("  Título Ação  ")).toBe("titulo acao");
    expect(fold("Título")).toBe(fold("titulo"));
  });

  it("junta a forma composta e a decomposta do mesmo acento", () => {
    expect(fold("é")).toBe(fold("é"));
  });

  it("mantém os espaços do meio e aceita texto vazio", () => {
    expect(fold("a  b")).toBe("a  b");
    expect(fold("")).toBe("");
  });
});

describe("decodeComponent", () => {
  it("decodifica o que é válido e devolve o texto cru quando o % é malformado", () => {
    expect(decodeComponent("guia%20r%C3%A1pido")).toBe("guia rápido");
    for (const bad of ["%", "%E0%A4%A", "100%.png", "%zz"]) expect(decodeComponent(bad)).toBe(bad);
  });
});

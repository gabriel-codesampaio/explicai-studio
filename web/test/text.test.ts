import { describe, expect, it } from "vitest";
import { fold } from "../src/lib/text";

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

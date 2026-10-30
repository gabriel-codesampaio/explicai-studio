import { describe, expect, it } from "vitest";
import { BLOCKS, searchBlocks } from "../src/features/editor/blocks";

describe("busca do menu /", () => {
  it("mostra todos os blocos sem texto digitado", () => {
    expect(searchBlocks("")).toHaveLength(BLOCKS.length);
  });

  it("ignora acentos e maiúsculas", () => {
    expect(searchBlocks("TITULO").map((b) => b.id)).toEqual(["h1", "h2", "h3"]);
  });

  it("acha pelo jeito que o usuário fala", () => {
    expect(searchBlocks("print").map((b) => b.id)).toEqual(["image"]);
    expect(searchBlocks("passo").map((b) => b.id)).toContain("steps");
  });

  it("devolve lista vazia quando nada combina", () => {
    expect(searchBlocks("xyz")).toEqual([]);
  });
});

describe("blocos de alerta", () => {
  it("entram pelo menu / com o jeito que o usuário fala", () => {
    expect(searchBlocks("dica").map((b) => b.id)).toContain("callout-tip");
    expect(searchBlocks("alerta").map((b) => b.id)).toEqual([
      "callout-tip",
      "callout-warning",
      "callout-caution",
      "callout-note",
    ]);
  });

  it("aparecem no seletor de tipo de bloco", () => {
    expect(BLOCKS.filter((b) => b.id.startsWith("callout-") && b.isTextType)).toHaveLength(4);
  });
});

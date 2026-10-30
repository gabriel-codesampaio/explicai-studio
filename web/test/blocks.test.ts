import { describe, expect, it } from "vitest";
import { BLOCKS, groupBlocks, searchBlocks } from "../src/features/editor/blocks";

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

describe("grupos do menu /", () => {
  it("separam estrutura, passo a passo, alertas e mídia, nessa ordem", () => {
    expect(groupBlocks(searchBlocks("")).map((g) => [g.id, g.items.map((b) => b.id)])).toEqual([
      ["estrutura", ["paragraph", "h1", "h2", "h3", "bullets", "quote", "code"]],
      ["passos", ["steps", "result"]],
      ["alertas", ["callout-tip", "callout-warning", "callout-caution", "callout-note"]],
      ["midia", ["image", "table"]],
    ]);
  });

  it("a busca devolve os itens na ordem dos grupos, que é a ordem das setas", () => {
    expect(searchBlocks("passo").map((b) => b.id)).toEqual(["steps", "result"]);
    const flat = groupBlocks(searchBlocks("")).flatMap((g) => g.items.map((b) => b.id));
    expect(searchBlocks("").map((b) => b.id)).toEqual(flat);
  });

  it("grupo sem resultado some", () => {
    expect(groupBlocks(searchBlocks("tabela")).map((g) => g.id)).toEqual(["midia"]);
  });

  it("acha em inglês e em português", () => {
    expect(searchBlocks("result").map((b) => b.id)).toContain("result");
    expect(searchBlocks("snippet").map((b) => b.id)).toEqual(["code"]);
    expect(searchBlocks("secao").map((b) => b.id)).toEqual(["h1", "h2", "h3"]);
  });
});

import { describe, expect, it } from "vitest";
import { BLOCK_GROUPS, BLOCKS, groupBlocks, searchBlocks } from "../src/features/editor/blocks";

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

describe("grupos do menu /", () => {
  it("todo bloco tem um grupo conhecido", () => {
    const ids = BLOCK_GROUPS.map((g) => g.id);
    for (const b of BLOCKS) expect(ids).toContain(b.group);
  });

  it("os grupos vêm na ordem Estrutura, Passo a passo, Mídia", () => {
    expect(groupBlocks(searchBlocks("")).map((g) => g.label)).toEqual(["Estrutura", "Passo a passo", "Mídia"]);
  });

  it("a lista da busca já vem na ordem dos grupos, para as setas seguirem o que aparece", () => {
    expect(searchBlocks("")).toEqual(groupBlocks(searchBlocks("")).flatMap((g) => g.items));
  });

  it("a busca mantém só os grupos com resultado", () => {
    expect(groupBlocks(searchBlocks("titulo")).map((g) => g.id)).toEqual(["estrutura"]);
    expect(groupBlocks(searchBlocks("passo")).map((g) => g.id)).toEqual(["passos"]);
  });

  it("acha em inglês e em português", () => {
    expect(searchBlocks("screenshot").map((b) => b.id)).toEqual(["image"]);
    expect(searchBlocks("resultado").map((b) => b.id)).toEqual(["result"]);
    expect(searchBlocks("expected").map((b) => b.id)).toEqual(["result"]);
  });

  it("sem resultado, nenhum grupo", () => {
    expect(groupBlocks(searchBlocks("xyz"))).toEqual([]);
  });
});

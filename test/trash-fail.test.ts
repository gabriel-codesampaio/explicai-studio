import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ failRename: false }));
vi.mock("node:fs/promises", async (importOriginal) => {
  const real = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...real,
    rename: async (from: string, to: string) => {
      if (state.failRename && String(to).includes(".lixeira")) throw Object.assign(new Error("busy"), { code: "EBUSY" });
      return real.rename(from, to);
    },
  };
});

import { addPage, createManual, flatten, listTrash, readManual, readPage, removePage } from "../src/core/index.js";

let workspace: string;
beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-trash-fail-"));
});
afterEach(async () => {
  state.failRename = false;
  await rm(workspace, { recursive: true, force: true });
});

describe("removePage com falha ao mover", () => {
  it("EBUSY no rename deixa a página na árvore, com o arquivo no lugar, e nada na lixeira", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const page = await addPage(dir, { title: "A", body: "texto" });
    state.failRename = true;
    await expect(removePage(dir, page.id)).rejects.toThrow("busy");
    expect(flatten((await readManual(dir)).pages).map((n) => n.id)).toEqual([page.id]);
    expect((await readPage(dir, page.id)).body).toBe("texto");
    expect(await listTrash(dir)).toEqual([]);
  });
});

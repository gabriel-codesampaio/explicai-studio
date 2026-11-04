import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addPage,
  createManual,
  ExplicaiError,
  listManuals,
  readManual,
  readPage,
  readPageTree,
  updatePage,
} from "../src/core/index.js";

// T-201: manual de formato maior abre só para leitura e nunca é regravado.
let workspace: string;
let dir: string;
let pageId: string;
let before: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-newer-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
  pageId = (await addPage(dir, { title: "A", body: "texto" })).id;
  const file = path.join(dir, "manual.json");
  const meta = JSON.parse(await readFile(file, "utf8"));
  await writeFile(file, JSON.stringify({ ...meta, version: 2 }));
  before = await readFile(file, "utf8");
});
afterEach(() => rm(workspace, { recursive: true, force: true }));

describe("manual de formato mais novo", () => {
  it("leitura estrita recusa com erro acionável", async () => {
    const err = await readManual(dir).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ExplicaiError);
    expect(err).toMatchObject({ code: "format-newer", params: { version: 2, supported: 1 } });
    expect((err as Error).message).toMatch(/Atualize o Studio/);
  });

  it("aparece na lista e abre em leitura com allowNewer", async () => {
    expect((await listManuals(workspace)).map((m) => m.meta.title)).toEqual(["M"]);
    expect((await readManual(dir, { allowNewer: true })).version).toBe(2);
    expect(await readPageTree(dir, { allowNewer: true })).toHaveLength(1);
    expect((await readPage(dir, pageId, { allowNewer: true })).body).toContain("texto");
  });

  it("não regrava: escrita recusa e manual.json fica igual", async () => {
    await expect(updatePage(dir, pageId, { title: "B" })).rejects.toMatchObject({ code: "format-newer" });
    await expect(addPage(dir, { title: "C" })).rejects.toMatchObject({ code: "format-newer" });
    expect(await readFile(path.join(dir, "manual.json"), "utf8")).toBe(before);
  });

  it("versão inválida segue com o erro antigo", async () => {
    await writeFile(path.join(dir, "manual.json"), JSON.stringify({ version: 0 }));
    await expect(readManual(dir, { allowNewer: true })).rejects.toThrow(/não suportada/);
  });
});

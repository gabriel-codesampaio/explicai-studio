import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

// Simula a imagem apagada entre a listagem e o stat.
vi.mock("node:fs/promises", async (orig) => {
  const fs = await orig<typeof import("node:fs/promises")>();
  return {
    ...fs,
    stat: (p: string, ...rest: unknown[]) =>
      String(p).endsWith("sumiu.png")
        ? Promise.reject(Object.assign(new Error("ENOENT"), { code: "ENOENT" }))
        : (fs.stat as (...a: unknown[]) => Promise<unknown>)(p, ...rest),
  };
});

const { createManual, findUnusedAssets } = await import("../src/core/index.js");

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-race-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

it("arquivo que some entre a listagem e o stat é ignorado, sem derrubar a busca", async () => {
  process.env.EXPLICAI_ASSET_GRACE_MS = "0";
  await writeFile(path.join(dir, "assets", "sumiu.png"), "x");
  await writeFile(path.join(dir, "assets", "solta.png"), "x");
  expect(await findUnusedAssets(dir)).toEqual(["assets/solta.png"]);
});

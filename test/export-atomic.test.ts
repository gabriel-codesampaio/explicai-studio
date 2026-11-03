import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { addPage, createManual, exportManual } from "../src/core/index.js";

const fake = vi.hoisted(() => ({ fail: false }));
vi.mock("../src/core/export/html.js", async (importOriginal) => {
  const real = await importOriginal<typeof import("../src/core/export/html.js")>();
  return {
    ...real,
    renderHtml: (...args: Parameters<typeof real.renderHtml>) => {
      if (fake.fail) throw new Error("falha simulada");
      return real.renderHtml(...args);
    },
  };
});

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-export-atomic-"));
  dir = (await createManual(workspace, { title: "Financeiro Pro", language: "pt-BR" })).dir;
  await addPage(dir, { title: "Visão geral", body: "Comece por aqui." });
  fake.fail = false;
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

it("mantém a exportação anterior quando a nova falha no meio", async () => {
  await exportManual(dir, "html");
  const index = path.join(dir, "exportacao/html/index.html");
  const before = await readFile(index, "utf8");

  fake.fail = true;
  await expect(exportManual(dir, "html")).rejects.toThrow("falha simulada");

  expect(await readFile(index, "utf8")).toBe(before);
  expect(await readdir(path.join(dir, "exportacao"))).toEqual(["html"]); // sem pasta temporária sobrando
});
